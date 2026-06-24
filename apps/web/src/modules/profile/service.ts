import { db, Prisma } from '@jobpilot/db'
import type { ParsedResume } from '@jobpilot/shared'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseCvFromBuffer } from './cv-parser'

export async function getProfile(userId: string) {
  return db.profile.findUnique({ where: { userId } })
}

export async function parseAndStoreResume(userId: string, storagePath: string): Promise<ParsedResume> {
  const adminClient = createAdminClient()

  const { data, error } = await adminClient.storage.from('resumes').download(storagePath)
  if (error ?? !data) {
    throw new Error(`Failed to download resume from storage: ${error?.message ?? 'unknown error'}`)
  }

  const arrayBuffer = await data.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const parsed = await parseCvFromBuffer(buffer)

  await db.profile.upsert({
    where: { userId },
    create: {
      userId,
      rawCvPath: storagePath,
      fullName: parsed.fullName ?? null,
      email: parsed.email ?? null,
      parsedSkills: parsed.skills as Prisma.JsonArray,
      parsedExperience: parsed.experience as Prisma.JsonArray,
    },
    update: {
      rawCvPath: storagePath,
      fullName: parsed.fullName ?? null,
      email: parsed.email ?? null,
      parsedSkills: parsed.skills as Prisma.JsonArray,
      parsedExperience: parsed.experience as Prisma.JsonArray,
    },
  })

  return parsed
}

export async function updateProfileSkills(userId: string, skills: string[]) {
  return db.profile.update({
    where: { userId },
    data: { parsedSkills: skills as Prisma.JsonArray },
  })
}
