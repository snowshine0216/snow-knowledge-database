#!/usr/bin/env node
/**
 * Validates wikilinks across all articles.
 * Fails build (exit 1) if broken link count EXCEEDS baseline in wiki/.link-baseline.
 * Run via `npm run lint:content`.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WIKI_DIR = path.join(__dirname, '..', '..', 'wiki')
const BASELINE_FILE = path.join(WIKI_DIR, '.link-baseline')
const CATEGORIES = ['concepts', 'tools', 'workflows']

function normalize(slug) {
  return slug.toLowerCase().replace(/\s+/g, '-')
}

// 1. Build slug set
const slugs = new Set()
for (const category of CATEGORIES) {
  const dir = path.join(WIKI_DIR, category)
  if (!fs.existsSync(dir)) continue
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
    slugs.add(normalize(file.replace('.md', '')))
  }
}

// Check for duplicate slugs (important for CJK filenames)
const allSlugs = [...slugs]
const uniqueSlugs = new Set(allSlugs)
if (allSlugs.length !== uniqueSlugs.size) {
  console.error('ERROR: Duplicate slugs detected! Check for filename collisions.')
  process.exit(1)
}

// 2. Scan all wikilinks
const brokenLinks = []
const wikilinkPattern = /\[\[([^\]]+)\]\]/g

for (const category of CATEGORIES) {
  const dir = path.join(WIKI_DIR, category)
  if (!fs.existsSync(dir)) continue

  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8')
    const { content } = matter(raw)
    const sourceSlug = normalize(file.replace('.md', ''))

    let match
    while ((match = wikilinkPattern.exec(content)) !== null) {
      const inner = match[1]
      const target = inner.includes('|') ? inner.split('|')[0].trim() : inner.trim()
      const targetSlug = normalize(target)
      if (!slugs.has(targetSlug)) {
        brokenLinks.push({ source: sourceSlug, target: targetSlug })
      }
    }
  }
}

const currentCount = brokenLinks.length
console.log(`Found ${currentCount} broken wikilinks`)

if (brokenLinks.length > 0 && brokenLinks.length <= 20) {
  for (const { source, target } of brokenLinks) {
    console.log(`  [[${target}]] in ${source}`)
  }
}

// 3. Compare with baseline
if (fs.existsSync(BASELINE_FILE)) {
  const baseline = parseInt(fs.readFileSync(BASELINE_FILE, 'utf8').trim(), 10)
  if (currentCount > baseline) {
    console.error(`FAIL: broken links increased from ${baseline} to ${currentCount}`)
    process.exit(1)
  }
  console.log(`✓ Broken links ${currentCount}/${baseline} (baseline OK)`)
} else {
  // First run — write baseline
  fs.writeFileSync(BASELINE_FILE, String(currentCount))
  console.log(`✓ Baseline written: ${currentCount} broken links`)
}
