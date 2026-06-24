export function buildSemanticMatchPrompt(opts: {
  skills: string[]
  jobTitle: string
  jobDescription: string
}): string {
  return `Rate how well this candidate matches this job posting. Reply with a single integer 0–100. No explanation.

0–49  = Poor match (major skill gaps)
50–79 = Partial match (some skills relevant, gaps exist)
80–100 = Strong match (skills closely align with requirements)

CANDIDATE SKILLS:
${opts.skills.length > 0 ? opts.skills.join(', ') : 'Not specified'}

JOB TITLE: ${opts.jobTitle}

JOB DESCRIPTION:
${opts.jobDescription.slice(0, 3000)}

Score:`
}
