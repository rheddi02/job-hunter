'use client'

import * as React from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc'
import { Badge, Button, Card, LoadingSkeleton, MatchScoreBadge } from '@jobpilot/ui'

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <LoadingSkeleton className="h-4 w-24" />
      <div className="space-y-2">
        <LoadingSkeleton className="h-6 w-96" />
        <LoadingSkeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-5 w-16" />
          <LoadingSkeleton className="h-5 w-16" />
          <LoadingSkeleton className="h-5 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

type DetailData = {
  job: {
    id: string
    title: string
    company: string
    description: string
    location: string | null
    remoteType: string
    url: string
    postedAt: string | null
    closesAt: string | null
    source: { id: string; name: string; type: string }
  }
  match: { score: number; matchedSkills: string[] } | null
  application: { id: string; status: string } | null
}

export function JobDetailClient({ jobId }: { jobId: string }) {
  const { data, isLoading, isError, error } = trpc.jobs.get.useQuery({ jobId })
  const utils = trpc.useUtils()

  // Loading
  if (isLoading) return <DetailSkeleton />

  // Error
  if (isError) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <p className="text-sm text-danger">Could not load job. {error.message}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => void utils.jobs.get.invalidate({ jobId })}
          >
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  // Not found
  if (!data) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <p className="text-sm text-text-secondary">Job not found.</p>
          <Link href="/jobs" className="mt-2 inline-block text-xs text-accent hover:underline">
            ← Back to jobs
          </Link>
        </Card>
      </div>
    )
  }

  const { job, match, application } = data as DetailData
  const description = stripHtml(job.description)
  const postedDate = job.postedAt ? new Date(job.postedAt).toLocaleDateString() : null

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Back link */}
      <Link href="/jobs" className="text-xs text-text-secondary hover:text-text-primary">
        ← Back to jobs
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-base font-semibold text-text-primary">{job.title}</h1>
          {match && <MatchScoreBadge score={match.score} className="shrink-0" />}
        </div>

        <p className="text-sm text-text-secondary">
          {job.company}
          {job.location ? ` · ${job.location}` : ''}
          {postedDate ? ` · Posted ${postedDate}` : ''}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {job.remoteType !== 'UNKNOWN' && (
            <Badge>{job.remoteType === 'ONSITE' ? 'On-site' : job.remoteType.charAt(0) + job.remoteType.slice(1).toLowerCase()}</Badge>
          )}
          <Badge>{job.source.name}</Badge>
          {application && (() => {
            const s = application.status.toLowerCase() as 'matched' | 'drafted' | 'applied' | 'interviewing' | 'rejected' | 'ghosted'
            return <Badge status={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</Badge>
          })()}
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary"
          >
            View original ↗
          </a>
        </div>
      </div>

      {/* Match breakdown */}
      {match && match.matchedSkills.length > 0 && (
        <Card className="p-4">
          <p className="mb-2 text-xs font-medium text-text-secondary">Matched skills</p>
          <div className="flex flex-wrap gap-1.5">
            {match.matchedSkills.map((skill) => (
              <Badge key={skill} className="border-accent/30 bg-accent/10 text-accent">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Cover letter CTA */}
      <div className="flex items-center gap-3">
        <Link href={`/jobs/${jobId}/cover-letter`}>
          <Button variant="primary">Generate cover letter</Button>
        </Link>
        {application ? (
          <p className="text-xs text-text-secondary">
            Status: <span className="font-medium text-text-primary">{application.status.charAt(0) + application.status.slice(1).toLowerCase()}</span>
          </p>
        ) : null}
      </div>

      {/* Description */}
      <Card className="p-4">
        <p className="mb-3 text-xs font-medium text-text-secondary">Job description</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">{description}</p>
      </Card>
    </div>
  )
}
