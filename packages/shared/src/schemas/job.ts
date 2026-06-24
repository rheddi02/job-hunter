import { z } from 'zod'

export const RemoteTypeSchema = z.enum(['REMOTE', 'HYBRID', 'ONSITE', 'UNKNOWN'])

export const NormalizedJobSchema = z.object({
  externalId: z.string(),
  title: z.string(),
  company: z.string(),
  description: z.string(),
  location: z.string().optional(),
  remoteType: RemoteTypeSchema.default('UNKNOWN'),
  url: z.string().url(),
  postedAt: z.coerce.date().optional(),
  closesAt: z.coerce.date().optional(),
  rawData: z.record(z.unknown()).optional(),
})

export type NormalizedJob = z.infer<typeof NormalizedJobSchema>

export interface JobSourceAdapter {
  fetchJobs(config: Record<string, unknown>): Promise<NormalizedJob[]>
  checkIsOpen(externalId: string, config: Record<string, unknown>): Promise<boolean>
}
