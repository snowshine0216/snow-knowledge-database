'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { SearchIndex, SearchResult } from '@/lib/search'

export default function SearchClient({ searchIndex }: { searchIndex: SearchIndex }) {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [ready, setReady] = useState(false)
  const [searchError, setSearchError] = useState(false)
  // flexsearch types are not fully accurate for v0.8
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flexRef = useRef<any>(null) // nocheck

  useEffect(() => {
    // Lazy-load FlexSearch only on this page
    import('flexsearch').then(({ default: FlexSearch }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const idx = new (FlexSearch as any).Document({
        document: {
          id: 'slug',
          index: ['title', 'tags', 'excerpt'],
          store: true,
        },
        tokenize: 'forward',
      })
      for (const doc of searchIndex.documents) {
        idx.add({ ...doc, tags: doc.tags.join(' ') })
      }
      flexRef.current = idx
      setReady(true)
    }).catch(() => setSearchError(true))
  }, [searchIndex])

  useEffect(() => {
    if (!ready || !flexRef.current) return
    const q = query.trim()
    if (!q) { setResults([]); return }

    const raw = flexRef.current.search(q, { limit: 20, enrich: true })
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
    setResults(hits)
  }, [query, ready])

  const topTags = [...new Set(searchIndex.documents.flatMap(d => d.tags))].slice(0, 8)

  return (
    <div className="max-w-2xl">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search articles, tags, topics..."
        autoFocus
        className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400 mb-6"
      />

      {searchError && <p className="text-sm text-red-500">Search unavailable — failed to load search index.</p>}
      {!ready && !searchError && <p className="text-sm text-gray-400">Loading search index…</p>}

      {ready && query.trim() && results.length === 0 && (
        <div>
          <p className="text-gray-500 text-sm mb-4">No articles found for &ldquo;{query}&rdquo;. Try:</p>
          <div className="flex flex-wrap gap-2">
            {topTags.map(t => (
              <button
                key={t}
                onClick={() => setQuery(t)}
                className="px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded text-sm text-gray-600 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <ul className="space-y-4">
          {results.map(r => (
            <li key={r.slug}>
              <Link href={`/wiki/${r.slug}`} className="group block">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-medium text-[#1a0dab] group-hover:underline">{r.title}</span>
                  <span className="text-xs text-gray-400 capitalize">{r.category}</span>
                </div>
                <p className="text-sm text-gray-600">{r.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!query.trim() && ready && (
        <div>
          <p className="text-sm text-gray-500 mb-3">Browse by topic:</p>
          <div className="flex flex-wrap gap-2">
            {topTags.map(t => (
              <button
                key={t}
                onClick={() => setQuery(t)}
                className="px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded text-sm text-gray-600 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
