import * as React from 'react'
import { cn } from '../lib/cn'

export interface CardProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function Card({ children, className, as: As = 'div' }: CardProps) {
  return (
    <As className={cn('rounded-md border border-border bg-surface', className)}>
      {children}
    </As>
  )
}
