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
        className="w-48 lg:w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-l bg-white focus:outline-none focus:border-blue-400"
      />
      <button
        type="submit"
        className="px-3 py-1.5 bg-gray-100 border border-l-0 border-gray-300 rounded-r text-sm text-gray-600 hover:bg-gray-200 transition-colors"
      >
        Go
      </button>
    </form>
  )
}
