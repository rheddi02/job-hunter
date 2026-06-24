import { Worker } from 'bullmq'
import { redisConnection } from '../../lib/redis'
import { QUEUE_NAMES } from '../../lib/queues'

export const matchingWorker = new Worker(
  QUEUE_NAMES.matching,
  async (_job) => {
    // TODO Phase 1: implement CV vs. job matching
  },
  { connection: redisConnection },
)
