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
  type CompanyData,
  type Cluster,
} from '../utils/cluster'
import { TRIENIO } from '../config/trienio'

interface Props { data: CompanyData }

const OUTCOME_LABELS = ['Cluster abaixo', 'Cluster atual', 'Cluster acima']

function SliderField({
  label, value, min, max, step, displayValue, onChange, minLabel, maxLabel,
  fullWidth = false,
}: {
  label: string; value: number; min: number; max: number; step: number
  displayValue?: string; onChange: (v: number) => void
  minLabel: string; maxLabel: string; fullWidth?: boolean
}) {
  const [inputText, setInputText] = useState<string | null>(null)

  function commitText(raw: string) {
    const parsed = parseFloat(raw.replace(',', '.').replace(/[^\d.-]/g, ''))
    if (!isNaN(parsed)) onChange(Math.min(max, Math.max(min, parsed)))
    setInputText(null)
  }

  const shownValue = inputText ?? (displayValue ?? String(value))

  return (
    <div className="db-slider-field" style={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
      <div className="db-slider-header">
        <span className="db-slider-label">{label}</span>
        <input
          className="db-slider-text-input"
          type="text"
          value={shownValue}
          onChange={(e) => setInputText(e.target.value)}
          onBlur={(e) => commitText(e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => { if (e.key === 'Enter') commitText((e.target as HTMLInputElement).value) }}
        />
      </div>
      <input className="db-slider" type="range" min={min} max={max} step={step}
        value={value} onChange={(e) => { setInputText(null); onChange(Number(e.target.value)) }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
        <span>{minLabel}</span><span>{maxLabel}</span>
      </div>
    </div>
  )
}

function CollabField({
  mode, onModeChange,
  collabPct, onCollabPctChange,
  collabBRL, onCollabBRLChange,
  baseRevenue, projectedRevenue,
}: {
  mode: 'pct' | 'brl'; onModeChange: (m: 'pct' | 'brl') => void
  collabPct: number; onCollabPctChange: (v: number) => void
  collabBRL: number; onCollabBRLChange: (v: number) => void
  baseRevenue: number; projectedRevenue: number
}) {
  const [inputText, setInputText] = useState<string | null>(null)

  const effectivePct = mode === 'brl'
    ? (projectedRevenue > 0 ? (collabBRL / projectedRevenue) * 100 : 0)
    : collabPct

  // Slider always represents % (0–100). In R$ mode, % of baseRevenue → collabBRL.
  const sliderPct = mode === 'brl'
    ? (baseRevenue > 0 ? Math.min(100, (collabBRL / baseRevenue) * 100) : 0)
    : collabPct

  function handleSlider(pct: number) {
    setInputText(null)
    if (mode === 'pct') {
      onCollabPctChange(pct)
    } else {
      onCollabBRLChange(Math.round(pct * baseRevenue / 100))
    }
  }

  function commitText(raw: string) {
    const parsed = parseFloat(raw.replace(',', '.').replace(/[^\d.-]/g, ''))
    if (isNaN(parsed)) { setInputText(null); return }
    if (mode === 'pct') {
      onCollabPctChange(Math.min(100, Math.max(0, parsed)))
    } else {
      onCollabBRLChange(Math.max(0, Math.round(parsed)))
    }
    setInputText(null)
  }

  const displayValue = mode === 'pct' ? `${collabPct}%` : BRL.format(collabBRL)
  const secondaryValue = mode === 'pct'
    ? BRL.format(projectedRevenue * collabPct / 100)
    : `${effectivePct.toFixed(1)}% do total`
  const shownValue = inputText ?? displayValue

  const sliderMinLabel = mode === 'brl' ? 'R$ 0' : '0%'
  const sliderMaxLabel = mode === 'brl' ? BRL.format(baseRevenue) : '100%'

  return (
    <div className="db-slider-field" style={{ gridColumn: '1 / -1' }}>
      <div className="db-slider-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="db-slider-label">Faturamento collab</span>
          <div className="db-collab-mode-toggle">
            <button
              className={`db-collab-mode-btn ${mode === 'pct' ? 'active' : ''}`}
              onClick={() => { onModeChange('pct'); setInputText(null) }}
              type="button"
            >%</button>
            <button
              className={`db-collab-mode-btn ${mode === 'brl' ? 'active' : ''}`}
              onClick={() => { onModeChange('brl'); setInputText(null) }}
              type="button"
            >R$</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {inputText === null && (
            <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>({secondaryValue})</span>
          )}
          <input
            className="db-slider-text-input"
            type="text"
            value={shownValue}
            style={{ width: mode === 'brl' ? '9ch' : '5ch' }}
            onChange={(e) => setInputText(e.target.value)}
            onBlur={(e) => commitText(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => { if (e.key === 'Enter') commitText((e.target as HTMLInputElement).value) }}
          />
        </div>
      </div>
      <input className="db-slider" type="range" min={0} max={100} step={1}
        value={sliderPct} onChange={(e) => handleSlider(Number(e.target.value))} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-muted)' }}>
        <span>{sliderMinLabel}</span><span>{sliderMaxLabel}</span>
      </div>
    </div>
  )
}

function OutcomeCard({
  cluster, roleLabel, projectedRevenue, projectedIndex, csat, mejEng,
  collabPct, collabBRL, currentClusterIdx,
}: {
  cluster: Cluster | null; roleLabel: string; projectedRevenue: number
  projectedIndex: number; csat: number; mejEng: number
  collabPct: number; collabBRL: number; currentClusterIdx: number
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
    if (collabBRL > 0) {
      // R$ mode: collabBRL is fixed and additive. Find minimum projectedRevenue.
      // index = (projectedRevenue + collabBRL) × csat × (1 + mejEng/100) × 100
      // → minProjRevenue = cluster.min / (csat × (1+mejEng/100) × 100) - collabBRL
      const simpleDiv = csat * (1 + mejEng / 100) * 100
      const minProjRevenue = cluster.min / simpleDiv - collabBRL
      missingRevenue = Math.max(0, minProjRevenue - projectedRevenue)
    } else {
      // % mode: collabPct held constant. Find minimum total revenue.
      const divisor = csat * (1 + mejEng / 100) * (1 + collabPct / 100) * 100
      const minRev = cluster.min / divisor
      missingRevenue = Math.max(0, minRev - projectedRevenue)
    }
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

  const [collabMode, setCollabMode] = useState<'pct' | 'brl'>('pct')
  const [collabPct, setCollabPct] = useState(
    data.revenue > 0 ? Math.round((data.collabRevenue / data.revenue) * 100) : 20,
  )
  const [collabBRL, setCollabBRL] = useState(data.collabRevenue || 0)

  // Base revenue = projects simulation + existing. Collab (R$ mode) is additive on top.
  const baseRevenue = projects * avgTicket + data.revenue
  const projectedRevenue = collabMode === 'brl' ? baseRevenue + collabBRL : baseRevenue
  const effectiveCollabPct = collabMode === 'brl'
    ? (projectedRevenue > 0 ? (collabBRL / projectedRevenue) * 100 : 0)
    : collabPct

  const projectedIndex = calcIndex(projectedRevenue, csat, mejEng, effectiveCollabPct)
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
          <SliderField
            label="Projetos finalizados no ano"
            value={projects} min={0} max={TRIENIO.simulation.maxProjects} step={1}
            displayValue={String(projects)}
            onChange={setProjects}
            minLabel="0" maxLabel={String(TRIENIO.simulation.maxProjects)}
          />
          <SliderField
            label="Ticket médio por projeto"
            value={avgTicket} min={0} max={TRIENIO.simulation.maxAvgTicket} step={500}
            displayValue={String(avgTicket)}
            onChange={setAvgTicket}
            minLabel="R$ 0" maxLabel={BRL.format(TRIENIO.simulation.maxAvgTicket)}
          />
          <SliderField
            label="CSAT médio"
            value={csat} min={0} max={5} step={0.1}
            displayValue={csat.toFixed(1)}
            onChange={setCsat}
            minLabel="0,0" maxLabel="5,0"
          />
          <SliderField
            label="Engajamento MEJ"
            value={mejEng} min={0} max={100} step={1}
            displayValue={`${mejEng}%`}
            onChange={setMejEng}
            minLabel="0%" maxLabel="100%"
          />
          <CollabField
            mode={collabMode} onModeChange={setCollabMode}
            collabPct={collabPct} onCollabPctChange={setCollabPct}
            collabBRL={collabBRL} onCollabBRLChange={setCollabBRL}
            baseRevenue={baseRevenue} projectedRevenue={projectedRevenue}
          />
        </div>

        <hr className="db-divider" />
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
          <span style={{ color: 'var(--color-muted)' }}>
            Faturamento projetado:{' '}
            <strong style={{ color: 'var(--color-text)' }}>{BRL.format(projectedRevenue)}</strong>
            <span style={{ color: 'var(--color-muted)', marginLeft: 4 }}>
              ({projects} × {BRL.format(avgTicket)} + base {BRL.format(data.revenue)}
              {collabMode === 'brl' && collabBRL > 0 && ` + collab ${BRL.format(collabBRL)}`})
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
            collabPct={effectiveCollabPct}
            collabBRL={collabMode === 'brl' ? collabBRL : 0}
            currentClusterIdx={currentClusterIdx}
          />
        ))}
      </div>
    </div>
  )
}
