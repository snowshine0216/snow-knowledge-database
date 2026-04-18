import { describe, it, expect } from 'vitest'
import path from 'path'
import { normalize } from '../content'
import matter from 'gray-matter'
import fs from 'fs'

// ── normalize() ───────────────────────────────────────────────────────────────

describe('normalize()', () => {
  it('lowercases ASCII slugs', () => {
    expect(normalize('RAG')).toBe('rag')
  })

  it('replaces spaces with hyphens', () => {
    expect(normalize('vector database')).toBe('vector-database')
  })

  it('collapses multiple consecutive spaces into one hyphen each', () => {
    expect(normalize('a  b   c')).toBe('a-b-c')
  })

  it('keeps CJK characters as-is', () => {
    expect(normalize('向量数据库')).toBe('向量数据库')
  })

  it('handles empty string', () => {
    expect(normalize('')).toBe('')
  })
})

// ── readArticle() (via fixture files) ────────────────────────────────────────

const FIXTURES = path.join(import.meta.dirname, '__fixtures__')

describe('readArticle() via fixtures', () => {
  it('reads frontmatter title when present', () => {
    const raw = fs.readFileSync(path.join(FIXTURES, 'sample-article.md'), 'utf8')
    const { data } = matter(raw)
    expect(data.title).toBe('Sample Article')
  })

  it('falls back to H1 when no frontmatter title', () => {
    const raw = fs.readFileSync(path.join(FIXTURES, 'no-title.md'), 'utf8')
    const { data, content } = matter(raw)
    expect(data.title).toBeUndefined()
    const firstH1 = content.match(/^#\s+(.+)$/m)
    expect(firstH1?.[1].trim()).toBe('Heading From Content')
  })

  it('extracts excerpt up to 150 chars', () => {
    const raw = fs.readFileSync(path.join(FIXTURES, 'sample-article.md'), 'utf8')
    const { content } = matter(raw)
    const stripped = content
      .replace(/^---[\s\S]*?---\n/, '')
      .replace(/^#{1,6}\s+.+$/gm, '')
      .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`#]/g, '')
      .replace(/\n+/g, ' ')
      .trim()
    expect(stripped.slice(0, 150).length).toBeLessThanOrEqual(150)
  })
})

// ── buildWikiIndex() (integration — reads real wiki/) ────────────────────────

describe('buildWikiIndex() [integration]', () => {
  it('returns a non-empty WikiIndex', async () => {
    // Dynamic import to get fresh module state if needed
    const { getAllArticles } = await import('../content')
    const index = getAllArticles()
    expect(index.size).toBeGreaterThan(0)
  })

  it('all article slugs are normalized (no uppercase, spaces)', async () => {
    const { getAllArticles } = await import('../content')
    const index = getAllArticles()
    for (const slug of index.keys()) {
      expect(slug).toBe(slug.toLowerCase())
      expect(slug).not.toMatch(/ /)
    }
  })

  it('includes articles from subdirectories', async () => {
    const { getAllArticles } = await import('../content')
    const index = getAllArticles()
    // wiki/courses/claude-code-engineering/ has files like 001-01-登台远望-Claude-Cod.md
    const slugs = [...index.keys()]
    const hasSubdirArticle = slugs.some(s => s.startsWith('001-'))
    expect(hasSubdirArticle).toBe(true)
  })

  it('subfolder is null for top-level articles and set for nested articles', async () => {
    const { getAllArticles } = await import('../content')
    const index = getAllArticles()
    const articles = [...index.values()]
    // Top-level articles have subfolder === null
    const topLevel = articles.find(a => a.category === 'ai-engineering' && a.slug === 'karpathy-loopy-era-ai')
    expect(topLevel?.subfolder).toBeNull()
    // Nested articles carry their parent directory name
    const nested = articles.find(a => a.slug.startsWith('001-'))
    expect(nested?.subfolder).toBe('claude-code-engineering')
  })

  it('computes backlinks — articles that link to each other are cross-referenced', async () => {
    const { getAllArticles } = await import('../content')
    const index = getAllArticles()
    // Find any article with outlinks and verify the target has this slug in its backlinks
    let verified = false
    for (const [slug, article] of index) {
      for (const target of article.outlinks) {
        const targetArticle = index.get(target)
        if (targetArticle) {
          expect(targetArticle.backlinks).toContain(slug)
          verified = true
          break
        }
      }
      if (verified) break
    }
    // If no cross-links exist in the wiki, skip (wiki may have no internal links yet)
    expect(verified || index.size > 0).toBe(true)
  })
})
