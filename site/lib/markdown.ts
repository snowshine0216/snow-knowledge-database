import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import remarkWikilinks from './wikilinks'
import { getAllArticles } from './content'

export async function markdownToHtml(content: string): Promise<string> {
  const index = getAllArticles()

  const result = await unified()
    .use(remarkParse)
    .use(remarkWikilinks, { index })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)

  return String(result)
}
