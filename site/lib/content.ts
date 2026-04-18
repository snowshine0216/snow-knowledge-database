import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Article, Heading, WikiIndex } from './types'

const WIKI_DIR = path.join(process.cwd(), '..', 'wiki')
const CATEGORIES = ['claude', 'agent-frameworks', 'ai-engineering', 'rag-and-knowledge', 'dev-tools', 'learning-and-business', 'courses']

export function normalize(slug: string): string {
  return slug.toLowerCase().replace(/\s+/g, '-')
}

function extractWikilinks(content: string): string[] {
  const pattern = /\[\[([^\]]+)\]\]/g
  const links: string[] = []
  let match
  while ((match = pattern.exec(content)) !== null) {
    const inner = match[1]
    const target = inner.includes('|') ? inner.split('|')[0] : inner
    links.push(normalize(target.trim()))
  }
  return [...new Set(links)]
}

function extractHeadings(content: string): Heading[] {
  const lines = content.split('\n')
  const headings: Heading[] = []
  const slugCounts: Record<string, number> = {}

  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+)$/)
    if (!m) continue
    const depth = m[1].length
    const text = m[2].trim()
    let slug = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    if (slugCounts[slug] !== undefined) {
      slugCounts[slug]++
      slug = `${slug}-${slugCounts[slug]}`
    } else {
      slugCounts[slug] = 0
    }
    headings.push({ depth, text, slug })
  }
  return headings
}

function extractExcerpt(content: string): string {
  const stripped = content
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  return stripped.slice(0, 150)
}

function readArticle(filePath: string, category: string, categoryDir: string): Article {
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const filename = path.basename(filePath, '.md')
  const slug = filename  // always filename-based, never title-derived (CJK safety)

  const firstH1 = content.match(/^#\s+(.+)$/m)
  const title = (data.title as string | undefined)
    ?? (firstH1 ? firstH1[1].trim() : filename)

  // Compute subfolder: the immediate parent dir name if the file is nested, else null
  const parentDir = path.dirname(filePath)
  const subfolder = parentDir === categoryDir ? null : path.basename(parentDir)

  return {
    slug,
    title,
    category,
    subfolder,
    tags: Array.isArray(data.tags) ? data.tags : [],
    source: (data.source as string | undefined) ?? '',
    content,
    headings: extractHeadings(content),
    outlinks: extractWikilinks(content),
    backlinks: [],  // filled in after all articles are loaded
    excerpt: extractExcerpt(content),
  }
}

function walkMdFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkMdFiles(full))
    } else if (entry.name.endsWith('.md')) {
      results.push(full)
    }
  }
  return results
}

function buildWikiIndex(): WikiIndex {
  const index: WikiIndex = new Map()

  for (const category of CATEGORIES) {
    const dir = path.join(WIKI_DIR, category)
    if (!fs.existsSync(dir)) continue

    for (const filePath of walkMdFiles(dir)) {
      const article = readArticle(filePath, category, dir)
      index.set(normalize(article.slug), article)
    }
  }

  // Compute backlinks by reversing the outlink map
  for (const [slug, article] of index) {
    for (const target of article.outlinks) {
      const targetArticle = index.get(target)
      if (targetArticle && !targetArticle.backlinks.includes(slug)) {
        targetArticle.backlinks.push(slug)
      }
    }
  }

  return index
}

// Singleton cache — prevents 44 filesystem scans per build in SSG parallel workers
let _cache: WikiIndex | null = null

export function getAllArticles(): WikiIndex {
  if (_cache) return _cache
  _cache = buildWikiIndex()
  return _cache
}

export function getArticle(slug: string): Article | undefined {
  return getAllArticles().get(normalize(slug))
}

export function getRelatedArticles(article: Article, limit = 5): Article[] {
  const index = getAllArticles()
  const candidates: Array<{ article: Article; score: number }> = []

  for (const [slug, candidate] of index) {
    if (slug === normalize(article.slug)) continue
    const shared = candidate.tags.filter(t => article.tags.includes(t)).length
    if (shared > 0) candidates.push({ article: candidate, score: shared })
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(c => c.article)
}
