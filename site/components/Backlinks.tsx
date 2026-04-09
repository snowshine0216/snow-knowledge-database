import Link from 'next/link'
import { getAllArticles } from '@/lib/content'

export default function Backlinks({ backlinks }: { backlinks: string[] }) {
  if (backlinks.length === 0) return null

  const index = getAllArticles()

  return (
    <section className="mt-10 pt-6 border-t border-[var(--color-border)]">
      <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
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
                className="inline-block px-3 py-1 bg-[var(--color-tag-bg)] hover:bg-[var(--color-accent-bg)] hover:text-[var(--color-accent-text)] text-[var(--color-text-muted)] rounded text-sm transition-colors"
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
