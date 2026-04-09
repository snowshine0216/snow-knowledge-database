import Link from 'next/link'
import { getAllArticles } from '@/lib/content'

const CATEGORIES = ['concepts', 'tools', 'workflows']

export default async function WikiIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const index = getAllArticles()
  const allArticles = [...index.values()]

  // If a category filter is active, show only that category; otherwise show all
  const activeCategory = category && CATEGORIES.includes(category) ? category : null
  const displayCategories = activeCategory ? [activeCategory] : CATEGORIES

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 flex gap-8">
      {/* Left sidebar */}
      <aside className="w-48 shrink-0 hidden md:block">
        <nav>
          <p className="font-semibold text-gray-700 mb-3 uppercase text-xs tracking-wide">Categories</p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/wiki"
                className={`flex justify-between items-center px-2 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors ${
                  !activeCategory ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                <span>All</span>
                <span className="text-xs text-gray-400">{allArticles.length}</span>
              </Link>
            </li>
            {CATEGORIES.map(cat => (
              <li key={cat}>
                <Link
                  href={`/wiki?category=${cat}`}
                  className={`flex justify-between items-center px-2 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors ${
                    activeCategory === cat ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className="capitalize">{cat}</span>
                  <span className="text-xs text-gray-400">
                    {allArticles.filter(a => a.category === cat).length}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
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
            <section key={cat} className="mb-8">
              {!activeCategory && (
                <h2 className="text-lg font-semibold capitalize text-gray-700 border-b border-gray-200 pb-2 mb-4">
                  {cat} <span className="text-sm font-normal text-gray-400">({catArticles.length})</span>
                </h2>
              )}
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catArticles.map(a => (
                  <li key={a.slug}>
                    <Link
                      href={`/wiki/${a.slug}`}
                      className="group block p-3 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 leading-snug">{a.title}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{a.excerpt}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
