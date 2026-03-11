// Eagerly imports all wiki markdown files as raw strings.
// Frontmatter fields used for the sidebar:
//   title  – display name (falls back to filename)
//   order  – numeric sort order within its section (default: 999)
//   section – override the directory name used as section heading

export interface SidebarItem {
  title: string
  slug: string   // path relative to wiki/, without .md  e.g. "introduction" or "advanced/config"
  order: number
}

export interface SidebarSection {
  title: string
  order: number
  items: SidebarItem[]
}

// Glob all markdown files — Vite bundles them as raw strings at build time.
const rawFiles = import.meta.glob('/wiki/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseFrontmatter(raw: string): Record<string, string | number> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const result: Record<string, string | number> = {}
  match[1].split('\n').forEach(line => {
    const m = line.match(/^(\w+):\s*(.+)$/)
    if (!m) return
    const [, key, val] = m
    const trimmed = val.trim().replace(/^['"]|['"]$/g, '')
    result[key] = key === 'order' ? parseInt(trimmed, 10) : trimmed
  })
  return result
}

function titleFromSlug(slug: string): string {
  const parts = slug.split('/')
  const name = parts[parts.length - 1] ?? slug
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
}

function sectionTitleFromPath(dir: string): string {
  return dir
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
}

export function useSidebar(): SidebarSection[] {
  const sections: Map<string, SidebarSection> = new Map()

  for (const [path, raw] of Object.entries(rawFiles)) {
    // path looks like /wiki/introduction.md or /wiki/advanced/config.md
    const slug = path.replace(/^\/wiki\//, '').replace(/\.md$/, '')
    const parts = slug.split('/')
    const sectionKey = parts.length > 1 ? parts.slice(0, -1).join('/') : '__root__'

    const fm = parseFrontmatter(raw)
    const item: SidebarItem = {
      title: (fm.title as string) ?? titleFromSlug(slug),
      slug,
      order: (fm.order as number) ?? 999,
    }

    if (!sections.has(sectionKey)) {
      const sectionTitle =
        sectionKey === '__root__'
          ? '__root__'
          : (fm.section as string) ?? sectionTitleFromPath(sectionKey)
      sections.set(sectionKey, {
        title: sectionTitle,
        order: sectionKey === '__root__' ? 0 : (fm.order as number) ?? 999,
        items: [],
      })
    }

    sections.get(sectionKey)!.items.push(item)
  }

  // Sort items within each section
  for (const section of sections.values()) {
    section.items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
  }

  // Sort sections: root first, then by order/title
  return Array.from(sections.values()).sort((a, b) => {
    if (a.title === '__root__') return -1
    if (b.title === '__root__') return 1
    return a.order - b.order || a.title.localeCompare(b.title)
  })
}

export function loadWikiPage(slug: string): string | null {
  const path = `/wiki/${slug}.md`
  const raw = rawFiles[path]
  if (!raw) return null
  // Strip frontmatter before returning content
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
}
