export type Heading = {
  depth: number
  text: string
  slug: string
}

export type Article = {
  slug: string
  title: string
  category: string
  subfolder: string | null  // null = top-level file; string = immediate parent dir name
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
