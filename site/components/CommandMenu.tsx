'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { ensureIndex, clientSearch, getAllDocs } from '@/lib/client-search'
import type { SearchResult } from '@/lib/client-search'

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const router = useRouter()

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Lazy-init search index when menu first opens
  useEffect(() => {
    if (!open) return
    ensureIndex()
      .then(() => {
        setReady(true)
        setResults(getAllDocs().slice(0, 8))
      })
      .catch(() => setLoadError(true))
  }, [open])

  const handleQuery = useCallback((q: string) => {
    setQuery(q)
    if (!ready) return
    if (!q.trim()) {
      setResults(getAllDocs().slice(0, 8))
      return
    }
    setResults(clientSearch(q, 10))
  }, [ready])

  const navigate = useCallback((slug: string) => {
    setOpen(false)
    setQuery('')
    router.push(`/wiki/${slug}`)
  }, [router])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl mx-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b border-[var(--color-border)] px-4">
            <svg className="w-4 h-4 text-[var(--color-text-muted)] shrink-0 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <Command.Input
              value={query}
              onValueChange={handleQuery}
              placeholder="Search articles…"
              className="flex-1 py-4 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none text-sm"
            />
            <kbd className="text-xs font-mono bg-[var(--color-tag-bg)] text-[var(--color-tag-text)] px-1.5 py-0.5 rounded border border-[var(--color-border)] ml-2">Esc</kbd>
          </div>

          <Command.List className="max-h-[360px] overflow-y-auto p-2">
            {loadError && (
              <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                Search unavailable — failed to load index.
              </div>
            )}
            {results.length === 0 && query.trim() && ready && (
              <Command.Empty className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                No articles found for &ldquo;{query}&rdquo;
              </Command.Empty>
            )}

            {results.length > 0 && (
              <Command.Group heading={query.trim() ? 'Results' : 'Recent articles'} className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-[var(--color-text-muted)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide">
                {results.map(r => (
                  <Command.Item
                    key={r.slug}
                    value={r.slug}
                    onSelect={() => navigate(r.slug)}
                    className="flex flex-col px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-[var(--color-accent-bg)] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--color-text)] truncate">{r.title}</span>
                      <span className="text-xs text-[var(--color-text-muted)] capitalize shrink-0">{r.category}</span>
                    </div>
                    {r.excerpt && (
                      <span className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1">{r.excerpt}</span>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t border-[var(--color-border)] px-4 py-2 flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">Esc</kbd> close</span>
          </div>
        </Command>
      </div>
    </div>
  )
}
