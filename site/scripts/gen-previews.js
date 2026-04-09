#!/usr/bin/env node
/**
 * prebuild: generates public/preview-data.json
 * Run automatically via "prebuild" npm script before next build.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WIKI_DIR = path.join(__dirname, '..', '..', 'wiki')
const OUT_FILE = path.join(__dirname, '..', 'public', 'preview-data.json')
const CATEGORIES = ['concepts', 'tools', 'workflows']

function normalize(slug) {
  return slug.toLowerCase().replace(/\s+/g, '-')
}

function extractExcerpt(content) {
  return content
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 150)
}

const previews = {}

for (const category of CATEGORIES) {
  const dir = path.join(WIKI_DIR, category)
  if (!fs.existsSync(dir)) continue

  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8')
    const { data, content } = matter(raw)
    const slug = normalize(file.replace('.md', ''))

    const firstH1 = content.match(/^#\s+(.+)$/m)
    const title = data.title ?? (firstH1 ? firstH1[1].trim() : file.replace('.md', ''))

    previews[slug] = {
      title,
      excerpt: extractExcerpt(content),
      tags: Array.isArray(data.tags) ? data.tags : [],
      category,
    }
  }
}

fs.mkdirSync(path.join(__dirname, '..', 'public'), { recursive: true })
fs.writeFileSync(OUT_FILE, JSON.stringify(previews, null, 2))
console.log(`✓ Generated preview-data.json (${Object.keys(previews).length} articles)`)
