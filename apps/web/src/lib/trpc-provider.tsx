'use client'

import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { trpc } from './trpc'
import { ToastProvider } from '@jobpilot/ui'

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
      }),
  )
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: `${getBaseUrl()}/api/trpc` })],
    }),
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </trpc.Provider>
  )
}
