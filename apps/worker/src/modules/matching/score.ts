export function computeSkillOverlap(
  profileSkills: string[],
  jobText: string,
): { score: number; matchedSkills: string[] } {
  if (profileSkills.length === 0) return { score: 0, matchedSkills: [] }
  const lower = jobText.toLowerCase()
  const matched = profileSkills.filter((s) => lower.includes(s.toLowerCase()))
  return {
    score: Math.round((matched.length / profileSkills.length) * 100),
    matchedSkills: matched,
  }
}

export function combineScores(skillScore: number, semanticScore: number): number {
  return Math.min(100, Math.max(0, Math.round(0.4 * skillScore + 0.6 * semanticScore)))
}
