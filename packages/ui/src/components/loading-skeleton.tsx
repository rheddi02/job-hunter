import * as React from 'react'
import { cn } from '../lib/cn'

export interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-md bg-border', className)} />
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-32" />
        <LoadingSkeleton className="h-8 w-48" />
      </div>
      <div className="space-y-3">
        <LoadingSkeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-6 w-20" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <LoadingSkeleton className="h-4 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5 rounded-md border border-border p-3">
            <LoadingSkeleton className="h-4 w-40" />
            <LoadingSkeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}
