import { db } from '@jobpilot/db'
import { anthropic } from '@jobpilot/shared'
import { buildCoverLetterPrompt } from './prompts'
import { getOrCreateApplication, transitionApplicationStatus } from '../applications/service'

type ExperienceEntry = { title?: string | null; company?: string | null; description?: string | null }

function extractSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((s): s is string => typeof s === 'string')
}

function extractExperience(raw: unknown): ExperienceEntry[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((e): e is ExperienceEntry => typeof e === 'object' && e !== null)
}

export async function generateCoverLetter(userId: string, jobId: string) {
  const profile = await db.profile.findUnique({ where: { userId } })
  if (!profile) throw new Error('No profile found — upload your CV first')

  const [job, match] = await Promise.all([
    db.job.findUnique({ where: { id: jobId } }),
    db.match.findUnique({
      where: { userId_jobId: { userId, jobId } },
      select: { matchedSkills: true },
    }),
  ])
  if (!job) throw new Error('Job not found')

  // Ensure application exists and is at least DRAFTED
  const app = await getOrCreateApplication(userId, jobId)
  if (app.status === 'MATCHED') {
    await transitionApplicationStatus(app.id, 'DRAFTED')
  }

  const content = await callClaude({
    candidateName: profile.fullName ?? null,
    skills: extractSkills(profile.parsedSkills),
    matchedSkills: match?.matchedSkills ?? [],
    experience: extractExperience(profile.parsedExperience),
    jobTitle: job.title,
    jobCompany: job.company,
    jobDescription: job.description,
  })

  const latest = await db.coverLetter.findFirst({
    where: { applicationId: app.id },
    orderBy: { version: 'desc' },
    select: { version: true },
  })
  const version = (latest?.version ?? 0) + 1

  return db.coverLetter.create({
    data: { applicationId: app.id, content, version },
  })
}

async function callClaude(opts: Parameters<typeof buildCoverLetterPrompt>[0]): Promise<string> {
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildCoverLetterPrompt(opts) }],
  })
  const text = msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : ''
  if (!text) throw new Error('No content generated — please try again')
  return text
}

export async function getLatestCoverLetter(userId: string, jobId: string) {
  const app = await db.application.findUnique({
    where: { userId_jobId: { userId, jobId } },
    select: { id: true, status: true },
  })
  if (!app) return null

  const coverLetter = await db.coverLetter.findFirst({
    where: { applicationId: app.id },
    orderBy: { version: 'desc' },
  })

  return { application: app, coverLetter: coverLetter ?? null }
}

export async function updateCoverLetterContent(id: string, content: string) {
  return db.coverLetter.update({ where: { id }, data: { content } })
}
