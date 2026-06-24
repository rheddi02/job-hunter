'use client'

import * as React from 'react'
import { Button, useToast } from '@jobpilot/ui'
import { trpc } from '@/lib/trpc'

type Experience = {
  title: string
  company: string
  startDate?: string | null
  endDate?: string | null
  description?: string | null
}

interface SkillsEditorProps {
  profile: {
    fullName: string | null
    email: string | null
    rawCvPath: string | null
    parsedSkills: unknown
    parsedExperience: unknown
  }
  onReplace: () => void
}

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((s): s is string => typeof s === 'string')
  return []
}

function toExperienceArray(val: unknown): Experience[] {
  if (!Array.isArray(val)) return []
  return val.filter(
    (e): e is Experience =>
      typeof e === 'object' &&
      e !== null &&
      'title' in e &&
      'company' in e,
  )
}

export function SkillsEditor({ profile, onReplace }: SkillsEditorProps) {
  const [skills, setSkills] = React.useState<string[]>(() => toStringArray(profile.parsedSkills))
  const [newSkill, setNewSkill] = React.useState('')
  const [isDirty, setIsDirty] = React.useState(false)
  const { addToast } = useToast()

  const experience = toExperienceArray(profile.parsedExperience)

  const updateSkills = trpc.profile.updateSkills.useMutation()

  React.useEffect(() => {
    if (updateSkills.isSuccess) {
      addToast('Skills saved', 'success')
      setIsDirty(false)
    }
  }, [updateSkills.isSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (updateSkills.isError) {
      addToast(`Save failed: ${updateSkills.error?.message ?? 'unknown error'}`, 'error')
    }
  }, [updateSkills.isError]) // eslint-disable-line react-hooks/exhaustive-deps

  const addSkill = () => {
    const trimmed = newSkill.trim()
    if (!trimmed || skills.includes(trimmed)) return
    setSkills((prev) => [...prev, trimmed])
    setNewSkill('')
    setIsDirty(true)
  }

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
    setIsDirty(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            {profile.fullName ?? 'Your Profile'}
          </h2>
          {profile.email && (
            <p className="mt-0.5 text-sm text-text-secondary">{profile.email}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onReplace}>
          Replace resume
        </Button>
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <button
              key={skill}
              onClick={() => removeSkill(skill)}
              className="group inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-text-primary hover:border-danger/50 hover:bg-danger/10"
            >
              {skill}
              <span className="text-text-secondary group-hover:text-danger">×</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Add a skill…"
            className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <Button variant="secondary" size="sm" onClick={addSkill}>
            Add
          </Button>
        </div>

        {isDirty && (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => updateSkills.mutate({ skills })}
              isLoading={updateSkills.isPending}
            >
              Save skills
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSkills(toStringArray(profile.parsedSkills))
                setIsDirty(false)
              }}
            >
              Discard
            </Button>
          </div>
        )}
      </section>

      {experience.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Experience
          </h3>
          <div className="space-y-2">
            {experience.map((exp, i) => (
              <div key={i} className="rounded-md border border-border bg-surface p-3">
                <p className="text-sm font-medium text-text-primary">{exp.title}</p>
                <p className="text-xs text-text-secondary">
                  {exp.company}
                  {exp.startDate && ` · ${exp.startDate}`}
                  {exp.endDate ? ` – ${exp.endDate}` : exp.startDate ? ' – Present' : ''}
                </p>
                {exp.description && (
                  <p className="mt-1.5 text-xs text-text-secondary line-clamp-2">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
