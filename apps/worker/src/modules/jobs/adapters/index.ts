import type { JobSourceType } from '@jobpilot/db'
import type { JobSourceAdapter } from '@jobpilot/shared'
import { greenhouseAdapter } from './greenhouse.adapter'
import { leverAdapter } from './lever.adapter'
import { adzunaAdapter } from './adzuna.adapter'
import { arbeitnowAdapter } from './arbeitnow.adapter'

export const adapterRegistry: Record<JobSourceType, JobSourceAdapter> = {
  GREENHOUSE: greenhouseAdapter,
  LEVER: leverAdapter,
  ADZUNA: adzunaAdapter,
  ARBEITNOW: arbeitnowAdapter,
  REMOTEOK: arbeitnowAdapter, // placeholder — REMOTEOK adapter is a Phase 1.2 extension point
}

export { JobSourceError } from './types'
