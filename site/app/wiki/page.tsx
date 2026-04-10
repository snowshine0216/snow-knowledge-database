import Link from 'next/link'
import { getAllArticles } from '@/lib/content'
import type { Article } from '@/lib/types'

const CATEGORIES = ['concepts', 'tools', 'workflows', 'courses']

function subfolderLabel(name: string): string {
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/** Groups articles within a category: top-level + by subfolder (ordered). */
function groupArticles(articles: Article[]) {
  const topLevel = articles.filter(a => a.subfolder === null)
  const bySubfolder = new Map<string, Article[]>()
  for (const a of articles) {
    if (a.subfolder === null) continue
    const group = bySubfolder.get(a.subfolder) ?? []
    group.push(a)
    bySubfolder.set(a.subfolder, group)
  }
  return { topLevel, bySubfolder }
}

function ArticleCard({ a }: { a: Article }) {
  return (
    <li>
      <Link
        href={`/wiki/${a.slug}`}
        className="group block p-3 border border-[var(--color-border)] rounded hover:border-[var(--color-accent-text)] hover:bg-[var(--color-accent-bg)] transition-colors"
      >
        <p className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent-text)] leading-snug">{a.title}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">{a.excerpt}</p>
      </Link>
    </li>
  )
}

function CategorySection({ articles }: { articles: Article[] }) {
  const { topLevel, bySubfolder } = groupArticles(articles)
  const hasGroups = bySubfolder.size > 0

  return (
    <div className="space-y-8">
      {topLevel.length > 0 && (
        <div id="group-general">
          {hasGroups && (
            <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
              General
            </h3>
          )}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topLevel.map(a => <ArticleCard key={a.slug} a={a} />)}
          </ul>
        </div>
      )}

      {[...bySubfolder.entries()].map(([subfolder, items]) => (
        <div key={subfolder} id={`group-${subfolder}`}>
          <h3 className="text-sm font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-1.5 mb-3 flex items-center gap-2">
            <span>{subfolderLabel(subfolder)}</span>
            <span className="text-xs font-normal text-[var(--color-text-muted)]">({items.length})</span>
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(a => <ArticleCard key={a.slug} a={a} />)}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default async function WikiIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const index = getAllArticles()
  const allArticles = [...index.values()]

  const activeCategory = category && CATEGORIES.includes(category) ? category : null
  const displayCategories = activeCategory ? [activeCategory] : CATEGORIES

  // Compute subfolder structure for the active category (for sidebar nav)
  const activeCatArticles = activeCategory
    ? allArticles.filter(a => a.category === activeCategory)
    : []
  const { topLevel: activeCatTopLevel, bySubfolder: activeCatSubfolders } =
    groupArticles(activeCatArticles)

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 flex gap-8">
      {/* Left sidebar */}
      <aside className="w-52 shrink-0 hidden md:block">
        <nav>
          <p className="font-semibold text-[var(--color-text-muted)] mb-3 uppercase text-xs tracking-wide">
            Categories
          </p>
          <ul className="space-y-0.5">
            {/* All */}
            <li>
              <Link
                href="/wiki"
                className={`flex justify-between items-center px-2 py-1.5 rounded text-sm hover:bg-[var(--color-accent-bg)] transition-colors ${
                  !activeCategory
                    ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent-text)] font-medium'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                <span>All</span>
                <span className="text-xs text-[var(--color-text-muted)]">{allArticles.length}</span>
              </Link>
            </li>

            {/* Per-category rows, with subfolder expansion when active */}
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat
              const count = allArticles.filter(a => a.category === cat).length
              return (
                <li key={cat}>
                  <Link
                    href={`/wiki?category=${cat}`}
                    className={`flex justify-between items-center px-2 py-1.5 rounded text-sm hover:bg-[var(--color-accent-bg)] transition-colors ${
                      isActive
                        ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent-text)] font-medium'
                        : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    <span className="capitalize">{cat}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{count}</span>
                  </Link>

                  {/* Subfolder tree — only rendered for the active category */}
                  {isActive && activeCatSubfolders.size > 0 && (
                    <ul className="mt-1 ml-3 border-l border-[var(--color-border)] pl-2 space-y-0.5">
                      {activeCatTopLevel.length > 0 && (
                        <li>
                          <a
                            href="#group-general"
                            className="flex justify-between items-center px-2 py-1 rounded text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent-bg)] transition-colors"
                          >
                            <span>General</span>
                            <span>{activeCatTopLevel.length}</span>
                          </a>
                        </li>
                      )}
                      {[...activeCatSubfolders.entries()].map(([subfolder, items]) => (
                        <li key={subfolder}>
                          <a
                            href={`#group-${subfolder}`}
                            className="flex justify-between items-center px-2 py-1 rounded text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-accent-bg)] transition-colors"
                          >
                            <span className="truncate pr-1">{subfolderLabel(subfolder)}</span>
                            <span className="shrink-0">{items.length}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
          {activeCategory ? (
            <span className="capitalize">{activeCategory}</span>
          ) : (
            'All Articles'
          )}
        </h1>
        {displayCategories.map(cat => {
          const catArticles = allArticles.filter(a => a.category === cat)
          if (catArticles.length === 0) return null
          return (
            <section key={cat} className="mb-10">
              {!activeCategory && (
                <h2 className="text-lg font-semibold capitalize text-[var(--color-text)] border-b border-[var(--color-border)] pb-2 mb-4">
                  {cat}{' '}
                  <span className="text-sm font-normal text-[var(--color-text-muted)]">
                    ({catArticles.length})
                  </span>
                </h2>
              )}
              <CategorySection articles={catArticles} />
            </section>
          )
        })}
      </div>
    </div>
  )
}
