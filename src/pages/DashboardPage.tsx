import { useState } from 'react'
import { loadData, saveData, calcIndex, getCollabPct, getClusterById, fmtIndex, BRL } from '../utils/cluster'
import type { CompanyData } from '../utils/cluster'
import Onboarding from '../components/Onboarding'
import Tab1Situacao from '../components/Tab1Situacao'
import Tab2Gaps from '../components/Tab2Gaps'
import Tab3Cenarios from '../components/Tab3Cenarios'
import Tab4Simulador from '../components/Tab4Simulador'
import '../styles/dashboard.css'

const TABS = [
  { id: 1, label: 'Situação atual' },
  { id: 2, label: 'O que falta?' },
  { id: 3, label: 'Simular projetos' },
  { id: 4, label: 'Simulador livre' },
]

export default function DashboardPage() {
  const [data, setData] = useState<CompanyData | null>(() => loadData())
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState(1)

  function handleComplete(d: CompanyData) {
    saveData(d)
    setData(d)
    setEditing(false)
  }

  if (!data || editing) {
    return <Onboarding initial={data} onComplete={handleComplete} />
  }

  const collabPct = getCollabPct(data.collabRevenue, data.revenue)
  const index = calcIndex(data.revenue, data.csat, data.mejEngagement, collabPct)

  return (
    <div className="db-layout">
      <header className="db-topbar">
        <div className="db-topbar-left">
          <span className="db-brand">SerJunior</span>
          <span style={{ color: 'var(--color-border)', fontSize: '1.1rem', userSelect: 'none' }}>|</span>
          <span className="db-company-name">{data.companyName}</span>
        </div>

        <div className="db-topbar-right">
          <span className={`cluster-badge ${data.currentCluster}`}>{getClusterById(data.currentCluster).label}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
            Índice:{' '}
            <strong style={{ color: data.csat === 0 ? '#dc2626' : 'var(--color-text)' }}>
              {fmtIndex(index)}
            </strong>
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
            {BRL.format(data.revenue)}
          </span>
          <button
            className="db-btn db-btn-ghost"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}
            onClick={() => setEditing(true)}
          >
            ✎ Editar dados
          </button>
        </div>
      </header>

      <nav className="db-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`db-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="db-content">
        {activeTab === 1 && <Tab1Situacao data={data} />}
        {activeTab === 2 && <Tab2Gaps data={data} />}
        {activeTab === 3 && <Tab3Cenarios data={data} />}
        {activeTab === 4 && <Tab4Simulador data={data} />}
      </div>
    </div>
  )
}
