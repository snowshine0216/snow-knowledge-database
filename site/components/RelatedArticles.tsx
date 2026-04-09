import Link from 'next/link'
import type { Article } from '@/lib/types'

export default function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null

  return (
    <section className="mt-6 pt-6 border-t border-[var(--color-border)]">
      <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
        Related Articles
      </h2>
      <ul className="space-y-2">
        {articles.map(a => (
          <li key={a.slug}>
            <Link
              href={`/wiki/${a.slug}`}
              className="group flex flex-col hover:text-[var(--color-accent-text)] transition-colors"
            >
              <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent-text)]">
                {a.title}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] capitalize">{a.category}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
