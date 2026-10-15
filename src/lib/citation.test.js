import { describe, expect, it } from 'vitest'
import { citationFor } from './citation'

const paper = {
  authors: ['Ada Lovelace', 'Grace Hopper'],
  title: 'A study of useful systems',
  year: 2024,
  venue: 'Research Journal',
  doi: 'https://doi.org/10.1000/example',
}

describe('citationFor', () => {
  it('formats APA author initials and a DOI link', () => {
    expect(citationFor(paper, 'APA')).toBe('Lovelace, A., & Hopper, G. (2024). A study of useful systems. Research Journal. https://doi.org/10.1000/example')
  })

  it('formats an MLA citation', () => {
    expect(citationFor(paper, 'MLA')).toBe('Lovelace, Ada, and Grace Hopper. “A study of useful systems.” Research Journal, 2024. https://doi.org/10.1000/example.')
  })

  it('produces a BibTeX entry and safe defaults', () => {
    expect(citationFor(paper, 'BibTeX')).toContain('@article{Lovelace2024A,')
    expect(citationFor({}, 'APA')).toContain('Unknown author (n.d.). Untitled paper.')
  })
})
