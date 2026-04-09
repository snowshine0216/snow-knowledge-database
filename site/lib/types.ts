export type Heading = {
  depth: number
  text: string
  slug: string
}

export type Article = {
  slug: string
  title: string
  category: string
  tags: string[]
  source: string
  content: string
  headings: Heading[]
  outlinks: string[]
  backlinks: string[]
  excerpt: string
}

export type WikiIndex = Map<string, Article>

export type PreviewData = Record<string, {
  title: string
  excerpt: string
  tags: string[]
  category: string
}>
