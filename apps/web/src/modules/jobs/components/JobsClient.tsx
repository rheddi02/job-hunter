'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { Badge, Button, Card, EmptyState, LoadingSkeleton, MatchScoreBadge } from '@jobpilot/ui'
import type { StatusColor } from '@jobpilot/ui'

// ── Types ─────────────────────────────────────────────────────────────────────

type ScoreBand = 'all' | 'strong' | 'partial' | 'weak'
type RemoteFilter = 'all' | 'REMOTE' | 'HYBRID' | 'ONSITE'

const BAND_LABELS: Record<ScoreBand, string> = {
  all: 'All scores',
  strong: 'Strong (80+)',
  partial: 'Partial (50–79)',
  weak: 'Weak (<50)',
}

const REMOTE_LABELS: Record<RemoteFilter, string> = {
  all: 'All locations',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
}

function bandToScoreFilter(band: ScoreBand): { scoreMin?: number; scoreMax?: number } {
  if (band === 'strong') return { scoreMin: 80 }
  if (band === 'partial') return { scoreMin: 50, scoreMax: 79 }
  if (band === 'weak') return { scoreMax: 49 }
  return {}
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function JobListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-md border border-border p-4">
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="h-4 w-64" />
            <LoadingSkeleton className="h-3 w-40" />
            <div className="flex gap-2">
              <LoadingSkeleton className="h-5 w-16" />
              <LoadingSkeleton className="h-5 w-16" />
            </div>
          </div>
          <LoadingSkeleton className="h-6 w-14 shrink-0" />
        </div>
      ))}
    </div>
  )
}

// ── Job card ──────────────────────────────────────────────────────────────────

type JobItem = {
  id: string
  score: number
  matchedSkills: string[]
  applicationStatus: string | null
  job: {
    id: string
    title: string
    company: string
    location: string | null
    remoteType: string
    url: string
    postedAt: string | null
    source: { id: string; name: string; type: string }
  }
}

function JobCard({ item }: { item: JobItem }) {
  const { job, score, matchedSkills, applicationStatus } = item
  return (
    <Link href={`/jobs/${job.id}`} className="block">
      <div className="flex items-start gap-4 rounded-md border border-border bg-surface px-4 py-3 hover:border-accent/40 transition-colors">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-medium text-text-primary">{job.title}</p>
          <p className="text-xs text-text-secondary">
            {job.company}
            {job.location ? ` · ${job.location}` : ''}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {job.remoteType !== 'UNKNOWN' && (
              <Badge>{job.remoteType === 'ONSITE' ? 'On-site' : job.remoteType.charAt(0) + job.remoteType.slice(1).toLowerCase()}</Badge>
            )}
            <Badge>{job.source.name}</Badge>
            {applicationStatus && (() => {
              const s = applicationStatus.toLowerCase() as StatusColor
              return <Badge status={s}>Already tracked</Badge>
            })()}
            {matchedSkills.slice(0, 3).map((skill) => (
              <Badge key={skill} className="border-accent/30 bg-accent/10 text-accent">
                {skill}
              </Badge>
            ))}
            {matchedSkills.length > 3 && (
              <span className="text-xs text-text-secondary">+{matchedSkills.length - 3} more</span>
            )}
          </div>
        </div>
        <MatchScoreBadge score={score} className="shrink-0 self-start mt-0.5" />
      </div>
    </Link>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

export function JobsClient() {
  const router = useRouter()
  const [page, setPage] = React.useState(1)
  const [scoreBand, setScoreBand] = React.useState<ScoreBand>('all')
  const [remoteFilter, setRemoteFilter] = React.useState<RemoteFilter>('all')
  const [sourceId, setSourceId] = React.useState<string>('all')

  const scoreFilter = bandToScoreFilter(scoreBand)

  const queryInput = {
    page,
    pageSize: PAGE_SIZE,
    ...(scoreFilter.scoreMin !== undefined ? { scoreMin: scoreFilter.scoreMin } : {}),
    ...(scoreFilter.scoreMax !== undefined ? { scoreMax: scoreFilter.scoreMax } : {}),
    ...(sourceId !== 'all' ? { sourceId } : {}),
    ...(remoteFilter !== 'all' ? { remoteType: remoteFilter as 'REMOTE' | 'HYBRID' | 'ONSITE' } : {}),
  }

  const { data, isLoading, isError, error } = trpc.jobs.list.useQuery(queryInput)
  const { data: sources } = trpc.sources.list.useQuery()

  function resetFilters() {
    setScoreBand('all')
    setRemoteFilter('all')
    setSourceId('all')
    setPage(1)
  }

  function changeFilter(fn: () => void) {
    fn()
    setPage(1)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <LoadingSkeleton className="h-5 w-24" />
          <div className="flex gap-2">
            <LoadingSkeleton className="h-8 w-32" />
            <LoadingSkeleton className="h-8 w-32" />
            <LoadingSkeleton className="h-8 w-32" />
          </div>
        </div>
        <JobListSkeleton />
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <p className="text-sm text-danger">Could not load jobs. {error.message}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  const items = (data?.items ?? []) as JobItem[]
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="p-6">
      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          value={scoreBand}
          onChange={(e) => changeFilter(() => setScoreBand(e.target.value as ScoreBand))}
        >
          {(Object.entries(BAND_LABELS) as [ScoreBand, string][]).map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>

        <select
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
          value={remoteFilter}
          onChange={(e) => changeFilter(() => setRemoteFilter(e.target.value as RemoteFilter))}
        >
          {(Object.entries(REMOTE_LABELS) as [RemoteFilter, string][]).map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>

        {sources && sources.length > 0 && (
          <select
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            value={sourceId}
            onChange={(e) => changeFilter(() => setSourceId(e.target.value))}
          >
            <option value="all">All sources</option>
            {(sources as Array<{ id: string; name: string }>).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}

        <span className="ml-auto text-xs text-text-secondary">
          {total} {total === 1 ? 'match' : 'matches'}
        </span>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <EmptyState
          title="No matched jobs"
          description={
            scoreBand !== 'all' || remoteFilter !== 'all' || sourceId !== 'all'
              ? 'No jobs match the current filters.'
              : 'Add a job source and the worker will start matching jobs against your profile.'
          }
          action={
            scoreBand !== 'all' || remoteFilter !== 'all' || sourceId !== 'all' ? (
              <Button variant="ghost" size="sm" onClick={resetFilters}>Clear filters</Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => router.push('/sources')}>Add a source</Button>
            )
          }
        />
      )}

      {/* Job list */}
      {items.length > 0 && (
        <>
          <div className="space-y-2">
            {items.map((item) => (
              <JobCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ← Prev
              </Button>
              <span className="font-mono text-xs text-text-secondary">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
