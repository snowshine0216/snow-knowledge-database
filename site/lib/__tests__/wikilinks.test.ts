import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkWikilinks from '../wikilinks'
import type { WikiIndex, Article } from '../types'

function makeIndex(slugs: string[]): WikiIndex {
  const index: WikiIndex = new Map()
  for (const slug of slugs) {
    const article: Article = {
      slug,
      title: slug,
      category: 'concepts',
      tags: [],
      source: '',
      content: '',
      headings: [],
      outlinks: [],
      backlinks: [],
      excerpt: '',
    }
    index.set(slug, article)
  }
  return index
}

async function toHtml(md: string, index: WikiIndex): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkWikilinks, { index })
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md)
  return String(result)
}

// ── remarkWikilinks ───────────────────────────────────────────────────────────

describe('remarkWikilinks', () => {
  it('transforms [[slug]] into an anchor with class wikilink', async () => {
    const index = makeIndex(['rag'])
    const html = await toHtml('See [[rag]] for more.', index)
    expect(html).toContain('<a')
    expect(html).toContain('class="wikilink"')
    expect(html).toContain('href="/wiki/rag"')
    expect(html).toContain('>rag<')
  })

  it('renders display text for [[target|display]] pipe syntax', async () => {
    const index = makeIndex(['vector-database'])
    const html = await toHtml('See [[vector-database|向量数据库]].', index)
    expect(html).toContain('>向量数据库<')
    expect(html).toContain('href="/wiki/vector-database"')
  })

  it('adds wikilink-broken class for unknown targets', async () => {
    const index = makeIndex([]) // empty index — no valid targets
    const html = await toHtml('See [[missing-article]].', index)
    expect(html).toContain('wikilink-broken')
    expect(html).toContain('href="/wiki/missing-article"')
  })

  it('normalizes CJK target slugs correctly', async () => {
    const index = makeIndex(['向量数据库'])
    const html = await toHtml('See [[向量数据库]].', index)
    expect(html).toContain('class="wikilink"')
    // rehype-stringify percent-encodes non-ASCII hrefs
    expect(html).toContain('data-slug="向量数据库"')
  })

  it('leaves plain text without wikilinks unchanged', async () => {
    const index = makeIndex([])
    const html = await toHtml('No links here.', index)
    expect(html).not.toContain('wikilink')
    expect(html).toContain('No links here.')
  })
})
