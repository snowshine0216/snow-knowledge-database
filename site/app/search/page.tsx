import { Suspense } from 'react'
import { getAllArticles } from '@/lib/content'
import { buildSearchIndex } from '@/lib/search'
import SearchClient from './SearchClient'

export default function SearchPage() {
  const index = getAllArticles()
  const searchIndex = buildSearchIndex([...index.values()])

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Search</h1>
      <Suspense fallback={<p className="text-sm text-[var(--color-text-muted)]">Loading…</p>}>
        <SearchClient searchIndex={searchIndex} />
      </Suspense>
    </div>
  )
}
