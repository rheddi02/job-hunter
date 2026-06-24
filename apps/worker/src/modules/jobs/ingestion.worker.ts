import { Worker } from 'bullmq'
import { redisConnection } from '../../lib/redis'
import { QUEUE_NAMES } from '../../lib/queues'
import { ingestSource } from './ingestion.service'

export const ingestionWorker = new Worker(
  QUEUE_NAMES.ingestion,
  async (job) => {
    const { sourceId } = job.data as { sourceId: string }
    return ingestSource(sourceId)
  },
  { connection: redisConnection },
)
