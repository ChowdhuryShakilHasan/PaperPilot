import { supabase } from './supabase'

const toRow = (userId, paper) => ({
  user_id: userId,
  openalex_id: paper.id,
  title: paper.title || 'Untitled paper',
  authors: paper.authors || [],
  year: paper.year || null,
  venue: paper.venue || '',
  citations: paper.citations || 0,
  doi: paper.doi || '',
  abstract: paper.abstract || '',
  topics: paper.topics || [],
  open_access: Boolean(paper.openAccess),
  status: paper.status || 'saved',
  collection: paper.collection || 'Unsorted',
  tags: paper.tags || [],
  note: paper.note || '',
})

const fromRow = row => ({
  id: row.openalex_id, title: row.title, authors: row.authors || [], year: row.year,
  venue: row.venue, citations: row.citations, doi: row.doi, abstract: row.abstract,
  topics: row.topics || [], openAccess: row.open_access, status: row.status,
  tags: row.tags || [], note: row.note || '', collection: row.collection || 'Unsorted', savedAt: row.created_at,
})

export async function listPapers(userId) {
  const { data, error } = await supabase.from('saved_papers').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data.map(fromRow)
}

export async function listCollections(userId) {
  const { data, error } = await supabase.from('paper_collections').select('id,name').eq('user_id', userId).order('name')
  if (error) throw error
  return data || []
}

export async function createCollection(userId, name) {
  const cleanName = name.trim().replace(/\s+/g, ' ')
  if (!cleanName || cleanName.length > 40) throw new Error('Collection names must be between 1 and 40 characters.')
  const { error } = await supabase.from('paper_collections').insert({ user_id: userId, name: cleanName })
  if (error?.code === '23505') throw new Error('A collection with that name already exists.')
  if (error) throw error
}

export async function deleteCollection(userId, name) {
  const { error: moveError } = await supabase.from('saved_papers').update({ collection: 'Unsorted' }).eq('user_id', userId).eq('collection', name)
  if (moveError) throw moveError
  const { error } = await supabase.from('paper_collections').delete().eq('user_id', userId).eq('name', name)
  if (error) throw error
}

export async function savePaper(userId, paper) {
  const { error } = await supabase.from('saved_papers').upsert(toRow(userId, paper), { onConflict: 'user_id,openalex_id' })
  if (error) throw error
}

export async function updatePaper(userId, id, updates) {
  const current = { status: 'saved', tags: [], note: '', ...updates }
  const row = {}
  if ('status' in updates) row.status = current.status
  if ('tags' in updates) row.tags = current.tags
  if ('note' in updates) row.note = current.note
  if ('collection' in updates) row.collection = current.collection
  const { error } = await supabase.from('saved_papers').update(row).eq('user_id', userId).eq('openalex_id', id)
  if (error) throw error
}

export async function removePaper(userId, id) {
  const { error } = await supabase.from('saved_papers').delete().eq('user_id', userId).eq('openalex_id', id)
  if (error) throw error
}

export const mapPaperRow = fromRow
