import { Queue } from 'bullmq'
import { redisConnection } from './redis'

export const QUEUE_NAMES = {
  ingestion: 'ingestion',
  matching: 'matching',
  coverletters: 'coverletters',
} as const

export const ingestionQueue = new Queue(QUEUE_NAMES.ingestion, { connection: redisConnection })
export const matchingQueue = new Queue(QUEUE_NAMES.matching, { connection: redisConnection })
export const coverletterQueue = new Queue(QUEUE_NAMES.coverletters, { connection: redisConnection })
