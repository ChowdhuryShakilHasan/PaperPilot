export const cleanOpenAlexId = value => String(value || '').replace('https://openalex.org/', '')

export function normalizeWork(work) {
  return {
    id: cleanOpenAlexId(work.id),
    title: work.title || work.display_name || 'Untitled paper',
    authors: (work.authorships || []).slice(0, 20).map(author => author.author?.display_name).filter(Boolean),
    year: work.publication_year,
    venue: work.primary_location?.source?.display_name || work.primary_topic?.display_name || 'Research publication',
    citations: work.cited_by_count || 0,
    doi: work.doi || work.primary_location?.landing_page_url || '',
    openAccessUrl: work.best_oa_location?.pdf_url || work.best_oa_location?.landing_page_url || work.open_access?.oa_url || '',
    openAccessLicense: work.best_oa_location?.license || '',
    abstract: work.abstract_inverted_index
      ? Object.entries(work.abstract_inverted_index)
        .flatMap(([word, positions]) => positions.map(position => [position, word]))
        .sort((a, b) => a[0] - b[0])
        .map(entry => entry[1])
        .join(' ')
      : '',
    topics: [work.primary_topic?.display_name, work.primary_topic?.field?.display_name].filter(Boolean),
    openAccess: Boolean(work.open_access?.is_oa),
    status: 'saved',
    tags: [],
    note: '',
  }
}

export async function searchOpenAlex(query, signal, filters = {}) {
  const params = new URLSearchParams({
    search: query,
    per_page: '12',
    select: 'id,title,authorships,publication_year,primary_location,primary_topic,cited_by_count,doi,abstract_inverted_index,open_access,best_oa_location',
  })
  const rules = []
  if (filters.yearFrom || filters.yearTo) rules.push(`publication_year:${filters.yearFrom || '1900'}-${filters.yearTo || new Date().getFullYear()}`)
  else if (filters.year) rules.push(`publication_year:${filters.year}`)
  if (filters.oa) rules.push('open_access.is_oa:true')
  if (filters.author?.trim()) {
    const authorParams = new URLSearchParams({ search: filters.author.trim(), per_page: '1', select: 'id,display_name' })
    const authorResponse = await fetch(`https://api.openalex.org/authors?${authorParams}`, { signal, headers: { Accept: 'application/json' } })
    if (!authorResponse.ok) throw apiError(authorResponse.status, 'author search')
    const authorData = await authorResponse.json()
    const author = authorData.results?.[0]
    if (!author) return { works: [], count: 0 }
    rules.push(`authorships.author.id:${cleanOpenAlexId(author.id)}`)
  }
  if (rules.length) params.set('filter', rules.join(','))
  const response = await fetch(`https://api.openalex.org/works?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw apiError(response.status, 'paper search')
  }
  const data = await response.json()
  return { works: (data.results || []).map(normalizeWork), count: data.meta?.count || 0 }
}

function apiError(status, action) {
  const message = status === 429
    ? 'OpenAlex is receiving too many requests right now. Please wait a moment and try again.'
    : `OpenAlex ${action} failed (${status}). Please try again.`
  const error = new Error(message)
  error.status = status
  return error
}
