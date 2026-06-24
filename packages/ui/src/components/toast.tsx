'use client'

import * as React from 'react'
import { cn } from '../lib/cn'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toaster toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

function Toaster({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-center gap-3 rounded-md border px-4 py-3 text-sm shadow-lg',
            'animate-in slide-in-from-bottom-2 fade-in-0 duration-200',
            toast.type === 'success' && 'border-success/30 bg-surface text-text-primary',
            toast.type === 'error' && 'border-danger/30 bg-surface text-text-primary',
            toast.type === 'info' && 'border-border bg-surface text-text-primary',
          )}
        >
          <span
            className={cn(
              'h-2 w-2 shrink-0 rounded-full',
              toast.type === 'success' && 'bg-success',
              toast.type === 'error' && 'bg-danger',
              toast.type === 'info' && 'bg-accent',
            )}
          />
          {toast.message}
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-2 text-text-secondary hover:text-text-primary"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
