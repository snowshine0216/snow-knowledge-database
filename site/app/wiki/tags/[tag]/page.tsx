import Link from 'next/link'
import { getAllArticles } from '@/lib/content'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Params = { tag: string }

export async function generateStaticParams(): Promise<Params[]> {
  const index = getAllArticles()
  const tags = new Set<string>()
  for (const article of index.values()) {
    article.tags.forEach(t => tags.add(t))
  }
  return [...tags].map(tag => ({ tag }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { tag } = await params
  return { title: `#${tag} — Knowledge Wiki` }
}

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { tag } = await params
  const index = getAllArticles()
  const articles = [...index.values()].filter(a => a.tags.includes(tag))

  if (articles.length === 0) notFound()

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      <nav className="text-xs text-[var(--color-text-muted)] mb-4 flex items-center gap-1">
        <Link href="/" className="hover:text-[var(--color-accent-text)]">Home</Link>
        <span>/</span>
        <Link href="/wiki" className="hover:text-[var(--color-accent-text)]">Wiki</Link>
        <span>/</span>
        <span className="text-[var(--color-text)]">#{tag}</span>
      </nav>

      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">#{tag}</h1>
      <p className="text-[var(--color-text-muted)] text-sm mb-6">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {articles.map(a => (
          <li key={a.slug}>
            <Link
              href={`/wiki/${a.slug}`}
              className="group block p-4 border border-[var(--color-border)] rounded-lg hover:border-[var(--color-accent-text)] hover:bg-[var(--color-accent-bg)] transition-colors"
            >
              <p className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent-text)] mb-1">{a.title}</p>
              <p className="text-xs text-[var(--color-text-muted)] capitalize mb-2">{a.category}</p>
              <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{a.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
