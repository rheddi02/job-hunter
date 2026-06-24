import { NormalizedJobSchema, type JobSourceAdapter, type NormalizedJob } from '@jobpilot/shared'
import { JobSourceError } from './types'

interface AdzunaConfig {
  country?: string
  what?: string
  where?: string
  resultsPerPage?: number
  pollIntervalMinutes?: number
}

interface AdzunaResult {
  id: string
  title: string
  company: { display_name: string }
  description: string
  location: { display_name: string; area: string[] }
  redirect_url: string
  created: string
  contract_type?: string
}

function toRemoteType(title: string, desc: string, location: string): NormalizedJob['remoteType'] {
  const text = `${title} ${desc} ${location}`.toLowerCase()
  if (text.includes('remote')) return 'REMOTE'
  if (text.includes('hybrid')) return 'HYBRID'
  return 'ONSITE'
}

export const adzunaAdapter: JobSourceAdapter = {
  async fetchJobs(config): Promise<NormalizedJob[]> {
    const {
      country = 'gb',
      what = 'software engineer',
      where,
      resultsPerPage = 50,
    } = config as AdzunaConfig

    const appId = process.env.ADZUNA_APP_ID
    const appKey = process.env.ADZUNA_APP_KEY
    if (!appId || !appKey) {
      throw new JobSourceError('ADZUNA_APP_ID and ADZUNA_APP_KEY env vars are required')
    }

    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      results_per_page: String(resultsPerPage),
      what,
      content_type: 'application/json',
      ...(where ? { where } : {}),
    })

    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
    )
    if (!res.ok) {
      throw new JobSourceError(`Adzuna fetch failed: ${res.status}`)
    }

    const data = (await res.json()) as { results: AdzunaResult[] }
    const results: NormalizedJob[] = []

    for (const job of data.results) {
      const locationName = job.location?.display_name ?? ''
      const normalized = NormalizedJobSchema.safeParse({
        externalId: job.id,
        title: job.title,
        company: job.company?.display_name ?? 'Unknown',
        description: job.description ?? '',
        location: locationName,
        remoteType: toRemoteType(job.title, job.description ?? '', locationName),
        url: job.redirect_url,
        postedAt: job.created,
        rawData: job,
      })
      if (normalized.success) results.push(normalized.data)
    }

    return results
  },

  async checkIsOpen(_externalId, _config): Promise<boolean> {
    // Adzuna doesn't have a single-job lookup endpoint on the free tier.
    // Assume open — stale jobs will naturally disappear from search results.
    return true
  },
}
