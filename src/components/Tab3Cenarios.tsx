import { useState } from 'react'
import {
  CLUSTERS,
  calcIndex,
  getClusterByIndex,
  getClusterIndex,
  getPossibleOutcomes,
  applyMovementRule,
  BRL,
  fmtIndex,
  fmtPct,
  type CompanyData,
  type Cluster,
} from '../utils/cluster'
import { TRIENIO } from '../config/trienio'

interface Props { data: CompanyData }

const OUTCOME_LABELS = ['Cluster abaixo', 'Cluster atual', 'Cluster acima']

function OutcomeCard({
  cluster, roleLabel, projectedRevenue, projectedIndex, csat, mejEng, collabPct,
  currentClusterIdx,
}: {
  cluster: Cluster | null; roleLabel: string; projectedRevenue: number
  projectedIndex: number; csat: number; mejEng: number; collabPct: number
  currentClusterIdx: number
}) {
  if (!cluster) {
    return (
      <div className="db-outcome-card disabled-outcome">
        <div className="db-outcome-header">
          <span className="db-outcome-role">{roleLabel}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
          Não se aplica — não existe cluster nessa direção para o nível atual.
        </p>
      </div>
    )
  }

  const rawClusterIdx = getClusterIndex(getClusterByIndex(projectedIndex).id)
  const effectiveIdx = applyMovementRule(rawClusterIdx, currentClusterIdx)
  const effectiveCluster = CLUSTERS[effectiveIdx]
  const isThisOutcome = effectiveCluster.id === cluster.id

  let missingRevenue = 0
  if (csat > 0 && cluster.min > 0) {
    const divisor = csat * (1 + mejEng / 100) * (1 + collabPct / 100) * 100
    const minRev = cluster.min / divisor
    missingRevenue = Math.max(0, minRev - projectedRevenue)
  }

  return (
    <div
      className={`db-outcome-card ${isThisOutcome ? 'active-outcome' : ''}`}
      style={isThisOutcome ? { borderColor: cluster.color } : undefined}
    >
      <div className="db-outcome-header">
        <span className="db-outcome-role">{roleLabel}</span>
        <span className={`cluster-badge ${cluster.id}`} style={{ fontSize: '0.7rem' }}>
          {cluster.label}
        </span>
      </div>

      <div>
        <span className={`db-outcome-status ${isThisOutcome ? 'yes' : 'no'}`}>
          {isThisOutcome ? '✓ Ocorreria' : '✗ Não ocorreria'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="db-outcome-stat">
          <span className="db-outcome-stat-label">Faturamento projetado</span>
          <span className="db-outcome-stat-value">{BRL.format(projectedRevenue)}</span>
        </div>
        <div className="db-outcome-stat">
          <span className="db-outcome-stat-label">Índice resultante</span>
          <span className="db-outcome-stat-value">{fmtIndex(projectedIndex)}</span>
        </div>
        <div className="db-outcome-stat">
          <span className="db-outcome-stat-label">Limiar do cluster</span>
          <span className="db-outcome-stat-value">
            {cluster.min === 0 ? '0' : fmtIndex(cluster.min)}
          </span>
        </div>
      </div>

      <div className={`db-outcome-missing ${missingRevenue === 0 ? 'ok' : 'missing'}`}>
        {missingRevenue === 0
          ? '✓ Faturamento suficiente'
          : `Faltam ${BRL.format(missingRevenue)} em faturamento`}
      </div>
    </div>
  )
}

export default function Tab3Cenarios({ data }: Props) {
  const [projects, setProjects] = useState(10)
  const [avgTicket, setAvgTicket] = useState(5000)
  const [csat, setCsat] = useState(data.csat || 3.5)
  const [mejEng, setMejEng] = useState(data.mejEngagement || 50)
  const [collabPct, setCollabPct] = useState(
    data.revenue > 0 ? Math.round((data.collabRevenue / data.revenue) * 100) : 20,
  )

  const projectedRevenue = projects * avgTicket + data.revenue
  const projectedIndex = calcIndex(projectedRevenue, csat, mejEng, collabPct)
  const possibleOutcomes = getPossibleOutcomes(data.currentCluster)
  const currentClusterIdx = getClusterIndex(data.currentCluster)

  return (
    <div>
      <p className="db-section-title">Monte seu cenário de projetos</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.85rem' }}>
        Estime quantos projetos você vai fechar no ano e com qual ticket médio. O faturamento projetado é somado ao que já está registrado. Ajuste CSAT, engajamento e collab para ver como o resultado final muda.
      </p>
      <div className="db-card" style={{ marginBottom: '1.25rem' }}>
        <div className="db-slider-grid">
          <div className="db-slider-field">
            <div className="db-slider-header">
              <span className="db-slider-label">Projetos finalizados no ano</span>
              <span className="db-slider-val">{projects}</span>
            </div>
            <input className="db-slider" type="range" min={0} max={TRIENIO.simulation.maxProjects} step={1}
              value={projects} onChange={(e) => setProjects(Number(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
              <span>0</span><span>{TRIENIO.simulation.maxProjects}</span>
            </div>
          </div>

          <div className="db-slider-field">
            <div className="db-slider-header">
              <span className="db-slider-label">Ticket médio por projeto</span>
              <span className="db-slider-val">{BRL.format(avgTicket)}</span>
            </div>
            <input className="db-slider" type="range" min={0} max={TRIENIO.simulation.maxAvgTicket} step={500}
              value={avgTicket} onChange={(e) => setAvgTicket(Number(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
              <span>R$ 0</span><span>{BRL.format(TRIENIO.simulation.maxAvgTicket)}</span>
            </div>
          </div>

          <div className="db-slider-field">
            <div className="db-slider-header">
              <span className="db-slider-label">CSAT médio</span>
              <span className="db-slider-val">{csat.toFixed(1)}</span>
            </div>
            <input className="db-slider" type="range" min={0} max={5} step={0.1}
              value={csat} onChange={(e) => setCsat(Number(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
              <span>0,0</span><span>5,0</span>
            </div>
          </div>

          <div className="db-slider-field">
            <div className="db-slider-header">
              <span className="db-slider-label">Engajamento MEJ</span>
              <span className="db-slider-val">{fmtPct(mejEng)}</span>
            </div>
            <input className="db-slider" type="range" min={0} max={100} step={1}
              value={mejEng} onChange={(e) => setMejEng(Number(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
              <span>0%</span><span>100%</span>
            </div>
          </div>

          <div className="db-slider-field" style={{ gridColumn: '1 / -1' }}>
            <div className="db-slider-header">
              <span className="db-slider-label">% Faturamento collab</span>
              <span className="db-slider-val">{fmtPct(collabPct)}</span>
            </div>
            <input className="db-slider" type="range" min={0} max={100} step={1}
              value={collabPct} onChange={(e) => setCollabPct(Number(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
              <span>0%</span><span>100%</span>
            </div>
          </div>
        </div>

        <hr className="db-divider" />
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--color-muted)' }}>
            Faturamento projetado:{' '}
            <strong style={{ color: 'var(--color-text)' }}>{BRL.format(projectedRevenue)}</strong>
            <span style={{ color: 'var(--color-muted)', marginLeft: 4 }}>
              ({projects} × {BRL.format(avgTicket)} + base {BRL.format(data.revenue)})
            </span>
          </span>
          <span style={{ color: 'var(--color-muted)' }}>
            Índice projetado:{' '}
            <strong style={{ color: csat === 0 ? '#dc2626' : 'var(--color-text)' }}>
              {fmtIndex(projectedIndex)}
            </strong>
          </span>
        </div>

        {csat === 0 && (
          <div className="db-ctx-alert danger" style={{ marginTop: '0.75rem' }}>
            <span>⚠️</span>
            CSAT zerado anula o índice inteiro. Ajuste o CSAT para ver projeções reais.
          </div>
        )}
      </div>

      <p className="db-section-title">O que acontece com esse cenário?</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.85rem' }}>
        Com esses números, sua empresa subiria, permaneceria ou cairia de cluster? Os três cartões mostram cada desfecho possível e o quanto falta em faturamento para que ele ocorra.
      </p>
      <div className="db-outcomes-grid">
        {possibleOutcomes.map((cluster, i) => (
          <OutcomeCard
            key={i}
            cluster={cluster}
            roleLabel={OUTCOME_LABELS[i]}
            projectedRevenue={projectedRevenue}
            projectedIndex={projectedIndex}
            csat={csat}
            mejEng={mejEng}
            collabPct={collabPct}
            currentClusterIdx={currentClusterIdx}
          />
        ))}
      </div>
    </div>
  )
}
