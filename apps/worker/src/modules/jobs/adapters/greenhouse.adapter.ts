import { NormalizedJobSchema, type JobSourceAdapter, type NormalizedJob } from '@jobpilot/shared'
import { JobSourceError } from './types'

interface GreenhouseConfig {
  boardTokens: string[]
  pollIntervalMinutes?: number
}

interface GreenhouseJob {
  id: number
  title: string
  content: string
  location: { name: string }
  absolute_url: string
  updated_at: string
  metadata: unknown[]
}

function toRemoteType(location: string): NormalizedJob['remoteType'] {
  const l = location.toLowerCase()
  if (l.includes('remote')) return 'REMOTE'
  if (l.includes('hybrid')) return 'HYBRID'
  return 'ONSITE'
}

export const greenhouseAdapter: JobSourceAdapter = {
  async fetchJobs(config): Promise<NormalizedJob[]> {
    const { boardTokens } = config as unknown as GreenhouseConfig
    if (!boardTokens?.length) return []

    const results: NormalizedJob[] = []

    for (const token of boardTokens) {
      const res = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`,
      )
      if (!res.ok) {
        throw new JobSourceError(`Greenhouse fetch failed for ${token}: ${res.status}`)
      }
      const data = (await res.json()) as { jobs: GreenhouseJob[] }
      for (const job of data.jobs) {
        const normalized = NormalizedJobSchema.safeParse({
          externalId: String(job.id),
          title: job.title,
          company: token,
          description: job.content ?? '',
          location: job.location?.name,
          remoteType: toRemoteType(job.location?.name ?? ''),
          url: job.absolute_url,
          postedAt: job.updated_at,
          rawData: job,
        })
        if (normalized.success) results.push(normalized.data)
      }
    }

    return results
  },

  async checkIsOpen(externalId, config): Promise<boolean> {
    const { boardTokens } = config as unknown as GreenhouseConfig
    for (const token of boardTokens) {
      const res = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${token}/jobs/${externalId}`,
      )
      if (res.ok) return true
    }
    return false
  },
}
