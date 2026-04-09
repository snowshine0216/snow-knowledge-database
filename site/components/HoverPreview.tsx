'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { PreviewData } from '@/lib/types'

type PreviewCard = {
  slug: string
  title: string
  excerpt: string
  tags: string[]
  category: string
  anchorRect: DOMRect
}

export default function HoverPreview() {
  const [preview, setPreview] = useState<PreviewCard | null>(null)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Lazy-load preview data once
  useEffect(() => {
    fetch('/preview-data.json')
      .then(r => r.json())
      .then(setPreviewData)
      .catch(() => { /* silent — hover feature gracefully disabled */ })
  }, [])

  const cancelTimers = useCallback(() => {
    if (showTimer.current) clearTimeout(showTimer.current)
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }, [])

  useEffect(() => {
    if (!previewData) return

    function handleMouseEnter(e: MouseEvent) {
      const target = e.target as HTMLElement
      const anchor = target.closest('a.wikilink') as HTMLAnchorElement | null
      if (!anchor) return

      const slug = anchor.dataset.slug
      if (!slug || !previewData![slug]) return

      cancelTimers()
      showTimer.current = setTimeout(() => {
        const rect = anchor.getBoundingClientRect()
        setPreview({
          slug,
          anchorRect: rect,
          ...previewData![slug],
        })
      }, 250)
    }

    function handleMouseLeave(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('a.wikilink') && !target.closest('[data-preview-card]')) return
      cancelTimers()
      hideTimer.current = setTimeout(() => setPreview(null), 150)
    }

    document.addEventListener('mouseover', handleMouseEnter)
    document.addEventListener('mouseout', handleMouseLeave)
    return () => {
      document.removeEventListener('mouseover', handleMouseEnter)
      document.removeEventListener('mouseout', handleMouseLeave)
      cancelTimers()
    }
  }, [previewData, cancelTimers])

  if (!preview) return null

  // Viewport-edge collision detection
  const cardWidth = 320
  const cardHeight = 160
  const margin = 8
  const { left, bottom, top } = preview.anchorRect
  const viewW = window.innerWidth
  const viewH = window.innerHeight

  let x = left
  let y = bottom + margin

  if (x + cardWidth > viewW - margin) x = left - cardWidth + (preview.anchorRect.width)
  if (y + cardHeight > viewH - margin) y = top - cardHeight - margin
  if (x < margin) x = margin

  return (
    <div
      ref={cardRef}
      data-preview-card
      onMouseEnter={() => cancelTimers()}
      onMouseLeave={() => {
        cancelTimers()
        hideTimer.current = setTimeout(() => setPreview(null), 150)
      }}
      style={{ position: 'fixed', left: x, top: y, zIndex: 9999, width: cardWidth }}
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg p-3 pointer-events-auto"
    >
      <p className="text-xs text-[var(--color-text-muted)] capitalize mb-1">{preview.category}</p>
      <Link href={`/wiki/${preview.slug}`} className="font-semibold text-[var(--color-text)] hover:text-[var(--color-accent-text)] text-sm block leading-snug mb-1">
        {preview.title}
      </Link>
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-3">{preview.excerpt}</p>
      {preview.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {preview.tags.slice(0, 4).map(t => (
            <span key={t} className="text-xs bg-[var(--color-tag-bg)] text-[var(--color-tag-text)] px-1.5 py-0.5 rounded">{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}
