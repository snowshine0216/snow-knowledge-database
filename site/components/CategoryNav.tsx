import Link from 'next/link'
import { getAllArticles } from '@/lib/content'

const CATEGORIES = ['concepts', 'tools', 'workflows']

export default function CategoryNav({ activeCategory }: { activeCategory?: string }) {
  const index = getAllArticles()
  const counts = Object.fromEntries(
    CATEGORIES.map(cat => [
      cat,
      [...index.values()].filter(a => a.category === cat).length,
    ])
  )

  return (
    <nav>
      <p className="font-semibold text-[var(--color-text-muted)] mb-3 uppercase text-xs tracking-wide">Categories</p>
      <ul className="space-y-1">
        {CATEGORIES.map(cat => (
          <li key={cat}>
            <Link
              href={`/wiki?category=${cat}`}
              className={`flex justify-between items-center px-2 py-1.5 rounded text-sm hover:bg-[var(--color-accent-bg)] transition-colors ${
                activeCategory === cat
                  ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent-text)] font-medium'
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              <span className="capitalize">{cat}</span>
              <span className="text-xs text-[var(--color-text-muted)]">{counts[cat]}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/wiki"
            className="flex justify-between items-center px-2 py-1.5 rounded text-sm hover:bg-[var(--color-accent-bg)] transition-colors text-[var(--color-text-muted)]"
          >
            <span>All articles</span>
            <span className="text-xs text-[var(--color-text-muted)]">{index.size}</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
