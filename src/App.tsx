import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import WikiPage from './wiki/WikiPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/wiki" element={<Navigate to="/wiki/introduction" replace />} />
        {/* Wildcard captures slugs of any depth: /wiki/intro, /wiki/a/b/c */}
        <Route path="/wiki/*" element={<WikiPage />} />
      </Routes>
    </HashRouter>
  )
}
