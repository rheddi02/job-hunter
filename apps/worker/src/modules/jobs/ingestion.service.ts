import { createHash } from 'node:crypto'
import { db } from '@jobpilot/db'
import type { Prisma } from '@jobpilot/db'
import { matchingQueue } from '../../lib/queues'
import { adapterRegistry, JobSourceError } from './adapters/index'

export async function ingestSource(sourceId: string): Promise<{ inserted: number; skipped: number }> {
  const source = await db.jobSource.findUnique({ where: { id: sourceId } })
  if (!source) throw new JobSourceError(`Job source not found: ${sourceId}`)
  if (!source.enabled) return { inserted: 0, skipped: 0 }

  const adapter = adapterRegistry[source.type]
  if (!adapter) throw new JobSourceError(`No adapter registered for source type: ${source.type}`)

  const config = (source.config ?? {}) as Record<string, unknown>
  const rawJobs = await adapter.fetchJobs(config)

  let inserted = 0
  let skipped = 0

  for (const rawJob of rawJobs) {
    const contentHash = createHash('sha256')
      .update(`${rawJob.title}|${rawJob.company}|${rawJob.description}`)
      .digest('hex')

    const base = {
      source: { connect: { id: sourceId } },
      externalId: rawJob.externalId,
      contentHash,
      title: rawJob.title,
      company: rawJob.company,
      description: rawJob.description,
      location: rawJob.location ?? null,
      remoteType: rawJob.remoteType,
      url: rawJob.url,
      postedAt: rawJob.postedAt ?? null,
      closesAt: rawJob.closesAt ?? null,
    } satisfies Omit<Prisma.JobCreateInput, 'rawData'>

    const data: Prisma.JobCreateInput = rawJob.rawData !== undefined
      ? { ...base, rawData: rawJob.rawData as Prisma.InputJsonValue }
      : base

    try {
      const created = await db.job.create({ data })
      inserted++
      await matchingQueue.add('match', { jobId: created.id })
    } catch (err: unknown) {
      if (isUniqueConstraintError(err)) {
        skipped++
      } else {
        throw err
      }
    }
  }

  console.log(`[ingest:${source.name}] inserted=${inserted} skipped=${skipped}`)
  return { inserted, skipped }
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  )
}
