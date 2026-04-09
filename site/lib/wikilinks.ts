import { visit } from 'unist-util-visit'
import type { Root, Text, Link } from 'mdast'
import type { Plugin } from 'unified'
import { normalize } from './content'
import type { WikiIndex } from './types'

type Options = { index: WikiIndex }

/**
 * Remark plugin: transforms [[wikilinks]] and [[target|display]] into <a> tags.
 * Broken links (target not in WikiIndex) get class="wikilink wikilink-broken".
 */
const remarkWikilinks: Plugin<[Options], Root> = ({ index }) => {
  return (tree) => {
    visit(tree, 'text', (node: Text, nodeIndex, parent) => {
      if (!parent || nodeIndex == null) return

      const pattern = /\[\[([^\]]+)\]\]/g
      const text = node.value
      let lastIndex = 0
      const newNodes: Array<Text | Link> = []
      let match

      while ((match = pattern.exec(text)) !== null) {
        const before = text.slice(lastIndex, match.index)
        if (before) newNodes.push({ type: 'text', value: before })

        const inner = match[1]
        const hasPipe = inner.includes('|')
        const target = hasPipe ? inner.split('|')[0].trim() : inner.trim()
        const display = hasPipe ? inner.split('|')[1].trim() : inner.trim()
        const slug = normalize(target)
        const valid = index.has(slug)

        const linkNode: Link = {
          type: 'link',
          url: valid
            ? `/wiki/${slug}`
            : `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(target.replace(/-/g, ' '))}`,
          data: {
            hProperties: {
              class: valid ? 'wikilink' : 'wikilink wikilink-broken',
              ...(valid
                ? { 'data-slug': slug }
                : { target: '_blank', rel: 'noopener noreferrer' }),
            },
          },
          children: [{ type: 'text', value: display }],
        }
        newNodes.push(linkNode)
        lastIndex = match.index + match[0].length
      }

      if (newNodes.length === 0) return

      const after = text.slice(lastIndex)
      if (after) newNodes.push({ type: 'text', value: after })

      parent.children.splice(nodeIndex as number, 1, ...(newNodes as Parameters<typeof parent.children.splice>[2][]))
    })
  }
}

export default remarkWikilinks
