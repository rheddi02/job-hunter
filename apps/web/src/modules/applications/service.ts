import { db } from '@jobpilot/db'
import type { ApplicationStatus } from '@jobpilot/db'
import { isLegalTransition } from './state-machine'

export async function listApplicationsWithMatches(userId: string) {
  const applications = await db.application.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      jobId: true,
      createdAt: true,
      job: {
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          url: true,
          source: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (applications.length === 0) return []

  const jobIds = applications.map((a) => a.jobId)
  const matches = await db.match.findMany({
    where: { userId, jobId: { in: jobIds } },
    select: { jobId: true, score: true, matchedSkills: true },
  })
  const matchMap = new Map(
    matches.map((m) => [
      m.jobId,
      { score: m.score, matchedSkills: (m.matchedSkills as string[]) ?? [] },
    ]),
  )

  return applications.map((app) => ({
    ...app,
    match: matchMap.get(app.jobId) ?? null,
  }))
}

export async function transitionApplication(
  userId: string,
  appId: string,
  toStatus: ApplicationStatus,
): Promise<void> {
  const owns = await db.application.findFirst({
    where: { id: appId, userId },
    select: { id: true },
  })
  if (!owns) throw new Error('Application not found')
  await transitionApplicationStatus(appId, toStatus)
}

export class IllegalTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Illegal status transition: ${from} → ${to}`)
    this.name = 'IllegalTransitionError'
  }
}

export async function getOrCreateApplication(userId: string, jobId: string) {
  return db.application.upsert({
    where: { userId_jobId: { userId, jobId } },
    create: { userId, jobId },
    update: {},
  })
}

export async function transitionApplicationStatus(
  appId: string,
  toStatus: ApplicationStatus,
): Promise<void> {
  const app = await db.application.findUnique({
    where: { id: appId },
    select: { status: true },
  })
  if (!app) throw new Error(`Application not found: ${appId}`)

  if (!isLegalTransition(app.status, toStatus)) {
    throw new IllegalTransitionError(app.status, toStatus)
  }

  await db.$transaction([
    db.application.update({ where: { id: appId }, data: { status: toStatus } }),
    db.statusEvent.create({
      data: { applicationId: appId, fromStatus: app.status, toStatus },
    }),
  ])
}
