import * as React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TRPCProvider } from '@/lib/trpc-provider'

const NAV_LINKS = [
  { href: '/profile', label: 'Profile' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/applications', label: 'Applications' },
  { href: '/sources', label: 'Sources' },
] as const

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <TRPCProvider>
      <div className="flex min-h-screen bg-background">
        <aside className="w-48 shrink-0 border-r border-border">
          <div className="flex h-12 items-center border-b border-border px-4">
            <span className="text-sm font-semibold text-text-primary">JobPilot</span>
          </div>
          <nav className="p-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex h-8 items-center rounded-md px-3 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </TRPCProvider>
  )
}
