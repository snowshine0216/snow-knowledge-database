import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllArticles, getArticle, getRelatedArticles } from '@/lib/content'
import { markdownToHtml } from '@/lib/markdown'
import TableOfContents from '@/components/TableOfContents'
import Backlinks from '@/components/Backlinks'
import RelatedArticles from '@/components/RelatedArticles'
import CategoryNav from '@/components/CategoryNav'
import type { Metadata } from 'next'

type Params = { slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  const index = getAllArticles()
  return [...index.keys()].map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}
  return {
    title: `${article.title} — Knowledge Wiki`,
    description: article.excerpt,
  }
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  // Strip the leading H1 — the page header already renders the title
  const contentWithoutTitle = article.content.replace(/^#\s+.+\n?/m, '')
  const html = await markdownToHtml(contentWithoutTitle)
  const related = getRelatedArticles(article)

  const hasToc = article.headings.filter(h => h.depth <= 3).length > 0

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 flex gap-8">
      {/* Left sidebar — category nav */}
      <aside className="w-48 shrink-0 hidden lg:block">
        <CategoryNav activeCategory={article.category} />
      </aside>

      {/* Center — article body */}
      <article className="flex-1 min-w-0">
        {/* Breadcrumb */}
        <nav className="text-xs text-[var(--color-text-muted)] mb-4 flex items-center gap-1">
          <Link href="/" className="hover:text-[var(--color-accent-text)]">Home</Link>
          <span>/</span>
          <Link href="/wiki" className="hover:text-[var(--color-accent-text)]">Wiki</Link>
          <span>/</span>
          <Link href={`/wiki?category=${article.category}`} className="capitalize hover:text-[var(--color-accent-text)]">{article.category}</Link>
          <span>/</span>
          <span className="text-[var(--color-text)]">{article.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-text)] leading-tight mb-3">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="px-2 py-0.5 bg-[var(--color-tag-bg)] rounded text-[var(--color-tag-text)] capitalize">{article.category}</span>
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/wiki/tags/${tag}`}
                    className="px-2 py-0.5 bg-[var(--color-accent-bg)] text-[var(--color-accent-text)] rounded hover:opacity-80 transition-opacity text-xs"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
            {article.source && (
              <a
                href={article.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-text)] ml-auto text-xs"
              >
                Source ↗
              </a>
            )}
          </div>
        </header>

        {/* Article body */}
        <div
          className="prose max-w-[720px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Backlinks */}
        <div className="max-w-[720px]">
          <Backlinks backlinks={article.backlinks} />
        </div>
      </article>

      {/* Right sidebar — TOC + related */}
      {hasToc && (
        <aside className="w-56 shrink-0 hidden xl:block">
          <div className="sticky top-20 space-y-8">
            <TableOfContents headings={article.headings} />
            <RelatedArticles articles={related} />
          </div>
        </aside>
      )}
    </div>
  )
}
