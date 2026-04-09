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
      <p className="font-semibold text-gray-700 mb-3 uppercase text-xs tracking-wide">Categories</p>
      <ul className="space-y-1">
        {CATEGORIES.map(cat => (
          <li key={cat}>
            <Link
              href={`/wiki?category=${cat}`}
              className={`flex justify-between items-center px-2 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors ${
                activeCategory === cat ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              <span className="capitalize">{cat}</span>
              <span className="text-xs text-gray-400">{counts[cat]}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/wiki"
            className="flex justify-between items-center px-2 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors text-gray-700"
          >
            <span>All articles</span>
            <span className="text-xs text-gray-400">{index.size}</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
