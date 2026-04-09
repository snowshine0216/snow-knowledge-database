import type { SearchResult } from './search'

export type { SearchResult }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _flexIndex: any = null
let _docs: SearchResult[] = []
let _loading: Promise<void> | null = null

async function initIndex(): Promise<void> {
  const data = await fetch('/preview-data.json').then(r => r.json()) as Record<string, {
    title: string
    excerpt: string
    tags: string[]
    category: string
  }>

  const FlexSearch = await import('flexsearch').then(m => m.default)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idx = new (FlexSearch as any).Document({
    document: {
      id: 'slug',
      index: ['title', 'tags', 'excerpt'],
      store: true,
    },
    tokenize: 'forward',
  })

  _docs = Object.entries(data).map(([slug, d]) => ({ slug, ...d }))
  for (const doc of _docs) {
    idx.add({ ...doc, tags: doc.tags.join(' ') })
  }
  _flexIndex = idx
}

/** Lazy-init on first call — subsequent calls are instant. */
export async function ensureIndex(): Promise<void> {
  if (_flexIndex) return
  if (!_loading) _loading = initIndex()
  return _loading
}

export function clientSearch(query: string, limit = 10): SearchResult[] {
  if (!_flexIndex || !query.trim()) return []

  const raw = _flexIndex.search(query.trim(), { limit, enrich: true })
  const seen = new Set<string>()
  const hits: SearchResult[] = []
  for (const field of raw) {
    for (const item of field.result) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        hits.push(item.doc as SearchResult)
      }
    }
  }
  return hits
}

export function getAllDocs(): SearchResult[] {
  return _docs
}
