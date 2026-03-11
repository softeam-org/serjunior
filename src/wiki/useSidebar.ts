const rawFiles = import.meta.glob('/wiki/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// ─── Types ─────────────────────────────────────────────────────────────────

export type SidebarNode = SidebarPage | SidebarSection

export interface SidebarPage {
  kind: 'page'
  title: string
  slug: string
  order: number
}

export interface SidebarSection {
  kind: 'section'
  title: string
  order: number          // derived from minimum child order
  children: SidebarNode[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// Parses an optional numeric prefix like "01-", "3-", "10-" from a name.
// "01-advanced" → { cleanName: "advanced", order: 1 }
// "introduction"  → { cleanName: "introduction", order: 999 }
function parseNameAndOrder(name: string): { cleanName: string; order: number } {
  const match = name.match(/^(\d+)-(.+)$/)
  if (match) return { cleanName: match[2], order: parseInt(match[1], 10) }
  return { cleanName: name, order: 999 }
}

function toTitle(name: string): string {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
}

// ─── Tree builder ────────────────────────────────────────────────────────────

function getOrCreateSection(nodes: SidebarNode[], dirName: string): SidebarSection {
  const { cleanName, order } = parseNameAndOrder(dirName)
  const title = toTitle(cleanName)

  const existing = nodes.find(
    (n): n is SidebarSection => n.kind === 'section' && n.title === title
  )
  if (existing) return existing

  const section: SidebarSection = { kind: 'section', title, order, children: [] }
  nodes.push(section)
  return section
}

function insertNode(
  nodes: SidebarNode[],
  pathParts: string[],
  fullSlug: string,
  fm: Record<string, string | number>
) {
  if (pathParts.length === 1) {
    const { cleanName, order: prefixOrder } = parseNameAndOrder(pathParts[0])
    nodes.push({
      kind: 'page',
      title: (fm.title as string) ?? toTitle(cleanName),
      slug: fullSlug,
      // frontmatter `order` wins, then filename prefix, then 999
      order: (fm.order as number) ?? prefixOrder,
    })
    return
  }

  const section = getOrCreateSection(nodes, pathParts[0])
  insertNode(section.children, pathParts.slice(1), fullSlug, fm)
}

function sortNodes(nodes: SidebarNode[]): SidebarNode[] {
  for (const node of nodes) {
    if (node.kind === 'section') {
      node.children = sortNodes(node.children)
      // Only fall back to min-child order when no prefix was set (order === 999)
      if (node.order === 999) {
        node.order = Math.min(...node.children.map(c => c.order))
      }
    }
  }
  return nodes.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function buildSidebar(): SidebarNode[] {
  const roots: SidebarNode[] = []

  for (const [path, raw] of Object.entries(rawFiles)) {
    const slug = path.replace(/^\/wiki\//, '').replace(/\.md$/, '')
    const parts = slug.split('/')
    const fm = parseFrontmatter(raw)
    insertNode(roots, parts, slug, fm)
  }

  return sortNodes(roots)
}

export function loadWikiPage(slug: string): string | null {
  const raw = rawFiles[`/wiki/${slug}.md`]
  if (!raw) return null
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
}
