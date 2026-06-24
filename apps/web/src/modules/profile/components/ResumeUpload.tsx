'use client'

import * as React from 'react'
import { Button, useToast } from '@jobpilot/ui'
import { createClient } from '@/lib/supabase/client'
import { trpc } from '@/lib/trpc'

interface ResumeUploadProps {
  userId: string
  onParsed: () => void
}

type UploadState = 'idle' | 'uploading' | 'parsing' | 'error'

export function ResumeUpload({ userId, onParsed }: ResumeUploadProps) {
  const [state, setState] = React.useState<UploadState>('idle')
  const [errorMsg, setErrorMsg] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  const parseResume = trpc.profile.parseResume.useMutation({
    onSuccess: () => {
      addToast('Resume parsed successfully', 'success')
      onParsed()
    },
    onError: (err) => {
      setState('error')
      setErrorMsg(err.message)
    },
  })

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('Only PDF files are supported.')
      setState('error')
      return
    }

    setErrorMsg('')
    setState('uploading')

    const supabase = createClient()
    const storagePath = `${userId}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(storagePath, file, { upsert: true })

    if (uploadError) {
      setState('error')
      setErrorMsg(`Upload failed: ${uploadError.message}`)
      return
    }

    setState('parsing')
    parseResume.mutate({ storagePath })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }

  const isPending = state === 'uploading' || state === 'parsing'

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !isPending && inputRef.current?.click()}
        className="flex w-full max-w-md cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border p-12 text-center transition-colors hover:border-accent hover:bg-surface/50"
      >
        <svg
          className="h-8 w-8 text-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-text-primary">
            {state === 'uploading'
              ? 'Uploading…'
              : state === 'parsing'
                ? 'Parsing with AI…'
                : 'Drop your resume here'}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {isPending ? 'This takes a few seconds' : 'PDF only · click or drag'}
          </p>
        </div>
      </div>

      {state === 'error' && (
        <div className="w-full max-w-md rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {errorMsg}{' '}
          <button
            onClick={() => setState('idle')}
            className="underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
      >
        Browse files
      </Button>
    </div>
  )
}
