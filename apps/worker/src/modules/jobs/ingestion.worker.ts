import { Worker } from 'bullmq'
import { redisConnection } from '../../lib/redis'
import { QUEUE_NAMES } from '../../lib/queues'

export const ingestionWorker = new Worker(
  QUEUE_NAMES.ingestion,
  async (_job) => {
    // TODO Phase 1: implement job source ingestion
  },
  { connection: redisConnection },
)
