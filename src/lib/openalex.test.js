import { afterEach, describe, expect, it, vi } from 'vitest'
import { normalizeWork, searchOpenAlex } from './openalex'

afterEach(() => vi.unstubAllGlobals())

describe('normalizeWork', () => {
  it('turns an OpenAlex work into a usable, safely defaulted paper record', () => {
    const paper = normalizeWork({
      id: 'https://openalex.org/W123',
      title: 'A useful paper',
      publication_year: 2024,
      authorships: [
        { author: { display_name: 'Ada Lovelace' } },
        { author: { display_name: 'Grace Hopper' } },
      ],
      primary_location: { source: { display_name: 'Research Journal' } },
      cited_by_count: 18,
      abstract_inverted_index: { world: [1], Hello: [0] },
      open_access: { is_oa: true },
      best_oa_location: { pdf_url: 'https://repository.example/paper.pdf', license: 'cc-by' },
    })

    expect(paper).toMatchObject({
      id: 'W123', title: 'A useful paper', year: 2024,
      authors: ['Ada Lovelace', 'Grace Hopper'], venue: 'Research Journal',
      citations: 18, abstract: 'Hello world', openAccess: true,
      status: 'saved', tags: [], note: '',
      openAccessUrl: 'https://repository.example/paper.pdf', openAccessLicense: 'cc-by',
    })
  })

  it('provides safe defaults for sparse API records', () => {
    expect(normalizeWork({})).toMatchObject({
      title: 'Untitled paper', authors: [], venue: 'Research publication',
      citations: 0, abstract: '', openAccess: false,
    })
  })
})

describe('searchOpenAlex', () => {
  it('sends encoded search and filters and returns normalized results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ meta: { count: 1 }, results: [{ id: 'W1', title: 'Paper' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await searchOpenAlex('climate change', undefined, { year: '2022', oa: true })
    const [url, options] = fetchMock.mock.calls[0]

    expect(url).toContain('search=climate+change')
    expect(url).toContain('filter=publication_year%3A2022%2Copen_access.is_oa%3Atrue')
    expect(options.headers.Accept).toBe('application/json')
    expect(result.count).toBe(1)
    expect(result.works[0]).toMatchObject({ id: 'W1', title: 'Paper' })
  })

  it('gives a useful message when the API rate limit is reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429 }))
    await expect(searchOpenAlex('test')).rejects.toThrow(/too many requests/i)
  })

  it('resolves an author and restricts works to that OpenAlex author', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{ id: 'https://openalex.org/A123' }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ meta: { count: 1 }, results: [{ id: 'W2', title: 'Author paper' }] }) })
    vi.stubGlobal('fetch', fetchMock)

    const result = await searchOpenAlex('machine learning', undefined, { author: 'Ada Lovelace', year: '2024' })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toContain('/authors?')
    expect(fetchMock.mock.calls[1][0]).toContain('authorships.author.id%3AA123')
    expect(fetchMock.mock.calls[1][0]).toContain('publication_year%3A2024')
    expect(result.works[0].title).toBe('Author paper')
  })
})
