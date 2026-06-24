'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc'
import { Badge, Button, Card, EmptyState, LoadingSkeleton, useToast } from '@jobpilot/ui'

const SOURCE_TYPE_LABELS: Record<string, string> = {
  GREENHOUSE: 'Greenhouse',
  LEVER: 'Lever',
  ADZUNA: 'Adzuna',
  ARBEITNOW: 'Arbeitnow',
  REMOTEOK: 'RemoteOK',
}

function SourcesSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-md border border-border p-3">
          <LoadingSkeleton className="h-4 w-32" />
          <LoadingSkeleton className="h-5 w-20" />
          <div className="ml-auto flex gap-2">
            <LoadingSkeleton className="h-8 w-16" />
            <LoadingSkeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

type FormValues = {
  name: string
  type: 'GREENHOUSE' | 'LEVER' | 'ADZUNA' | 'ARBEITNOW' | 'REMOTEOK'
  configRaw: string
}

function AddSourceModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const { addToast } = useToast()
  const [values, setValues] = React.useState<FormValues>({
    name: '',
    type: 'ARBEITNOW',
    configRaw: '{}',
  })
  const [configError, setConfigError] = React.useState('')

  const add = trpc.sources.add.useMutation()

  React.useEffect(() => {
    if (add.isSuccess) {
      addToast('Source added', 'success')
      onAdded()
      onClose()
    }
    if (add.isError) {
      addToast(`Failed to add source: ${add.error.message}`, 'error')
    }
  }, [add.isSuccess, add.isError]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let config: Record<string, unknown>
    try {
      config = JSON.parse(values.configRaw) as Record<string, unknown>
      setConfigError('')
    } catch {
      setConfigError('Config must be valid JSON')
      return
    }
    add.mutate({ name: values.name, type: values.type, config })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md p-6">
        <h2 className="mb-4 text-sm font-semibold text-text-primary">Add job source</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">Name</label>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. Stripe Greenhouse"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-secondary">Type</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              value={values.type}
              onChange={(e) => setValues((v) => ({ ...v, type: e.target.value as FormValues['type'] }))}
            >
              {Object.entries(SOURCE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              Config (JSON) — leave <code className="text-xs">{'{}'}</code> for Arbeitnow
            </label>
            <textarea
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              rows={4}
              value={values.configRaw}
              onChange={(e) => setValues((v) => ({ ...v, configRaw: e.target.value }))}
            />
            {configError && <p className="mt-1 text-xs text-danger">{configError}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={add.isPending}>Add source</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export function SourcesClient() {
  const { addToast } = useToast()
  const [showModal, setShowModal] = React.useState(false)

  const { data: sources, isLoading, isError, error } = trpc.sources.list.useQuery()

  const toggle = trpc.sources.toggle.useMutation()
  const utils = trpc.useUtils()

  React.useEffect(() => {
    if (toggle.isSuccess) void utils.sources.list.invalidate()
    if (toggle.isError) addToast(`Failed to update source: ${toggle.error.message}`, 'error')
  }, [toggle.isSuccess, toggle.isError]) // eslint-disable-line react-hooks/exhaustive-deps

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <LoadingSkeleton className="h-5 w-28" />
          <LoadingSkeleton className="h-8 w-28" />
        </div>
        <SourcesSkeleton />
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <p className="text-sm text-danger">Could not load sources. {error.message}</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => void utils.sources.list.invalidate()}>
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      {showModal && (
        <AddSourceModal onClose={() => setShowModal(false)} onAdded={() => void utils.sources.list.invalidate()} />
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-sm font-semibold text-text-primary">Job sources</h1>
        <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
          Add source
        </Button>
      </div>

      {/* Empty state */}
      {sources?.length === 0 && (
        <EmptyState
          title="No job sources yet"
          description="Add a source to start pulling in job listings automatically."
          action={
            <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
              Add your first source
            </Button>
          }
        />
      )}

      {/* Populated state */}
      {sources && sources.length > 0 && (
        <div className="space-y-2">
          {(sources as Array<{ id: string; name: string; type: string; enabled: boolean }>).map((source) => (
            <div
              key={source.id}
              className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3"
            >
              <span className="text-sm font-medium text-text-primary">{source.name}</span>
              <Badge>{SOURCE_TYPE_LABELS[source.type] ?? source.type}</Badge>
              {!source.enabled && (
                <Badge className="border-border bg-background text-text-secondary">Disabled</Badge>
              )}

              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggle.mutate({ id: source.id, enabled: !source.enabled })}
                >
                  {source.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
