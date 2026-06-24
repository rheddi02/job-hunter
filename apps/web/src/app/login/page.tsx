'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'

type LoginState = 'idle' | 'loading' | 'sent' | 'error'

export default function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [state, setState] = React.useState<LoginState>('idle')
  const [errorMsg, setErrorMsg] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setState('error')
      setErrorMsg(error.message)
    } else {
      setState('sent')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-md border border-border bg-surface p-8">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">JobPilot</h1>
          <p className="mt-1 text-sm text-text-secondary">Enter your email to sign in.</p>
        </div>

        {state === 'sent' ? (
          <div className="rounded-md border border-success/30 bg-success/10 p-4 text-sm text-text-primary">
            Check your email — a sign-in link was sent to <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-text-secondary">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {state === 'error' && (
              <p className="text-xs text-danger">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
            >
              {state === 'loading' ? 'Sending…' : 'Send sign-in link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
