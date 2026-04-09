import type { Article } from './types'

export type SearchResult = {
  slug: string
  title: string
  category: string
  excerpt: string
  tags: string[]
}

export type SearchIndex = {
  documents: SearchResult[]
}

export function buildSearchIndex(articles: Article[]): SearchIndex {
  return {
    documents: articles.map(a => ({
      slug: a.slug,
      title: a.title,
      category: a.category,
      excerpt: a.excerpt,
      tags: a.tags,
    })),
  }
}
