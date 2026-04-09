import Link from 'next/link'
import { getAllArticles } from '@/lib/content'

export default function HomePage() {
  const index = getAllArticles()
  const articles = [...index.values()]
  const categories = ['concepts', 'tools', 'workflows']

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-10">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Knowledge Wiki</h1>
        <p className="text-lg text-gray-600 mb-8">
          {articles.length} articles across concepts, tools, and engineering workflows.
        </p>

        <div className="grid grid-cols-1 gap-8">
          {categories.map(cat => {
            const catArticles = articles.filter(a => a.category === cat)
            if (catArticles.length === 0) return null
            return (
              <section key={cat}>
                <h2 className="text-xl font-semibold capitalize text-gray-800 mb-3 flex items-center gap-2">
                  {cat}
                  <span className="text-sm font-normal text-gray-400">{catArticles.length}</span>
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {catArticles.slice(0, 8).map(a => (
                    <li key={a.slug}>
                      <Link
                        href={`/wiki/${a.slug}`}
                        className="text-[#1a0dab] hover:underline text-sm"
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                {catArticles.length > 8 && (
                  <Link href={`/wiki?category=${cat}`} className="text-xs text-gray-400 hover:text-blue-600 mt-2 inline-block">
                    View all {catArticles.length} →
                  </Link>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
