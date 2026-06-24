import type { ApplicationStatus } from '@jobpilot/db'

export const LEGAL_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  MATCHED: ['DRAFTED'],
  DRAFTED: ['APPLIED'],
  APPLIED: ['INTERVIEWING', 'REJECTED', 'GHOSTED'],
  INTERVIEWING: ['APPLIED', 'REJECTED', 'GHOSTED'],
  REJECTED: [],
  GHOSTED: [],
}

export function isLegalTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return (LEGAL_TRANSITIONS[from] as readonly string[])?.includes(to) ?? false
}
