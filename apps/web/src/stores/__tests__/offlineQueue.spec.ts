import { beforeEach, describe, expect, it } from 'vitest'
import { enqueueLead, flushQueue, getQueueSize } from '../offlineQueue'

describe('offlineQueue', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('enqueues and flushes items', async () => {
    enqueueLead({ version: '1.2.0' })
    enqueueLead({ version: '1.2.0', id: 'a' }, { photoKeys: ['a', 'b'] })

    expect(getQueueSize()).toBe(2)

    const remaining = await flushQueue(async (_payload, attachments) => {
      if (attachments?.photoKeys?.length) {
        expect(attachments.photoKeys).toEqual(['a', 'b'])
      }
      return true
    })
    expect(remaining).toBe(0)
    expect(getQueueSize()).toBe(0)
  })

  it('keeps failed items in the queue', async () => {
    enqueueLead({ version: '1.2.0' })

    const remaining = await flushQueue(async () => false)
    expect(remaining).toBe(1)
    expect(getQueueSize()).toBe(1)
  })
})
