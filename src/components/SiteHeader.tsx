import { Link, useLocation } from 'react-router-dom'

export default function SiteHeader() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <header className="landing-header">
      <nav className="landing-nav">
        <Link to="/" className="landing-logo">SERJÚNIOR</Link>
        <div className="landing-nav-links">
          {isLanding && (
            <>
              <a href="#sobre" className="landing-nav-link">Sobre</a>
              <a href="#ejs" className="landing-nav-link">EJs</a>
              <a href="#contato" className="landing-nav-link">Contato</a>
            </>
          )}
          <Link to="/wiki" className="landing-nav-link">Wiki</Link>
          <Link to="/dashboard" className="landing-nav-link landing-nav-cta">
            Dashboard de Cluster
          </Link>
        </div>
      </nav>
    </header>
  )
}
