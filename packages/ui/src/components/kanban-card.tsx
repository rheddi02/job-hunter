import * as React from 'react'
import { cn } from '../lib/cn'
import { MatchScoreBadge } from './match-score-badge'

export interface KanbanCardProps {
  title: React.ReactNode
  company: string
  score?: number
  matchedSkills?: string[]
  actions?: React.ReactNode
  className?: string
}

export function KanbanCard({ title, company, score, matchedSkills, actions, className }: KanbanCardProps) {
  return (
    <div className={cn('rounded-md border border-border bg-surface p-3 space-y-2', className)}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 text-sm font-medium text-text-primary leading-snug">
          {title}
        </div>
        {score !== undefined && <MatchScoreBadge score={score} className="shrink-0 self-start" />}
      </div>
      <p className="text-xs text-text-secondary">{company}</p>
      {matchedSkills && matchedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {matchedSkills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-xs text-accent"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
      {actions && (
        <div className="border-t border-border pt-2">
          {actions}
        </div>
      )}
    </div>
  )
}
