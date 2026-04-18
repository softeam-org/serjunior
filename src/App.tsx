import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import WikiPage from './wiki/WikiPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/wiki" element={<Navigate to="/wiki/introduction" replace />} />
        <Route path="/wiki/*" element={<WikiPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </HashRouter>
  )
}
