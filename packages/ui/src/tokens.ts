export const colors = {
  background: '#111113',
  surface: '#1c1c1f',
  border: '#2e2e32',
  'text-primary': '#f4f4f5',
  'text-secondary': '#a1a1aa',
  accent: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  status: {
    matched: '#64748b',
    drafted: '#f59e0b',
    applied: '#6366f1',
    interviewing: '#8b5cf6',
    rejected: '#ef4444',
    ghosted: '#71717a',
  },
} as const

export type ColorToken = keyof typeof colors
export type StatusColor = keyof typeof colors.status
