import { z } from 'zod'

export const ExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export const EducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  graduationYear: z.string().nullable().optional(),
})

export const ParsedResumeSchema = z.object({
  fullName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
})

export type ParsedResume = z.infer<typeof ParsedResumeSchema>
export type Experience = z.infer<typeof ExperienceSchema>
export type Education = z.infer<typeof EducationSchema>
