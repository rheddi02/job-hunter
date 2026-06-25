import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const redirectTo = searchParams.get('redirectTo') ?? '/login'

  const supabase = await createClient()
  await supabase.auth.signOut()

  return NextResponse.redirect(`${origin}${redirectTo}`)
}
