'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import SearchBar from './SearchBar'

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render icon after mount
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-8 h-8" />

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
    >
      {isDark ? (
        /* Sun icon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        /* Moon icon */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}

export default function Header() {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between h-12">
        <Link href="/" className="font-bold text-[var(--color-text)] hover:text-[var(--color-accent-text)] text-lg tracking-tight">
          Knowledge Wiki
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/wiki" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-text)]">Articles</Link>
          <Link href="/search" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-text)]">
            Search <kbd className="ml-1 text-xs font-mono bg-[var(--color-tag-bg)] text-[var(--color-tag-text)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">⌘K</kbd>
          </Link>
          <SearchBar />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
