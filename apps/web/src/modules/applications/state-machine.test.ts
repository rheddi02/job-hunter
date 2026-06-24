import { describe, it, expect } from 'vitest'
import { isLegalTransition, LEGAL_TRANSITIONS } from './state-machine'

// Enumerate all statuses as string literals (matches the Prisma enum values)
const ALL_STATUSES = ['MATCHED', 'DRAFTED', 'APPLIED', 'INTERVIEWING', 'REJECTED', 'GHOSTED'] as const
type Status = typeof ALL_STATUSES[number]

describe('isLegalTransition', () => {
  describe('legal transitions', () => {
    it('MATCHED → DRAFTED', () => expect(isLegalTransition('MATCHED', 'DRAFTED')).toBe(true))
    it('DRAFTED → APPLIED', () => expect(isLegalTransition('DRAFTED', 'APPLIED')).toBe(true))
    it('APPLIED → INTERVIEWING', () => expect(isLegalTransition('APPLIED', 'INTERVIEWING')).toBe(true))
    it('APPLIED → REJECTED', () => expect(isLegalTransition('APPLIED', 'REJECTED')).toBe(true))
    it('APPLIED → GHOSTED', () => expect(isLegalTransition('APPLIED', 'GHOSTED')).toBe(true))
    it('INTERVIEWING → APPLIED', () => expect(isLegalTransition('INTERVIEWING', 'APPLIED')).toBe(true))
    it('INTERVIEWING → REJECTED', () => expect(isLegalTransition('INTERVIEWING', 'REJECTED')).toBe(true))
    it('INTERVIEWING → GHOSTED', () => expect(isLegalTransition('INTERVIEWING', 'GHOSTED')).toBe(true))
  })

  describe('illegal transitions', () => {
    it('MATCHED → MATCHED', () => expect(isLegalTransition('MATCHED', 'MATCHED')).toBe(false))
    it('MATCHED → APPLIED', () => expect(isLegalTransition('MATCHED', 'APPLIED')).toBe(false))
    it('MATCHED → REJECTED', () => expect(isLegalTransition('MATCHED', 'REJECTED')).toBe(false))
    it('DRAFTED → DRAFTED', () => expect(isLegalTransition('DRAFTED', 'DRAFTED')).toBe(false))
    it('DRAFTED → MATCHED', () => expect(isLegalTransition('DRAFTED', 'MATCHED')).toBe(false))
    it('DRAFTED → REJECTED', () => expect(isLegalTransition('DRAFTED', 'REJECTED')).toBe(false))
    it('REJECTED → anything', () => {
      for (const to of ALL_STATUSES) {
        expect(isLegalTransition('REJECTED', to as Status)).toBe(false)
      }
    })
    it('GHOSTED → anything', () => {
      for (const to of ALL_STATUSES) {
        expect(isLegalTransition('GHOSTED', to as Status)).toBe(false)
      }
    })
  })

  describe('LEGAL_TRANSITIONS is exhaustive', () => {
    it('covers every status', () => {
      for (const status of ALL_STATUSES) {
        expect(LEGAL_TRANSITIONS).toHaveProperty(status)
      }
    })
  })
})
