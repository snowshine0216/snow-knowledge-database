import { describe, it, expect } from 'vitest'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
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
      category: 'ai-engineering',
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

async function toHtml(md: string, index: WikiIndex, slug?: string, category?: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkWikilinks, { index, slug, category })
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

  it('adds wikilink-broken class for unknown targets and links to Wikipedia', async () => {
    const index = makeIndex([]) // empty index — no valid targets
    const html = await toHtml('See [[missing-article]].', index)
    expect(html).toContain('wikilink-broken')
    // Broken links redirect to Wikipedia search (merged behavior from main)
    expect(html).toContain('wikipedia.org')
    expect(html).toContain('target="_blank"')
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

// ── image syntax ──────────────────────────────────────────────────────────────

describe('remarkWikilinks — image syntax', () => {
  it('renders ![[photo.png]] as <img> with full path when slug and category provided', async () => {
    const index = makeIndex([])
    const html = await toHtml('![[photo.png]]', index, 'my-article', 'dev-tools')
    expect(html).toContain('<img')
    expect(html).toContain('src="/wiki-assets/dev-tools/my-article/photo.png"')
    expect(html).toContain('alt="photo.png"')
  })

  it('renders ![[photo.png]] as <img> with flat path when no slug/category', async () => {
    const index = makeIndex([])
    const html = await toHtml('![[photo.png]]', index)
    expect(html).toContain('<img')
    expect(html).toContain('src="/wiki-assets/photo.png"')
  })

  it('uses pipe display text as alt attribute', async () => {
    const index = makeIndex([])
    const html = await toHtml('![[photo.png|A cool diagram]]', index, 'art', 'ai-engineering')
    expect(html).toContain('alt="A cool diagram"')
    expect(html).toContain('src="/wiki-assets/ai-engineering/art/photo.png"')
  })

  it('does not treat ![[wikilink]] as image when target has no image extension', async () => {
    const index = makeIndex(['some-article'])
    const html = await toHtml('![[some-article]]', index, 'art', 'ai-engineering')
    expect(html).toContain('<a')
    expect(html).not.toContain('<img')
  })
})

// ── GFM tables ────────────────────────────────────────────────────────────────

describe('remarkGfm — table rendering', () => {
  it('renders a markdown table as <table> HTML', async () => {
    const index = makeIndex([])
    const md = `| Command | Purpose |\n|---|---|\n| /init | Generate CLAUDE.md |`
    const html = await toHtml(md, index)
    expect(html).toContain('<table>')
    expect(html).toContain('<th>')
    expect(html).toContain('Command')
    expect(html).toContain('/init')
  })
})
