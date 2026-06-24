'use client'

import * as React from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc'
import { Badge, Button, Card, EmptyState, LoadingSkeleton, useToast } from '@jobpilot/ui'

type CoverLetterData = {
  application: { id: string; status: string } | null
  coverLetter: { id: string; content: string; version: number; createdAt: string } | null
}

function CoverLetterSkeleton({ jobId }: { jobId: string }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <LoadingSkeleton className="h-4 w-24" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <LoadingSkeleton className="h-5 w-32" />
          <LoadingSkeleton className="h-3 w-48" />
        </div>
        <div className="flex gap-2">
          <LoadingSkeleton className="h-8 w-24" />
        </div>
      </div>
      <LoadingSkeleton className="h-96 w-full" />
      <Link href={`/jobs/${jobId}`} className="sr-only">Back</Link>
    </div>
  )
}

export function CoverLetterClient({ jobId }: { jobId: string }) {
  const { addToast } = useToast()
  const utils = trpc.useUtils()

  const { data, isLoading, isError, error } = trpc.coverletters.getLatest.useQuery({ jobId })
  const generate = trpc.coverletters.generate.useMutation()
  const save = trpc.coverletters.updateContent.useMutation()

  const typedData = data as CoverLetterData | null | undefined

  // Local draft state — sync when a new cover letter version loads
  const [draft, setDraft] = React.useState('')
  const [isDirty, setIsDirty] = React.useState(false)

  const coverLetterId = typedData?.coverLetter?.id
  React.useEffect(() => {
    const content = typedData?.coverLetter?.content
    if (content !== undefined) {
      setDraft(content)
      setIsDirty(false)
    }
  }, [coverLetterId]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (generate.isSuccess) {
      void utils.coverletters.getLatest.invalidate({ jobId })
      addToast('Cover letter generated', 'success')
    }
    if (generate.isError) {
      addToast(`Generation failed: ${generate.error.message}`, 'error')
    }
  }, [generate.isSuccess, generate.isError]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (save.isSuccess) {
      setIsDirty(false)
      addToast('Saved', 'success')
    }
    if (save.isError) {
      addToast(`Save failed: ${save.error.message}`, 'error')
    }
  }, [save.isSuccess, save.isError]) // eslint-disable-line react-hooks/exhaustive-deps

  // Loading
  if (isLoading) return <CoverLetterSkeleton jobId={jobId} />

  // Error
  if (isError) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card className="p-4">
          <p className="text-sm text-danger">Could not load cover letter. {error.message}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => void utils.coverletters.getLatest.invalidate({ jobId })}
          >
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  // Empty — no cover letter yet
  if (!typedData?.coverLetter) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Link href={`/jobs/${jobId}`} className="mb-6 block text-xs text-text-secondary hover:text-text-primary">
          ← Back to job
        </Link>
        <EmptyState
          title="No cover letter yet"
          description="Generate a tailored cover letter from your profile and this job's requirements."
          action={
            <Button
              variant="primary"
              isLoading={generate.isPending}
              onClick={() => generate.mutate({ jobId })}
            >
              Generate cover letter
            </Button>
          }
        />
      </div>
    )
  }

  // Populated
  const { coverLetter, application } = typedData

  const statusLabel = application
    ? application.status.charAt(0).toUpperCase() + application.status.slice(1).toLowerCase()
    : null

  const createdDate = new Date(coverLetter.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <Link href={`/jobs/${jobId}`} className="text-xs text-text-secondary hover:text-text-primary">
        ← Back to job
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-sm font-semibold text-text-primary">Cover letter</h1>
          <p className="font-mono text-xs text-text-secondary">
            v{coverLetter.version} · {createdDate}
            {statusLabel && (
              <> · <span className="font-sans">{statusLabel}</span></>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isDirty && (
            <Button
              variant="primary"
              size="sm"
              isLoading={save.isPending}
              onClick={() => save.mutate({ coverLetterId: coverLetter.id, content: draft })}
            >
              Save
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            isLoading={generate.isPending}
            onClick={() => generate.mutate({ jobId })}
          >
            Regenerate
          </Button>
        </div>
      </div>

      {/* Editable draft */}
      <textarea
        className="w-full resize-none rounded-md border border-border bg-surface p-4 text-sm leading-relaxed text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        rows={24}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          setIsDirty(true)
        }}
        spellCheck
      />

      {/* Footer meta */}
      <div className="flex items-center justify-between">
        {isDirty ? (
          <span className="text-xs text-warning">Unsaved changes</span>
        ) : (
          <span className="text-xs text-text-secondary">Up to date</span>
        )}
        <span className="font-mono text-xs text-text-secondary">{draft.length} chars</span>
      </div>
    </div>
  )
}
