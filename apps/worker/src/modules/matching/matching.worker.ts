import { Worker } from 'bullmq'
import { redisConnection } from '../../lib/redis'
import { QUEUE_NAMES } from '../../lib/queues'
import { runMatchingForJob } from './matching.service'

export const matchingWorker = new Worker(
  QUEUE_NAMES.matching,
  async (job) => {
    const { jobId } = job.data as { jobId: string }
    return runMatchingForJob(jobId)
  },
  { connection: redisConnection },
)
