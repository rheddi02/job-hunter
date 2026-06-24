import * as React from 'react'
import { cn } from '../lib/cn'
import type { StatusColor } from '../tokens'

export interface BadgeProps {
  children: React.ReactNode
  status?: StatusColor
  className?: string
}

const statusStyles: Record<StatusColor, string> = {
  matched: 'bg-status-matched/20 text-status-matched border-status-matched/40',
  drafted: 'bg-status-drafted/20 text-status-drafted border-status-drafted/40',
  applied: 'bg-status-applied/20 text-status-applied border-status-applied/40',
  interviewing: 'bg-status-interviewing/20 text-status-interviewing border-status-interviewing/40',
  rejected: 'bg-status-rejected/20 text-status-rejected border-status-rejected/40',
  ghosted: 'bg-status-ghosted/20 text-status-ghosted border-status-ghosted/40',
}

export function Badge({ children, status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        status ? statusStyles[status] : 'border-border bg-surface text-text-secondary',
        className,
      )}
    >
      {children}
    </span>
  )
}
