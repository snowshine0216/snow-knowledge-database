import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import remarkWikilinks from './wikilinks'
import { getAllArticles } from './content'

export async function markdownToHtml(content: string): Promise<string> {
  const index = getAllArticles()

  const result = await unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkWikilinks, { index })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)

  return String(result)
}
