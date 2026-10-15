import { describe, expect, it } from 'vitest'
import { analyzePaperText } from './paperAnalysis'

describe('analyzePaperText', () => {
  it('returns matched evidence with page numbers for each analysis category', () => {
    const result = analyzePaperText([
      { page: 3, text: 'Introduction. Little is known about long-term effects in rural communities, especially for older adults.' },
      { page: 8, text: 'Limitations. This study has several limitations, including a small sample and short follow-up period.' },
      { page: 9, text: 'Future work. Further research should examine these outcomes across more regions.' },
    ])

    expect(result.gaps[0]).toMatchObject({ page: 3 })
    expect(result.gaps[0].sentence).toMatch(/Little is known/i)
    expect(result.limitations[0]).toMatchObject({ page: 8 })
    expect(result.futureWork[0]).toMatchObject({ page: 9 })
  })

  it('does not include negated claims or text after the references heading', () => {
    const result = analyzePaperText([
      { page: 4, text: 'This abstract reports results without naming a research gap or future direction.' },
      { page: 10, text: 'References\nFurther research should examine this topic in another context.' },
    ])

    expect(result.gaps).toEqual([])
    expect(result.futureWork).toEqual([])
  })
})
