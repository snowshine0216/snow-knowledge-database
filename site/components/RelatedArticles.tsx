import Link from 'next/link'
import type { Article } from '@/lib/types'

export default function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null

  return (
    <section className="mt-6 pt-6 border-t border-gray-200">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Related Articles
      </h2>
      <ul className="space-y-2">
        {articles.map(a => (
          <li key={a.slug}>
            <Link
              href={`/wiki/${a.slug}`}
              className="group flex flex-col hover:text-blue-700 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800 group-hover:text-blue-700">
                {a.title}
              </span>
              <span className="text-xs text-gray-400 capitalize">{a.category}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
