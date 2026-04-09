import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import HoverPreview from '@/components/HoverPreview'

export const metadata: Metadata = {
  title: 'Snow Knowledge Wiki',
  description: 'Personal knowledge wiki — concepts, tools, and workflows',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {/* Top navigation bar */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between h-12">
            <Link href="/" className="font-bold text-gray-900 hover:text-blue-700 text-lg tracking-tight">
              Knowledge Wiki
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/wiki" className="text-sm text-gray-600 hover:text-blue-700">Articles</Link>
              <Link href="/search" className="text-sm text-gray-600 hover:text-blue-700">Search</Link>
              <SearchBar />
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Hover preview tooltip — client-side, portal-like */}
        <HoverPreview />
      </body>
    </html>
  )
}
