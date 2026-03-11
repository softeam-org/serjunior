import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import WikiPage from './wiki/WikiPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/wiki" element={<Navigate to="/wiki/introduction" replace />} />
        <Route path="/wiki/:slug" element={<WikiPage />} />
        {/* support nested slugs like /wiki/advanced/config */}
        <Route path="/wiki/:section/:slug" element={<WikiPage />} />
      </Routes>
    </HashRouter>
  )
}
