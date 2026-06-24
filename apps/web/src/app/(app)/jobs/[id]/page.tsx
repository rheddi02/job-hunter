import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobDetailClient } from '@/modules/jobs/components/JobDetailClient'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { id } = await params
  return <JobDetailClient jobId={id} />
}
