import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CoverLetterClient } from '@/modules/coverletters/components/CoverLetterClient'

export default async function CoverLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { id } = await params
  return <CoverLetterClient jobId={id} />
}
