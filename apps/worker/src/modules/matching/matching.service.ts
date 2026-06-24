import { db } from '@jobpilot/db'
import { anthropic } from '@jobpilot/shared'
import { computeSkillOverlap, combineScores } from './score'
import { buildSemanticMatchPrompt } from './prompts'

async function computeSemanticScore(opts: {
  skills: string[]
  jobTitle: string
  jobDescription: string
}): Promise<number> {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8,
    messages: [{ role: 'user', content: buildSemanticMatchPrompt(opts) }],
  })
  const text = msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : '0'
  const score = parseInt(text, 10)
  return isNaN(score) ? 0 : Math.min(100, Math.max(0, score))
}

function extractSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((s): s is string => typeof s === 'string')
}

export async function runMatchingForJob(jobId: string): Promise<void> {
  const job = await db.job.findUnique({ where: { id: jobId } })
  if (!job) return

  const profiles = await db.profile.findMany()
  if (profiles.length === 0) return

  const jobText = `${job.title} ${job.company} ${job.description}`

  for (const profile of profiles) {
    const skills = extractSkills(profile.parsedSkills)

    const { score: skillScore, matchedSkills } = computeSkillOverlap(skills, jobText)

    const semanticScore = await computeSemanticScore({
      skills,
      jobTitle: job.title,
      jobDescription: job.description,
    })

    const score = combineScores(skillScore, semanticScore)

    await db.match.upsert({
      where: { userId_jobId: { userId: profile.userId, jobId } },
      create: { userId: profile.userId, jobId, score, matchedSkills },
      update: { score, matchedSkills },
    })

    console.log(`[matching] job=${jobId} user=${profile.userId} score=${score} skills=[${matchedSkills.join(',')}]`)
  }
}
