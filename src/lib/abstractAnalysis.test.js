import { describe, expect, it } from 'vitest'
import { analyzeAbstract } from './abstractAnalysis'

describe('analyzeAbstract', () => {
  it('extracts explicit gap and future-work sentences from an abstract', () => {
    const result = analyzeAbstract('This study measures outcomes across three regions. However, little is known about long-term effects in rural communities. Further research should examine these effects over time.')

    expect(result.hasAbstract).toBe(true)
    expect(result.gaps).toEqual(['However, little is known about long-term effects in rural communities.'])
    expect(result.futureWork).toEqual(['Further research should examine these effects over time.'])
  })

  it('keeps limitations as gap clues and returns no invented future work', () => {
    const result = analyzeAbstract('The study has several limitations, including a small sample and short follow-up period. The results were promising across participants.')

    expect(result.gaps).toEqual(['The study has several limitations, including a small sample and short follow-up period.'])
    expect(result.futureWork).toEqual([])
  })

  it('handles missing abstracts without inventing findings', () => {
    expect(analyzeAbstract('')).toEqual({ gaps: [], futureWork: [], hasAbstract: false })
    expect(analyzeAbstract('This abstract reports results without naming a research gap or future direction.')).toEqual({ gaps: [], futureWork: [], hasAbstract: true })
  })
})
