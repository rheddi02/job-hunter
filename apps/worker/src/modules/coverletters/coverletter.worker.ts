import { Worker } from 'bullmq'
import { redisConnection } from '../../lib/redis'
import { QUEUE_NAMES } from '../../lib/queues'

export const coverletterWorker = new Worker(
  QUEUE_NAMES.coverletters,
  async (_job) => {
    // TODO Phase 1: implement cover letter generation
  },
  { connection: redisConnection },
)
