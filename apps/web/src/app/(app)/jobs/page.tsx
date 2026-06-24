import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JobsClient } from '@/modules/jobs/components/JobsClient'

export default async function JobsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <JobsClient />
}
