import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { buildSidebar, type SidebarSection } from './useSidebar'

const sidebar = buildSidebar()

// ─── Recursive section ────────────────────────────────────────────────────────

function Section({ node, activeSlug, depth }: {
  node: SidebarSection
  activeSlug: string
  depth: number
}) {
  const hasActive = containsSlug(node, activeSlug)
  const [open, setOpen] = useState(hasActive)

  return (
    <div className="wiki-sidebar-section" style={{ '--depth': depth } as React.CSSProperties}>
      <button
        className="wiki-sidebar-section-title"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{node.title}</span>
        <svg
          className={`wiki-sidebar-chevron${open ? ' wiki-sidebar-chevron--open' : ''}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="wiki-sidebar-list">
          {node.children.map(child =>
            child.kind === 'page' ? (
              <li key={child.slug}>
                <NavLink
                  to={`/wiki/${child.slug}`}
                  className={({ isActive }) =>
                    `wiki-sidebar-link${isActive ? ' wiki-sidebar-link--active' : ''}`
                  }
                >
                  {child.title}
                </NavLink>
              </li>
            ) : (
              <li key={child.title}>
                <Section node={child} activeSlug={activeSlug} depth={depth + 1} />
              </li>
            )
          )}
        </ul>
      )}
    </div>
  )
}

function containsSlug(node: SidebarSection, slug: string): boolean {
  for (const child of node.children) {
    if (child.kind === 'page' && child.slug === slug) return true
    if (child.kind === 'section' && containsSlug(child, slug)) return true
  }
  return false
}

// ─── Sidebar root ─────────────────────────────────────────────────────────────

export default function WikiSidebar() {
  const params = useParams()
  const activeSlug = params['*'] ?? ''

  return (
    <aside className="wiki-sidebar">
      <nav>
        {sidebar.map(node =>
          node.kind === 'page' ? (
            <div key={node.slug} className="wiki-sidebar-section">
              <ul className="wiki-sidebar-list">
                <li>
                  <NavLink
                    to={`/wiki/${node.slug}`}
                    className={({ isActive }) =>
                      `wiki-sidebar-link${isActive ? ' wiki-sidebar-link--active' : ''}`
                    }
                  >
                    {node.title}
                  </NavLink>
                </li>
              </ul>
            </div>
          ) : (
            <Section key={node.title} node={node} activeSlug={activeSlug} depth={0} />
          )
        )}
      </nav>
    </aside>
  )
}
