import { anthropic } from '@jobpilot/shared'
import { ParsedResumeSchema, type ParsedResume } from '@jobpilot/shared'

const SYSTEM_PROMPT = `You are a resume parser. Extract structured information from the provided resume text and return ONLY a valid JSON object with no markdown fences, no explanation, just the JSON.`

const USER_PROMPT = (text: string) => `Extract structured information from this resume and return ONLY valid JSON:

${text}

Return exactly this JSON structure (use null for missing fields, empty arrays for missing lists):
{
  "fullName": string | null,
  "email": string | null,
  "phone": string | null,
  "summary": string | null,
  "skills": string[],
  "experience": [{ "title": string, "company": string, "startDate": string | null, "endDate": string | null, "description": string | null }],
  "education": [{ "degree": string, "institution": string, "graduationYear": string | null }]
}`

export async function parseCvFromBuffer(pdfBuffer: Buffer): Promise<ParsedResume> {
  const pdfParse = (await import('pdf-parse')).default
  const { text } = await pdfParse(pdfBuffer)

  if (!text.trim()) {
    throw new Error('Could not extract text from PDF. Make sure the file is not scanned image-only.')
  }

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: USER_PROMPT(text) }],
  })

  const block = response.content[0]
  if (!block || block.type !== 'text') {
    throw new Error('Unexpected response shape from Claude')
  }

  const jsonText = block.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
  const raw: unknown = JSON.parse(jsonText)
  return ParsedResumeSchema.parse(raw)
}
