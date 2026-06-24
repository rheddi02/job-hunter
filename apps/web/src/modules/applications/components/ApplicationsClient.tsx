'use client'

import * as React from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc'
import {
  Button,
  Card,
  EmptyState,
  KanbanCard,
  KanbanColumn,
  LoadingSkeleton,
  useToast,
} from '@jobpilot/ui'
import type { StatusColor } from '@jobpilot/ui'

// ── Types ─────────────────────────────────────────────────────────────────────

type AppItem = {
  id: string
  status: string
  jobId: string
  createdAt: string
  job: {
    id: string
    title: string
    company: string
    location: string | null
    url: string
    source: { name: string }
  }
  match: { score: number; matchedSkills: string[] } | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const KANBAN_STATUSES: StatusColor[] = [
  'matched',
  'drafted',
  'applied',
  'interviewing',
  'rejected',
  'ghosted',
]

type TransitionDef = { label: string; to: string; variant: 'ghost' | 'danger' }

const NEXT_TRANSITIONS: Partial<Record<string, TransitionDef[]>> = {
  DRAFTED: [{ label: 'Mark Applied', to: 'APPLIED', variant: 'ghost' }],
  APPLIED: [
    { label: 'Got Interview', to: 'INTERVIEWING', variant: 'ghost' },
    { label: 'Rejected', to: 'REJECTED', variant: 'danger' },
    { label: 'Ghosted', to: 'GHOSTED', variant: 'danger' },
  ],
  INTERVIEWING: [
    { label: 'Back to Applied', to: 'APPLIED', variant: 'ghost' },
    { label: 'Rejected', to: 'REJECTED', variant: 'danger' },
    { label: 'Ghosted', to: 'GHOSTED', variant: 'danger' },
  ],
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_STATUSES.map((status, colIdx) => (
        <div key={status} className="w-64 shrink-0 space-y-2">
          <div className="flex items-center justify-between border-t-2 border-border pt-2">
            <LoadingSkeleton className="h-3 w-20" />
            <LoadingSkeleton className="h-3 w-5" />
          </div>
          {colIdx < 3 &&
            Array.from({ length: colIdx === 0 ? 2 : 1 }).map((_, j) => (
              <div key={j} className="rounded-md border border-border p-3 space-y-2">
                <LoadingSkeleton className="h-4 w-40" />
                <LoadingSkeleton className="h-3 w-28" />
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}

// ── Card actions ──────────────────────────────────────────────────────────────

function CardActions({
  app,
  pendingId,
  onTransition,
}: {
  app: AppItem
  pendingId: string | null
  onTransition: (appId: string, to: string) => void
}) {
  if (app.status === 'MATCHED') {
    return (
      <Link href={`/jobs/${app.job.id}/cover-letter`}>
        <Button variant="ghost" size="sm" className="w-full">
          Generate cover letter →
        </Button>
      </Link>
    )
  }

  const nexts = NEXT_TRANSITIONS[app.status]
  if (!nexts || nexts.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {nexts.map(({ label, to, variant }) => (
        <Button
          key={to}
          variant={variant}
          size="sm"
          isLoading={pendingId === `${app.id}-${to}`}
          onClick={() => onTransition(app.id, to)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ApplicationsClient() {
  const { addToast } = useToast()
  const utils = trpc.useUtils()
  const [pendingId, setPendingId] = React.useState<string | null>(null)

  const { data, isLoading, isError, error } = trpc.applications.list.useQuery()
  const transition = trpc.applications.transition.useMutation()

  React.useEffect(() => {
    if (transition.isSuccess) {
      setPendingId(null)
      void utils.applications.list.invalidate()
    }
    if (transition.isError) {
      setPendingId(null)
      addToast(`Transition failed: ${transition.error.message}`, 'error')
    }
  }, [transition.isSuccess, transition.isError]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTransition(appId: string, to: string) {
    setPendingId(`${appId}-${to}`)
    transition.mutate({
      applicationId: appId,
      toStatus: to as 'MATCHED' | 'DRAFTED' | 'APPLIED' | 'INTERVIEWING' | 'REJECTED' | 'GHOSTED',
    })
  }

  // Loading
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <LoadingSkeleton className="h-5 w-32" />
        </div>
        <KanbanSkeleton />
      </div>
    )
  }

  // Error
  if (isError) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <p className="text-sm text-danger">Could not load applications. {error.message}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => void utils.applications.list.invalidate()}
          >
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  const items = (data ?? []) as AppItem[]

  // Empty
  if (items.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="No applications yet"
          description="Generate a cover letter for a job to start tracking it here."
          action={
            <Link href="/jobs">
              <Button variant="primary" size="sm">Browse matched jobs</Button>
            </Link>
          }
        />
      </div>
    )
  }

  // Group by status (uppercase DB value → lowercase StatusColor)
  const byStatus = new Map<StatusColor, AppItem[]>()
  for (const status of KANBAN_STATUSES) byStatus.set(status, [])
  for (const app of items) {
    const key = app.status.toLowerCase() as StatusColor
    const col = byStatus.get(key)
    if (col) col.push(app)
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-sm font-semibold text-text-primary">Applications</h1>
        <span className="font-mono text-xs text-text-secondary">
          {items.length} {items.length === 1 ? 'application' : 'applications'}
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_STATUSES.map((status) => {
          const cards = byStatus.get(status) ?? []
          return (
            <KanbanColumn key={status} status={status} count={cards.length}>
              {cards.map((app) => (
                <KanbanCard
                  key={app.id}
                  title={
                    <Link
                      href={`/jobs/${app.job.id}`}
                      className="hover:text-accent transition-colors"
                    >
                      {app.job.title}
                    </Link>
                  }
                  company={app.job.company}
                  {...(app.match ? { score: app.match.score, matchedSkills: app.match.matchedSkills } : {})}
                  actions={
                    <CardActions
                      app={app}
                      pendingId={pendingId}
                      onTransition={handleTransition}
                    />
                  }
                />
              ))}
            </KanbanColumn>
          )
        })}
      </div>
    </div>
  )
}
