const initialsFor = name => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'Unknown author'
  const family = parts.pop()
  const initials = parts.map(part => `${part[0].toUpperCase()}.`).join(' ')
  return initials ? `${family}, ${initials}` : family
}
const mlaName = name => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'Unknown author'
  const family = parts.pop()
  return parts.length ? `${family}, ${parts.join(' ')}` : family
}

export function citationFor(paper, style = 'APA') {
  const authors = paper.authors || []
  const year = paper.year || 'n.d.'
  const title = paper.title || 'Untitled paper'
  const venue = paper.venue || 'Research publication'
  const doi = paper.doi ? `https://doi.org/${paper.doi.replace(/^https?:\/\/doi.org\//, '')}` : ''

  if (style === 'MLA') {
    const mlaAuthors = authors.length > 1
      ? `${mlaName(authors[0])}, and ${authors.slice(1).join(', ')}`
      : mlaName(authors[0])
    return `${mlaAuthors}. “${title}.” ${venue}, ${year}.${doi ? ` ${doi}.` : ''}`
  }

  if (style === 'BibTeX') {
    const surname = (authors[0] || 'paper').split(/\s+/).at(-1).replace(/[^a-z0-9]/gi, '')
    const key = `${surname}${year}${title.split(/\s+/)[0].replace(/[^a-z0-9]/gi, '')}`
    const escape = value => String(value).replace(/[{}]/g, '')
    const doiField = paper.doi ? `,\n  doi = {${escape(paper.doi.replace(/^https?:\/\/doi.org\//, ''))}}` : ''
    return `@article{${key},\n  title = {${escape(title)}},\n  author = {${escape(authors.join(' and ') || 'Unknown author')}},\n  journal = {${escape(venue)}},\n  year = {${year}}${doiField}\n}`
  }

  const apaAuthors = !authors.length ? 'Unknown author' : authors.length > 1
    ? `${authors.slice(0, -1).map(initialsFor).join(', ')}, & ${initialsFor(authors.at(-1))}`
    : initialsFor(authors[0])
  return `${apaAuthors} (${year}). ${title}. ${venue}.${doi ? ` ${doi}` : ''}`
}
