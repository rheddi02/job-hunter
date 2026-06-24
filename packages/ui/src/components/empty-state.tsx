import * as React from 'react'
import { cn } from '../lib/cn'

export interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-md border border-dashed border-border p-12 text-center',
        className,
      )}
    >
      {icon && <div className="mb-4 text-text-secondary">{icon}</div>}
      <h3 className="text-sm font-medium text-text-primary">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
