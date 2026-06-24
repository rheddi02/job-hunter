import * as React from 'react'
import { cn } from '../lib/cn'

export interface MatchScoreBadgeProps {
  score: number
  className?: string
}

type Band = 'strong' | 'partial' | 'weak'

function getBand(score: number): Band {
  if (score >= 80) return 'strong'
  if (score >= 50) return 'partial'
  return 'weak'
}

const bandStyles: Record<Band, string> = {
  strong: 'border-success/40 bg-success/10 text-success',
  partial: 'border-warning/40 bg-warning/10 text-warning',
  weak: 'border-border bg-surface text-text-secondary',
}

const bandLabels: Record<Band, string> = {
  strong: 'Strong',
  partial: 'Partial',
  weak: 'Weak',
}

export function MatchScoreBadge({ score, className }: MatchScoreBadgeProps) {
  const band = getBand(score)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs',
        bandStyles[band],
        className,
      )}
    >
      <span className="font-mono font-semibold">{score}</span>
      <span className="font-sans text-xs opacity-75">{bandLabels[band]}</span>
    </span>
  )
}
