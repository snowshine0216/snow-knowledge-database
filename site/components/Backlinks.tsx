import Link from 'next/link'
import { getAllArticles } from '@/lib/content'

export default function Backlinks({ backlinks }: { backlinks: string[] }) {
  if (backlinks.length === 0) return null

  const index = getAllArticles()

  return (
    <section className="mt-10 pt-6 border-t border-gray-200">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Linked from ({backlinks.length})
      </h2>
      <ul className="flex flex-wrap gap-2">
        {backlinks.map(slug => {
          const article = index.get(slug)
          if (!article) return null
          return (
            <li key={slug}>
              <Link
                href={`/wiki/${slug}`}
                className="inline-block px-3 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 rounded text-sm transition-colors"
              >
                {article.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
