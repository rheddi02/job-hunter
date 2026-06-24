'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc'
import { ProfileSkeleton, Button } from '@jobpilot/ui'
import { ResumeUpload } from './ResumeUpload'
import { SkillsEditor } from './SkillsEditor'

interface ProfileClientProps {
  userId: string
}

export function ProfileClient({ userId }: ProfileClientProps) {
  const [forceEmpty, setForceEmpty] = React.useState(false)
  const { data: profile, isLoading, isError, error, refetch } = trpc.profile.get.useQuery()

  if (isLoading) return <ProfileSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-md border border-danger/30 bg-danger/10 p-8 text-center">
        <p className="text-sm text-text-primary">Could not load profile.</p>
        <p className="text-xs text-text-secondary">{error.message}</p>
        <Button variant="secondary" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const hasProfile = !!profile && !forceEmpty

  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <p className="text-sm text-text-secondary">
          Upload your resume so JobPilot can score job matches against your skills.
        </p>
        <ResumeUpload
          userId={userId}
          onParsed={() => {
            setForceEmpty(false)
            void refetch()
          }}
        />
      </div>
    )
  }

  return (
    <SkillsEditor
      profile={profile}
      onReplace={() => setForceEmpty(true)}
    />
  )
}
