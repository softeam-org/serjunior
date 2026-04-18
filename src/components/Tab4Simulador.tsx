import { useState } from 'react'
import {
  CLUSTERS,
  calcIndex,
  getClusterByIndex,
  getClusterById,
  getClusterIndex,
  getCollabPct,
  applyMovementRule,
  fmtIndex,
  fmtPct,
  type CompanyData,
} from '../utils/cluster'

interface Props { data: CompanyData }

const C5_DISPLAY_MAX = CLUSTERS[4].min * 2

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi)
}

function indexToBarPct(index: number): number {
  if (index <= 0) return 0
  const n = CLUSTERS.length
  for (let i = 0; i < n; i++) {
    const c = CLUSTERS[i]
    const isLast = i === n - 1
    const clMax = isLast ? C5_DISPLAY_MAX : c.max
    if (isLast || index <= clMax) {
      const segStart = (i / n) * 100
      const segWidth = 100 / n
      const posWithin = clamp((index - c.min) / (clMax - c.min), 0, 1)
      return segStart + posWithin * segWidth
    }
  }
  return 100
}

function Field({
  label, value, onChange, prefix, suffix, step, min,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  prefix?: string
  suffix?: string
  step?: number
  min?: number
}) {
  return (
    <div className="ob-field">
      <label className="ob-label">{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {prefix && (
          <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', flexShrink: 0 }}>
            {prefix}
          </span>
        )}
        <input
          className="ob-input"
          type="number"
          min={min ?? 0}
          step={step ?? 1}
          value={value}
          onChange={(e) => {
            const parsed = parseFloat(e.target.value)
            onChange(isNaN(parsed) ? 0 : parsed)
          }}
          style={{ flex: 1 }}
        />
        {suffix && (
          <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)', flexShrink: 0 }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

export default function Tab4Simulador({ data }: Props) {
  const [revenue, setRevenue] = useState(data.revenue || 0)
  const [csat, setCsat] = useState(data.csat || 0)
  const [mejEng, setMejEng] = useState(data.mejEngagement || 0)
  const [collabRevenue, setCollabRevenue] = useState(data.collabRevenue || 0)

  const collabPct = getCollabPct(collabRevenue, revenue)
  const index = calcIndex(revenue, csat, mejEng, collabPct)
  const rawCluster = getClusterByIndex(index)

  const currentClusterIdx = getClusterIndex(data.currentCluster)
  const rawClusterIdx = getClusterIndex(rawCluster.id)
  const diff = rawClusterIdx - currentClusterIdx

  const effectiveIdx = applyMovementRule(rawClusterIdx, currentClusterIdx)
  const resultCluster = CLUSTERS[effectiveIdx]
  const wasCapped = effectiveIdx !== rawClusterIdx

  const nextClusterIdx = effectiveIdx + 1
  const nextCluster = nextClusterIdx < CLUSTERS.length ? CLUSTERS[nextClusterIdx] : null
  const distanceToNext = nextCluster ? Math.max(0, nextCluster.min - index) : null

  const markerPct = indexToBarPct(index)

  const effectiveDiff = effectiveIdx - currentClusterIdx

  function getAlert() {
    if (csat === 0)
      return { type: 'danger', text: '⚠️ CSAT zerado — o índice é anulado independentemente do faturamento e demais variáveis.' }
    if (wasCapped && diff > 1)
      return { type: 'warning', text: `⚠️ A pontuação qualificaria para o ${rawCluster.label}, mas só é possível subir um cluster por avaliação. O desfecho real seria subir para o ${resultCluster.label}.` }
    if (wasCapped && diff < -1)
      return { type: 'warning', text: `⚠️ A pontuação qualificaria para o ${rawCluster.label}, mas só é possível cair um cluster por avaliação. O desfecho real seria cair para o ${resultCluster.label}.` }
    if (effectiveDiff > 0)
      return { type: 'success', text: `🚀 Desfecho de subida: com esses valores a empresa subiria para o ${resultCluster.label}.` }
    if (effectiveDiff < 0)
      return { type: 'danger', text: `📉 Desfecho de queda: com esses valores a empresa cairia para o ${resultCluster.label}.` }
    return { type: 'info', text: `✅ Permanência: a empresa permaneceria no ${getClusterById(data.currentCluster).label} com esses valores.` }
  }

  const alert = getAlert()

  return (
    <div>
      <p className="db-section-title">Digite qualquer valor para simular</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.85rem' }}>
        Diferente da aba anterior, aqui você não está preso às suas metas ou ao histórico de projetos — pode digitar qualquer número livremente. Ideal para testar hipóteses do tipo "e se o CSAT cair?" ou "quanto de faturamento precisaria para subir de cluster?".
      </p>
      <div className="db-card" style={{ marginBottom: '1.25rem' }}>
        <div className="ob-grid">
          <Field
            label="Faturamento total"
            value={revenue}
            onChange={setRevenue}
            prefix="R$"
          />
          <Field
            label="CSAT"
            value={csat}
            onChange={setCsat}
            step={0.1}
            suffix="/ 5,0"
          />
          <Field
            label="Engajamento MEJ"
            value={mejEng}
            onChange={setMejEng}
            step={0.1}
            suffix="%"
          />
          <Field
            label="Faturamento collab"
            value={collabRevenue}
            onChange={setCollabRevenue}
            prefix="R$"
          />
        </div>

        {revenue > 0 && collabRevenue > 0 && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
            % collab calculada: <strong style={{ color: 'var(--color-text)' }}>{fmtPct(collabPct)}</strong>
            {collabRevenue > revenue && (
              <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>
                ⚠️ Collab não pode exceder o faturamento total
              </span>
            )}
          </p>
        )}
      </div>

      <p className="db-section-title">Resultado calculado</p>
      <div className="db-result-row" style={{ marginBottom: '1.25rem' }}>
        <div className="db-highlight-card">
          <span className="db-highlight-label">Índice calculado</span>
          <span className="db-highlight-value" style={{ color: csat === 0 ? '#dc2626' : 'var(--color-text)' }}>
            {fmtIndex(index)}
          </span>
        </div>

        <div className="db-highlight-card" style={{ borderColor: resultCluster.color + '99' }}>
          <span className="db-highlight-label">Cluster resultante</span>
          <span className="db-highlight-value" style={{ color: resultCluster.color }}>
            {resultCluster.label}
          </span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600,
            color: effectiveDiff === 0 ? 'var(--color-muted)' : effectiveDiff > 0 ? '#15803d' : '#92400e',
          }}>
            {effectiveDiff === 0 ? 'Permanência'
              : effectiveDiff > 0 ? `↑ Sobe 1 cluster`
              : `↓ Cai 1 cluster`}
          </span>
          {wasCapped && (
            <span style={{ fontSize: '0.68rem', color: '#92400e', marginTop: '0.2rem' }}>
              Pontuação qualificaria {diff > 0 ? 'para' : 'para'} {rawCluster.label}, mas limitado a ±1
            </span>
          )}
        </div>

        <div className="db-highlight-card">
          <span className="db-highlight-label">Quanto falta para o próximo cluster?</span>
          {nextCluster ? (
            <>
              <span className="db-highlight-value" style={{ fontSize: '1.15rem' }}>
                {distanceToNext === 0 ? 'Já atingido' : fmtIndex(distanceToNext!) + ' pts'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                para entrar no {nextCluster.label} (mínimo: {fmtIndex(nextCluster.min)} pts)
              </span>
            </>
          ) : (
            <span className="db-highlight-value" style={{ fontSize: '1rem', color: 'var(--color-muted)' }}>
              Cluster 5 — nível máximo
            </span>
          )}
        </div>
      </div>

      <p className="db-section-title">Onde você ficaria no ranking</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.85rem' }}>
        A bolinha mostra onde a pontuação simulada cai dentro da régua de clusters. Quanto mais à direita, maior a pontuação e mais próximo do Cluster 5.
      </p>
      <div className="db-card" style={{ marginBottom: '1.25rem' }}>
        <div className="db-sim-bar-outer">
          <div className="db-sim-bar-track">
            {CLUSTERS.map((c) => (
              <div
                key={c.id}
                className={`db-sim-bar-seg ${resultCluster.id === c.id ? 'active-seg' : ''}`}
                style={{ background: c.color }}
              >
                {c.label}
              </div>
            ))}
          </div>
          <div className="db-sim-bar-marker" style={{ left: `${markerPct}%` }}>
            <div
              className="db-sim-bar-marker-pin"
              style={{
                background: resultCluster.color,
                boxShadow: `0 0 0 3px ${resultCluster.color}44, 0 2px 6px rgba(0,0,0,0.2)`,
              }}
            />
            <div className="db-sim-bar-marker-line" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.75rem' }}>
          {CLUSTERS.map((c) => (
            <div key={c.id} style={{
              flex: 1, textAlign: 'center', fontSize: '0.65rem',
              color: resultCluster.id === c.id ? c.color : 'var(--color-muted)',
              fontWeight: resultCluster.id === c.id ? 700 : 400,
            }}>
              {c.max === Infinity
                ? `>${new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 0 }).format(c.min)}`
                : new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 0 }).format(c.max)}
            </div>
          ))}
        </div>
      </div>

      <div className={`db-ctx-alert ${alert.type}`}>{alert.text}</div>
    </div>
  )
}
