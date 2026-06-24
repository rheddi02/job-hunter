import { describe, it, expect } from 'vitest'
import { computeSkillOverlap, combineScores } from './score'

describe('computeSkillOverlap', () => {
  it('returns 100 when all skills match', () => {
    const { score, matchedSkills } = computeSkillOverlap(
      ['react', 'typescript'],
      'We need a React and TypeScript developer',
    )
    expect(score).toBe(100)
    expect(matchedSkills).toEqual(['react', 'typescript'])
  })

  it('returns 0 for empty profile skills', () => {
    const { score, matchedSkills } = computeSkillOverlap([], 'React developer role')
    expect(score).toBe(0)
    expect(matchedSkills).toHaveLength(0)
  })

  it('is case-insensitive', () => {
    const { matchedSkills } = computeSkillOverlap(['React', 'TypeScript'], 'react typescript job')
    expect(matchedSkills).toHaveLength(2)
  })

  it('returns 50 for half-matching skills', () => {
    const { score } = computeSkillOverlap(['react', 'vue'], 'React developer')
    expect(score).toBe(50)
  })

  it('returns 0 when no skills match', () => {
    const { score, matchedSkills } = computeSkillOverlap(['python', 'django'], 'React TypeScript role')
    expect(score).toBe(0)
    expect(matchedSkills).toHaveLength(0)
  })

  it('rounds fractional scores', () => {
    const { score } = computeSkillOverlap(['a', 'b', 'c'], 'a b role')
    expect(score).toBe(67)
  })
})

describe('combineScores', () => {
  it('applies 40% skill + 60% semantic weighting', () => {
    expect(combineScores(100, 0)).toBe(40)
    expect(combineScores(0, 100)).toBe(60)
    expect(combineScores(100, 100)).toBe(100)
    expect(combineScores(0, 0)).toBe(0)
  })

  it('clamps output to 0', () => {
    expect(combineScores(-50, -50)).toBe(0)
  })

  it('clamps output to 100', () => {
    expect(combineScores(200, 200)).toBe(100)
  })

  it('rounds to integer', () => {
    expect(Number.isInteger(combineScores(33, 67))).toBe(true)
  })
})
