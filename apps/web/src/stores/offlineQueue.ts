export type QueuedLead = {
  id: string
  createdAt: string
  payload: Record<string, unknown>
  attachments?: {
    photoKeys?: string[]
  }
}

const STORAGE_KEY = 'vamo-heatos-offline-queue'

const loadQueue = (): QueuedLead[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as QueuedLead[]
  } catch {
    return []
  }
}

const saveQueue = (queue: QueuedLead[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
}

export const enqueueLead = (
  payload: Record<string, unknown>,
  attachments?: QueuedLead['attachments'],
) => {
  const queue = loadQueue()
  const entry: QueuedLead = {
    id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    createdAt: new Date().toISOString(),
    payload,
    attachments,
  }
  queue.push(entry)
  saveQueue(queue)
  return entry
}

export const flushQueue = async (
  submit: (payload: Record<string, unknown>, attachments?: QueuedLead['attachments']) => Promise<boolean>,
) => {
  const queue = loadQueue()
  if (!queue.length) return 0

  const remaining: QueuedLead[] = []
  for (const entry of queue) {
    const ok = await submit(entry.payload, entry.attachments)
    if (!ok) {
      remaining.push(entry)
    }
  }

  saveQueue(remaining)
  return remaining.length
}

export const getQueueSize = () => loadQueue().length
