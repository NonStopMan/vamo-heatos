type StoredPhoto = {
  id: string
  name: string
  type: string
  blob: Blob
}

const DB_NAME = 'vamo-heatos-offline-photos'
const STORE_NAME = 'photos'
const DB_VERSION = 1

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

export const saveOfflinePhotos = async (files: File[]): Promise<string[]> => {
  if (!files.length) return []
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const ids: string[] = []

  for (const file of files) {
    const id = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    ids.push(id)
    store.put({
      id,
      name: file.name,
      type: file.type,
      blob: file,
    } satisfies StoredPhoto)
  }

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
  db.close()
  return ids
}

export const getOfflinePhotos = async (ids: string[]): Promise<File[]> => {
  if (!ids.length) return []
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const files = await Promise.all(
    ids.map(
      (id) =>
        new Promise<File | null>((resolve, reject) => {
          const request = store.get(id)
          request.onsuccess = () => {
            const record = request.result as StoredPhoto | undefined
            if (!record) {
              resolve(null)
              return
            }
            resolve(new File([record.blob], record.name, { type: record.type }))
          }
          request.onerror = () => reject(request.error)
        }),
    ),
  )
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
  db.close()
  return files.filter((file): file is File => file !== null)
}

export const deleteOfflinePhotos = async (ids: string[]): Promise<void> => {
  if (!ids.length) return
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  ids.forEach((id) => store.delete(id))
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
  db.close()
}
