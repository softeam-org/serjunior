import { NavLink } from 'react-router-dom'
import { useSidebar } from './useSidebar'

export default function WikiSidebar() {
  const sections = useSidebar()

  return (
    <aside className="wiki-sidebar">
      <nav>
        {sections.map(section => (
          <div key={section.title} className="wiki-sidebar-section">
            {section.title !== '__root__' && (
              <span className="wiki-sidebar-section-title">{section.title}</span>
            )}
            <ul className="wiki-sidebar-list">
              {section.items.map(item => (
                <li key={item.slug}>
                  <NavLink
                    to={`/wiki/${item.slug}`}
                    className={({ isActive }) =>
                      `wiki-sidebar-link${isActive ? ' wiki-sidebar-link--active' : ''}`
                    }
                  >
                    {item.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
