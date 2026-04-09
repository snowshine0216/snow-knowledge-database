'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search wiki..."
        className="w-48 lg:w-64 px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-l bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent-text)]"
      />
      <button
        type="submit"
        className="px-3 py-1.5 bg-[var(--color-tag-bg)] border border-l-0 border-[var(--color-border)] rounded-r text-sm text-[var(--color-tag-text)] hover:bg-[var(--color-accent-bg)] transition-colors"
      >
        Go
      </button>
    </form>
  )
}
