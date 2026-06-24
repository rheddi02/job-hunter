import * as React from 'react'
import { cn } from '../lib/cn'
import type { StatusColor } from '../tokens'

export interface KanbanColumnProps {
  status: StatusColor
  count: number
  children?: React.ReactNode
  className?: string
}

const STATUS_LABELS: Record<StatusColor, string> = {
  matched: 'Matched',
  drafted: 'Drafted',
  applied: 'Applied',
  interviewing: 'Interviewing',
  rejected: 'Rejected',
  ghosted: 'Ghosted',
}

const HEADER_BORDER: Record<StatusColor, string> = {
  matched: 'border-t-status-matched',
  drafted: 'border-t-status-drafted',
  applied: 'border-t-status-applied',
  interviewing: 'border-t-status-interviewing',
  rejected: 'border-t-status-rejected',
  ghosted: 'border-t-status-ghosted',
}

const HEADER_TEXT: Record<StatusColor, string> = {
  matched: 'text-status-matched',
  drafted: 'text-status-drafted',
  applied: 'text-status-applied',
  interviewing: 'text-status-interviewing',
  rejected: 'text-status-rejected',
  ghosted: 'text-status-ghosted',
}

export function KanbanColumn({ status, count, children, className }: KanbanColumnProps) {
  return (
    <div className={cn('flex w-64 shrink-0 flex-col gap-2', className)}>
      <div className={cn('border-t-2 pt-2', HEADER_BORDER[status])}>
        <div className="flex items-center justify-between">
          <span className={cn('text-xs font-semibold uppercase tracking-wide', HEADER_TEXT[status])}>
            {STATUS_LABELS[status]}
          </span>
          <span className="font-mono text-xs text-text-secondary">{count}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  )
}
