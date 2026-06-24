import { NormalizedJobSchema, type JobSourceAdapter, type NormalizedJob } from '@jobpilot/shared'
import { JobSourceError } from './types'

interface ArbeitnowConfig {
  pages?: number
}

interface ArbeitnowJob {
  slug: string
  title: string
  company_name: string
  description: string
  location: string
  remote: boolean
  url: string
  created_at: number
  tags: string[]
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[]
  links: { next?: string }
}

export const arbeitnowAdapter: JobSourceAdapter = {
  async fetchJobs(config): Promise<NormalizedJob[]> {
    const { pages = 1 } = config as ArbeitnowConfig
    const results: NormalizedJob[] = []
    let url: string | undefined = 'https://www.arbeitnow.com/api/job-board-api'

    for (let page = 0; page < pages && url; page++) {
      const res = await fetch(url)
      if (!res.ok) throw new JobSourceError(`Arbeitnow fetch failed: ${res.status}`)

      const body = (await res.json()) as ArbeitnowResponse

      for (const job of body.data) {
        const normalized = NormalizedJobSchema.safeParse({
          externalId: job.slug,
          title: job.title,
          company: job.company_name ?? 'Unknown',
          description: job.description ?? '',
          location: job.location,
          remoteType: job.remote ? 'REMOTE' : 'ONSITE',
          url: job.url,
          postedAt: job.created_at ? new Date(job.created_at * 1000) : undefined,
          rawData: job,
        })
        if (normalized.success) results.push(normalized.data)
      }

      url = body.links?.next
    }

    return results
  },

  async checkIsOpen(_externalId, _config): Promise<boolean> {
    // No single-posting lookup available; assume open.
    return true
  },
}
