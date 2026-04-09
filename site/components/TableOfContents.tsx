'use client'

import { useEffect, useState } from 'react'
import type { Heading } from '@/lib/types'

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeSlug, setActiveSlug] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSlug(entry.target.id)
        }
      },
      { rootMargin: '0px 0px -60% 0px' }
    )
    const els = document.querySelectorAll('h1[id],h2[id],h3[id],h4[id]')
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const filtered = headings.filter(h => h.depth <= 3)
  if (filtered.length === 0) return null

  return (
    <nav className="text-sm">
      <p className="font-semibold text-gray-700 mb-2 uppercase text-xs tracking-wide">Contents</p>
      <ul className="space-y-1">
        {filtered.map(h => (
          <li
            key={h.slug}
            style={{ paddingLeft: `${(h.depth - 1) * 12}px` }}
          >
            <a
              href={`#${h.slug}`}
              className={`block py-0.5 text-gray-600 hover:text-blue-600 transition-colors leading-snug ${
                activeSlug === h.slug ? 'text-blue-600 font-medium' : ''
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
