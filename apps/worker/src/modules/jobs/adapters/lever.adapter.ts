import { NormalizedJobSchema, type JobSourceAdapter, type NormalizedJob } from '@jobpilot/shared'
import { JobSourceError } from './types'

interface LeverConfig {
  companies: string[]
  pollIntervalMinutes?: number
}

interface LeverPosting {
  id: string
  text: string
  description: string
  descriptionPlain: string
  categories: { location?: string; team?: string; commitment?: string }
  hostedUrl: string
  createdAt: number
}

function toRemoteType(commitment?: string, location?: string): NormalizedJob['remoteType'] {
  const text = `${commitment ?? ''} ${location ?? ''}`.toLowerCase()
  if (text.includes('remote')) return 'REMOTE'
  if (text.includes('hybrid')) return 'HYBRID'
  if (commitment?.toLowerCase().includes('contract') || commitment?.toLowerCase().includes('full'))
    return 'ONSITE'
  return 'UNKNOWN'
}

export const leverAdapter: JobSourceAdapter = {
  async fetchJobs(config): Promise<NormalizedJob[]> {
    const { companies } = config as unknown as LeverConfig
    if (!companies?.length) return []

    const results: NormalizedJob[] = []

    for (const company of companies) {
      const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`)
      if (!res.ok) {
        throw new JobSourceError(`Lever fetch failed for ${company}: ${res.status}`)
      }
      const postings = (await res.json()) as LeverPosting[]
      for (const posting of postings) {
        const normalized = NormalizedJobSchema.safeParse({
          externalId: posting.id,
          title: posting.text,
          company,
          description: posting.descriptionPlain ?? posting.description ?? '',
          location: posting.categories?.location,
          remoteType: toRemoteType(posting.categories?.commitment, posting.categories?.location),
          url: posting.hostedUrl,
          postedAt: posting.createdAt ? new Date(posting.createdAt) : undefined,
          rawData: posting,
        })
        if (normalized.success) results.push(normalized.data)
      }
    }

    return results
  },

  async checkIsOpen(externalId, config): Promise<boolean> {
    const { companies } = config as unknown as LeverConfig
    for (const company of companies) {
      const res = await fetch(`https://api.lever.co/v0/postings/${company}/${externalId}`)
      if (res.ok) return true
    }
    return false
  },
}
