import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const CONTENT_TYPES: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.avif': 'image/avif',
}

// Segments must contain only word chars, dots, and hyphens — no slashes or traversal sequences.
const SAFE_SEGMENT = /^[\w.-]+$/

const WIKI_ROOT = path.resolve(process.cwd(), '..', 'wiki')

type Params = { category: string; slug: string; file: string }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { category, slug, file } = await params

  // Reject segments that could be used for path traversal.
  if (!SAFE_SEGMENT.test(category) || !SAFE_SEGMENT.test(slug) || !SAFE_SEGMENT.test(file)) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Only serve known image types — no arbitrary file reads.
  const ext = path.extname(file).toLowerCase()
  const contentType = CONTENT_TYPES[ext]
  if (!contentType) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const filePath = path.join(WIKI_ROOT, category, 'assets', slug, file)

  // Belt-and-suspenders: confirm resolved path stays within wiki root.
  if (!filePath.startsWith(WIKI_ROOT + path.sep)) {
    return new NextResponse('Not Found', { status: 404 })
  }

  try {
    const data = await readFile(filePath)
    return new NextResponse(data, {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' },
    })
  } catch {
    return new NextResponse('Not Found', { status: 404 })
  }
}
