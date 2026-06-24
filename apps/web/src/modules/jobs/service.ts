import { db } from '@jobpilot/db'
import type { JobSourceType, RemoteType, Prisma } from '@jobpilot/db'

export async function listSources() {
  return db.jobSource.findMany({ orderBy: { createdAt: 'asc' } })
}

export async function toggleSource(id: string, enabled: boolean) {
  return db.jobSource.update({ where: { id }, data: { enabled } })
}

export async function addSource(data: {
  name: string
  type: JobSourceType
  config?: Record<string, unknown>
}) {
  return db.jobSource.create({
    data: {
      name: data.name,
      type: data.type,
      config: (data.config ?? {}) as Prisma.InputJsonObject,
    },
  })
}

// ── Job list & detail ──────────────────────────────────────────────────────────

export type ListMatchesOpts = {
  page: number
  pageSize: number
  scoreMin?: number
  scoreMax?: number
  sourceId?: string
  remoteType?: string
}

export async function listMatches(userId: string, opts: ListMatchesOpts) {
  const matchWhere: Prisma.MatchWhereInput = { userId }

  if (opts.scoreMin !== undefined || opts.scoreMax !== undefined) {
    matchWhere.score = {
      ...(opts.scoreMin !== undefined ? { gte: opts.scoreMin } : {}),
      ...(opts.scoreMax !== undefined ? { lte: opts.scoreMax } : {}),
    }
  }

  const jobWhere: Prisma.JobWhereInput = {}
  if (opts.sourceId) jobWhere.sourceId = opts.sourceId
  if (opts.remoteType) jobWhere.remoteType = opts.remoteType as RemoteType
  if (Object.keys(jobWhere).length > 0) matchWhere.job = jobWhere

  const [rawItems, total] = await Promise.all([
    db.match.findMany({
      where: matchWhere,
      select: {
        id: true,
        score: true,
        matchedSkills: true,
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            remoteType: true,
            url: true,
            postedAt: true,
            source: { select: { id: true, name: true, type: true } },
          },
        },
      },
      orderBy: { score: 'desc' },
      skip: (opts.page - 1) * opts.pageSize,
      take: opts.pageSize,
    }),
    db.match.count({ where: matchWhere }),
  ])

  // Enrich with application status for duplicate-prevention display
  const jobIds = rawItems.map((i) => i.job.id)
  const apps =
    jobIds.length > 0
      ? await db.application.findMany({
          where: { userId, jobId: { in: jobIds } },
          select: { jobId: true, status: true },
        })
      : []
  const appStatusByJobId = new Map(apps.map((a) => [a.jobId, a.status as string]))

  const items = rawItems.map((item) => ({
    ...item,
    applicationStatus: appStatusByJobId.get(item.job.id) ?? null,
  }))

  return { items, total, page: opts.page, pageSize: opts.pageSize, hasNextPage: opts.page * opts.pageSize < total }
}

export async function getJobDetail(userId: string, jobId: string) {
  const [job, match, application] = await Promise.all([
    db.job.findUnique({
      where: { id: jobId },
      include: { source: { select: { id: true, name: true, type: true } } },
    }),
    db.match.findUnique({
      where: { userId_jobId: { userId, jobId } },
      select: { score: true, matchedSkills: true },
    }),
    db.application.findUnique({
      where: { userId_jobId: { userId, jobId } },
      select: { id: true, status: true },
    }),
  ])

  if (!job) return null
  return { job, match, application }
}
