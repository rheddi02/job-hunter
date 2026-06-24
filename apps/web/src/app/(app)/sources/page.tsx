import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SourcesClient } from '@/modules/jobs/components/SourcesClient'

export default async function SourcesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <SourcesClient />
}
