type ExperienceEntry = { title?: string | null; company?: string | null; description?: string | null }

export function buildCoverLetterPrompt(opts: {
  candidateName: string | null
  skills: string[]
  matchedSkills: string[]
  experience: ExperienceEntry[]
  jobTitle: string
  jobCompany: string
  jobDescription: string
}): string {
  const name = opts.candidateName ?? 'the candidate'

  const experienceLines = opts.experience
    .slice(0, 3)
    .map((e) => `- ${e.title ?? 'Role'} at ${e.company ?? 'Company'}${e.description ? `: ${e.description.slice(0, 200)}` : ''}`)
    .join('\n')

  return `Write a professional cover letter for ${name} applying to the role below.

CANDIDATE PROFILE:
Name: ${name}
Skills: ${opts.skills.join(', ') || 'Not specified'}
Skills matched to this role: ${opts.matchedSkills.join(', ') || 'None identified'}
Recent experience:
${experienceLines || '(No experience listed)'}

JOB:
Title: ${opts.jobTitle}
Company: ${opts.jobCompany}
Description:
${opts.jobDescription.slice(0, 3000)}

Instructions:
- Write 3–4 concise paragraphs.
- Open with direct enthusiasm for this specific role and company — no generic opener.
- Highlight 2–3 matched skills with brief, concrete evidence from the candidate's experience.
- Close with a confident call to action.
- Tone: professional, direct, confident. No filler phrases ("I am writing to express…", "I believe I would be a great fit…").
- Output only the body paragraphs — no addresses, dates, salutations, or signature lines.`
}
