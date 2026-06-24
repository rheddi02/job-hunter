import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from '@/modules/profile/components/ProfileClient'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-text-primary">Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your parsed skills and experience power every job match.
        </p>
      </div>
      <ProfileClient userId={user.id} />
    </div>
  )
}
