import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import 'katex/dist/katex.min.css'
import Header from '@/components/Header'
import HoverPreview from '@/components/HoverPreview'
import ThemeProvider from '@/components/ThemeProvider'
import CommandMenu from '@/components/CommandMenu'

export const metadata: Metadata = {
  title: 'Snow Knowledge Wiki',
  description: 'Personal knowledge wiki — concepts, tools, and workflows',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <HoverPreview />
          <CommandMenu />
        </ThemeProvider>
      </body>
    </html>
  )
}
