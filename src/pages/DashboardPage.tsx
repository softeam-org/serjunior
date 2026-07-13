import { useState } from 'react'
import {
  loadData,
  saveData,
  calcIndex,
  getCollabPct,
  getClusterById,
  getClusterIndex,
  fmtIndex,
  BRL,
  CLUSTERS,
} from '../utils/cluster'
import type { CompanyData } from '../utils/cluster'
import { IconTrendingUp, IconAlertTriangle } from '../components/icons'
import Onboarding from '../components/Onboarding'
import SiteHeader from '../components/SiteHeader'
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
    return (
      <>
        <SiteHeader />
        <Onboarding initial={data} onComplete={handleComplete} />
      </>
    )
  }

  const collabPct = getCollabPct(data.collabRevenue, data.revenue)
  const index = calcIndex(data.revenue, data.csat, data.mejEngagement, collabPct)

  const currentClObj = getClusterById(data.currentCluster)
  const currentClIdx = getClusterIndex(data.currentCluster)
  const nextCluster = CLUSTERS[currentClIdx + 1] ?? null
  const prevCluster = CLUSTERS[currentClIdx - 1] ?? null
  const isTopCluster = nextCluster === null

  // Risco de queda: o índice atual está abaixo do piso do cluster onde a EJ
  // está hoje — na próxima avaliação ela cairia. Nesse caso a faixa mostra o
  // progresso necessário para PERMANECER no cluster, não para subir.
  const atRisk = data.csat !== 0 && index < currentClObj.min && prevCluster !== null

  const stripPct = atRisk
    ? Math.min((index / currentClObj.min) * 100, 100)
    : isTopCluster
      ? 100
      : Math.min((index / nextCluster.min) * 100, 100)

  return (
    <>
      <SiteHeader />
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
          <span className="db-topbar-rev" style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
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

      {/* Faixa de progresso: subir de cluster ou risco de queda */}
      <div className={`db-cluster-strip${atRisk ? ' at-risk' : ''}`}>
        {/* Badge à esquerda: de onde partimos (ou para onde cairíamos) */}
        {atRisk && prevCluster ? (
          <span className={`cluster-badge ${prevCluster.id}`}>{prevCluster.label}</span>
        ) : (
          <span className={`cluster-badge ${data.currentCluster}`}>{currentClObj.label}</span>
        )}

        <div className="db-cluster-strip-bar">
          <div className="db-cluster-strip-track">
            <div
              className="db-cluster-strip-fill"
              style={{
                width: `${stripPct}%`,
                background: atRisk ? '#dc2626' : currentClObj.color,
              }}
            />
          </div>
          <div className="db-cluster-strip-caption">
            {data.csat === 0 ? (
              <>Índice anulado por CSAT zerado — registre o CSAT para medir o avanço</>
            ) : atRisk ? (
              <>
                <IconAlertTriangle width={13} height={13} /> {stripPct.toFixed(0)}% do piso — abaixo disso a EJ
                cai para o {prevCluster!.label}
              </>
            ) : isTopCluster ? (
              <>
                <IconTrendingUp width={13} height={13} /> Cluster máximo atingido
              </>
            ) : (
              <>
                <IconTrendingUp width={13} height={13} /> {stripPct.toFixed(0)}% rumo ao {nextCluster.label}
                {stripPct >= 100 && ' — piso já alcançado!'}
              </>
            )}
          </div>
        </div>

        {/* Badge à direita: para onde subimos, ou o cluster que estamos segurando */}
        {atRisk ? (
          <span className={`cluster-badge ${data.currentCluster} db-cluster-strip-next`}>{currentClObj.label}</span>
        ) : !isTopCluster ? (
          <span className={`cluster-badge ${nextCluster.id} db-cluster-strip-next`}>{nextCluster.label}</span>
        ) : null}
      </div>

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
    </>
  )
}
