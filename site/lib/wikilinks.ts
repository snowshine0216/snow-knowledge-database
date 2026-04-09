import { visit } from 'unist-util-visit'
import type { Root, Text, Link, Image } from 'mdast'
import type { Plugin } from 'unified'
import { normalize } from './content'
import type { WikiIndex } from './types'

type Options = { index: WikiIndex; slug?: string; category?: string }

const IMAGE_EXTS = /\.(png|jpe?g|gif|webp|svg|avif)$/i

/**
 * Remark plugin: transforms [[wikilinks]] and [[target|display]] into <a> tags,
 * and ![[image.png]] into <img> tags.
 * Broken links (target not in WikiIndex) get class="wikilink wikilink-broken".
 */
const remarkWikilinks: Plugin<[Options], Root> = ({ index, slug, category }) => {
  return (tree) => {
    visit(tree, 'text', (node: Text, nodeIndex, parent) => {
      if (!parent || nodeIndex == null) return

      const pattern = /\[\[([^\]]+)\]\]/g
      const text = node.value
      let lastIndex = 0
      const newNodes: Array<Text | Link | Image> = []
      let match

      while ((match = pattern.exec(text)) !== null) {
        const rawBefore = text.slice(lastIndex, match.index)

        const inner = match[1]
        const pipeIdx = inner.indexOf('|')
        const target = pipeIdx >= 0 ? inner.slice(0, pipeIdx).trim() : inner.trim()
        const display = pipeIdx >= 0 ? inner.slice(pipeIdx + 1).trim() : inner.trim()

        // Only treat as image if '!' immediately precedes '[[' AND target has image extension.
        // This prevents false positives like "Wow![[wikilink]]" consuming the '!'.
        const isImage = rawBefore.endsWith('!') && IMAGE_EXTS.test(target)
        const before = isImage ? rawBefore.slice(0, -1) : rawBefore
        if (before) newNodes.push({ type: 'text', value: before })

        if (isImage) {
          const src = slug && category
            ? `/wiki-assets/${encodeURIComponent(category)}/${encodeURIComponent(slug)}/${encodeURIComponent(target)}`
            : `/wiki-assets/${encodeURIComponent(target)}`
          const imageNode: Image = { type: 'image', url: src, alt: display, title: null }
          newNodes.push(imageNode)
        } else {
          const articleSlug = normalize(target)
          const valid = index.has(articleSlug)

          const linkNode: Link = {
            type: 'link',
            url: valid
              ? `/wiki/${articleSlug}`
              : `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(target.replace(/-/g, ' '))}`,
            data: {
              hProperties: {
                class: valid ? 'wikilink' : 'wikilink wikilink-broken',
                ...(valid
                  ? { 'data-slug': articleSlug }
                  : { target: '_blank', rel: 'noopener noreferrer' }),
              },
            },
            children: [{ type: 'text', value: display }],
          }
          newNodes.push(linkNode)
        }
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
