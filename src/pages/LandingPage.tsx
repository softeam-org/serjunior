import { Link } from 'react-router-dom'
import '../styles/landing.css'

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-header">
        <nav className="landing-nav">
          <span className="landing-logo">SerJunior</span>
          <Link to="/wiki" className="landing-nav-link">Wiki</Link>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <h1 className="landing-hero-title">SerJunior</h1>
          <p className="landing-hero-subtitle">
            Your subtitle goes here.
          </p>
          <div className="landing-hero-actions">
            <Link to="/wiki" className="btn btn-primary">Read the Wiki</Link>
            <a href="#about" className="btn btn-secondary">Learn More</a>
          </div>
        </section>

        <section id="about" className="landing-section">
          <h2>About</h2>
          <p>Add your content here.</p>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} SerJunior</p>
      </footer>
    </div>
  )
}
