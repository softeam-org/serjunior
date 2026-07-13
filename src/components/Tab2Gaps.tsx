import { useState } from 'react'
import {
  CLUSTERS,
  CSAT_LEVELS,
  calcIndex,
  getClusterByIndex,
  getClusterById,
  getClusterIndex,
  getCollabPct,
  getFloorValues,
  minRevenueForThreshold,
  BRL,
  fmtIndex,
  fmtPct,
  type CompanyData,
} from '../utils/cluster'

interface Props { data: CompanyData }

type SensMode = 'metas' | 'subir' | 'manter'

interface MinItem {
  label: string
  color: string
  currentDisplay: string
  minNeeded: number | null   // null = já atinge sozinho
  minDisplay: string
  unit: 'brl' | 'csat' | 'pct'
  impossible: boolean
}

// ─── Calcula o mínimo de cada variável para atingir um índice alvo,
//     mantendo todas as outras no valor ATUAL.
function calcMins(data: CompanyData, targetIndex: number): MinItem[] {
  const { revenue, csat, mejEngagement, collabRevenue } = data
  const collabPct = getCollabPct(collabRevenue, revenue)
  const currentIndex = calcIndex(revenue, csat, mejEngagement, collabPct)
  const alreadyOk = currentIndex >= targetIndex

  const floors = getFloorValues(data, targetIndex)

  return [
    {
      label: 'Faturamento',
      color: '#3b82f6',
      currentDisplay: BRL.format(revenue),
      minNeeded: (alreadyOk || floors.minRevenue === null) ? null : floors.minRevenue,
      minDisplay: floors.minRevenue === null ? 'Impossível' : BRL.format(floors.minRevenue),
      unit: 'brl',
      impossible: floors.minRevenue === null,
    },
    {
      label: 'CSAT',
      color: '#10b981',
      currentDisplay: csat.toFixed(1),
      minNeeded: (alreadyOk || floors.minCsat === null) ? null : floors.minCsat,
      minDisplay: floors.minCsat === null ? 'Impossível (máx 5,0)' : floors.minCsat.toFixed(2),
      unit: 'csat',
      impossible: floors.minCsat === null,
    },
    {
      label: 'Engajamento MEJ',
      color: '#f59e0b',
      currentDisplay: fmtPct(mejEngagement),
      minNeeded: (alreadyOk || floors.minMejEngagement === null) ? null : floors.minMejEngagement,
      minDisplay: floors.minMejEngagement === null ? 'Impossível (máx 100%)' : fmtPct(floors.minMejEngagement),
      unit: 'pct',
      impossible: floors.minMejEngagement === null,
    },
    {
      label: 'Faturamento collab',
      color: 'var(--c5)',
      currentDisplay: BRL.format(collabRevenue),
      minNeeded: (alreadyOk || floors.minCollabRevenue === null) ? null : floors.minCollabRevenue,
      minDisplay: floors.minCollabRevenue === null ? 'Impossível' : BRL.format(floors.minCollabRevenue),
      unit: 'brl',
      impossible: floors.minCollabRevenue === null,
    },
  ]
}

function GapDisplay({ item }: { item: MinItem }) {
  const already = item.minNeeded === null && !item.impossible
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #f1f5f9',
      gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 160 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.label}</span>
      </div>
      <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
        Atual: <strong style={{ color: 'var(--color-text)' }}>{item.currentDisplay}</strong>
      </span>
      <span style={{ fontSize: '0.8rem' }}>
        {already ? (
          <span style={{ color: '#15803d', fontWeight: 700 }}>✓ Já suficiente</span>
        ) : item.impossible ? (
          <span style={{ color: '#dc2626', fontWeight: 600 }}>{item.minDisplay}</span>
        ) : (
          <>
            <span style={{ color: 'var(--color-muted)' }}>Mínimo: </span>
            <strong style={{ color: item.color }}>{item.minDisplay}</strong>
            {item.minNeeded !== null && (
              <span style={{ color: 'var(--color-muted)', marginLeft: 6, fontSize: '0.72rem' }}>
                {item.unit === 'brl' && `(+${BRL.format(Math.max(0, (item.minNeeded as number) - parseCurrentNum(item)))})`}
                {item.unit === 'csat' && `(+${Math.max(0, (item.minNeeded as number) - parseFloat(item.currentDisplay)).toFixed(2)})`}
                {item.unit === 'pct' && `(+${fmtPct(Math.max(0, (item.minNeeded as number) - parseFloat(item.currentDisplay)))})`}
              </span>
            )}
          </>
        )}
      </span>
    </div>
  )
}

function parseCurrentNum(item: MinItem): number {
  if (item.unit === 'brl') return parseFloat(item.currentDisplay.replace(/[^0-9,]/g, '').replace(',', '.')) || 0
  return parseFloat(item.currentDisplay) || 0
}

export default function Tab2Gaps({ data }: Props) {
  const [sensMode, setSensMode] = useState<SensMode>('metas')

  const currentIdx = getClusterIndex(data.currentCluster)
  const currentCluster = getClusterById(data.currentCluster)
  const prevCluster = currentIdx > 0 ? CLUSTERS[currentIdx - 1] : null
  const nextCluster = currentIdx < CLUSTERS.length - 1 ? CLUSTERS[currentIdx + 1] : null

  // ── Modo "Minhas metas" ──────────────────────────────────────────
  const targetCollabPct = getCollabPct(data.targetCollabRevenue, data.targetRevenue)
  const currentCollabPctAtTargetRev = getCollabPct(data.collabRevenue, data.targetRevenue)
  const targetCollabPctAtCurrentRev = getCollabPct(data.targetCollabRevenue, data.revenue)
  const fullTarget = calcIndex(data.targetRevenue, data.targetCsat, data.targetMejEngagement, targetCollabPct)

  interface SensItem { label: string; impact: number; color: string; current: string; target: string }
  const sensItems: SensItem[] = [
    {
      label: 'Faturamento', color: '#3b82f6',
      current: BRL.format(data.revenue), target: BRL.format(data.targetRevenue),
      impact: fullTarget - calcIndex(data.revenue, data.targetCsat, data.targetMejEngagement, targetCollabPctAtCurrentRev),
    },
    {
      label: 'CSAT', color: '#10b981',
      current: data.csat.toFixed(1), target: data.targetCsat.toFixed(1),
      impact: fullTarget - calcIndex(data.targetRevenue, data.csat, data.targetMejEngagement, targetCollabPct),
    },
    {
      label: 'Engajamento MEJ', color: '#f59e0b',
      current: fmtPct(data.mejEngagement), target: fmtPct(data.targetMejEngagement),
      impact: fullTarget - calcIndex(data.targetRevenue, data.targetCsat, data.mejEngagement, targetCollabPct),
    },
    {
      label: 'Faturamento collab', color: 'var(--c5)',
      current: BRL.format(data.collabRevenue), target: BRL.format(data.targetCollabRevenue),
      impact: fullTarget - calcIndex(data.targetRevenue, data.targetCsat, data.targetMejEngagement, currentCollabPctAtTargetRev),
    },
  ].sort((a, b) => b.impact - a.impact)
  const maxImpact = Math.max(...sensItems.map((s) => s.impact), 1)

  // ── Modo "Subir" / "Manter" ──────────────────────────────────────
  const subirTarget = nextCluster ? nextCluster.min : null
  const manterTarget = currentCluster.min

  const subirMins = subirTarget !== null ? calcMins(data, subirTarget) : []
  const manterMins = calcMins(data, manterTarget)

  // ── Tabelas ──────────────────────────────────────────────────────
  const tableClusters = [prevCluster, currentCluster, nextCluster]

  const MODE_LABELS: Record<SensMode, string> = {
    metas: 'Minhas metas',
    subir: nextCluster ? `Subir para ${nextCluster.label}` : 'Subir de cluster',
    manter: `Não cair (manter ${currentCluster.label})`,
  }

  return (
    <div>
      <p className="db-section-title">Análise de sensibilidade</p>
      <div className="db-card" style={{ marginBottom: '1.25rem' }}>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {(['metas', 'subir', 'manter'] as SensMode[]).map((m) => {
            const disabled = m === 'subir' && !nextCluster
            return (
              <button
                key={m}
                disabled={disabled}
                onClick={() => setSensMode(m)}
                className={sensMode === m ? 'db-btn db-btn-primary' : 'db-btn db-btn-ghost'}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem', opacity: disabled ? 0.4 : 1 }}
              >
                {MODE_LABELS[m]}
              </button>
            )
          })}
        </div>

        {/* ── Minhas metas ── */}
        {sensMode === 'metas' && (
          <>
            <div style={{
              background: '#f8fafc', border: '1px solid var(--color-border)',
              borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.25rem',
              fontSize: '0.8rem', lineHeight: 1.6,
            }}>
              <p style={{ fontWeight: 700, marginBottom: '0.35rem' }}>O que cada barra significa?</p>
              <p style={{ color: 'var(--color-muted)' }}>
                Imagine que todas as suas metas já foram batidas — exceto uma. Cada barra mostra quanto de pontuação você estaria perdendo por causa dessa variável ainda estar no valor atual.
                <strong> Barra grande = essa variável é a que mais está puxando sua pontuação para baixo.</strong> Barra pequena ou zero = essa variável já está próxima da meta, ou tem menos peso no cálculo.
              </p>
            </div>
            {sensItems.map((item) => (
              <div key={item.label} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                    atual: <strong style={{ color: 'var(--color-text)' }}>{item.current}</strong>
                    {' → '}
                    meta: <strong style={{ color: item.color }}>{item.target}</strong>
                  </span>
                </div>
                <div className="sens-bar-row" style={{ marginBottom: 0 }}>
                  <div className="sens-bar-track">
                    <div className="sens-bar-fill" style={{ width: `${Math.max(0, (item.impact / maxImpact) * 100)}%`, background: item.color }} />
                  </div>
                  <span className="sens-bar-value" style={{ color: item.impact >= 0 ? '#15803d' : '#dc2626' }}>
                    {item.impact >= 0 ? '+' : ''}{fmtIndex(item.impact)}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── Subir de cluster ── */}
        {sensMode === 'subir' && nextCluster && (
          <>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem',
              fontSize: '0.8rem', lineHeight: 1.6,
            }}>
              <p style={{ fontWeight: 700, color: '#15803d', marginBottom: '0.35rem' }}>
                O que eu precisaria mudar para subir para o {nextCluster.label}?
              </p>
              <p style={{ color: '#166534' }}>
                Para cada indicador, calculamos o valor mínimo que ele precisaria ter — <strong>sozinho, sem mudar mais nada</strong> — para que sua empresa já entrasse no próximo cluster. Se aparecer "Já suficiente", esse indicador por si só já te levaria lá.
              </p>
            </div>
            <div style={{ borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              {subirMins.map((item) => <GapDisplay key={item.label} item={item} />)}
            </div>
          </>
        )}

        {/* ── Não cair ── */}
        {sensMode === 'manter' && (
          <>
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem',
              fontSize: '0.8rem', lineHeight: 1.6,
            }}>
              <p style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.35rem' }}>
                Qual o mínimo para não perder o {currentCluster.label}?
              </p>
              <p style={{ color: '#78350f' }}>
                Útil quando as metas do ano estão fora do alcance e você quer saber o chão: qual o menor valor que cada indicador pode ter — <strong>sem mexer nos outros</strong> — antes de a empresa cair para o cluster abaixo? Se aparecer "Já suficiente", esse indicador no valor atual já garante a permanência.
              </p>
            </div>
            <div style={{ borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
              {manterMins.map((item) => <GapDisplay key={item.label} item={item} />)}
            </div>
          </>
        )}
      </div>

      {/* ── Projeção de CSAT ── */}
      <p className="db-section-title">Impacto do CSAT na pontuação</p>
      <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
          O CSAT multiplica diretamente toda a pontuação. Veja abaixo como diferentes notas de satisfação afetam o resultado final — considerando que faturamento, engajamento e collab estão nas metas.
        </p>
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr><th>CSAT</th><th>Índice resultante</th><th>Cluster</th></tr>
            </thead>
            <tbody>
              {CSAT_LEVELS.map((csat) => {
                const idx = calcIndex(data.targetRevenue, csat, data.targetMejEngagement, targetCollabPct)
                const cl = getClusterByIndex(idx)
                return (
                  <tr key={csat}>
                    <td style={{ textAlign: 'left', fontWeight: 700 }}>{csat.toFixed(1)}</td>
                    <td>{fmtIndex(idx)}</td>
                    <td><span className={`cluster-badge ${cl.id}`} style={{ fontSize: '0.7rem' }}>{cl.label}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Faturamento mínimo por cluster ── */}
      <p className="db-section-title">Faturamento mínimo para cada cluster</p>
      <div>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
          Quanto de faturamento você precisaria ter, dependendo do CSAT obtido, para entrar em cada um dos três clusters possíveis. Os outros indicadores são considerados nas metas. Use essa tabela para entender o quanto o CSAT afeta o faturamento necessário.
        </p>
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>CSAT</th>
                {tableClusters.map((c) => c ? <th key={c.id} style={{ color: c.color }}>Entrar no {c.label}</th> : null)}
              </tr>
            </thead>
            <tbody>
              {CSAT_LEVELS.map((csat) => (
                <tr key={csat}>
                  <td style={{ textAlign: 'left', fontWeight: 700 }}>{csat.toFixed(1)}</td>
                  {tableClusters.map((c) => {
                    if (!c) return null
                    const isCurrent = c.id === data.currentCluster
                    const minRev = minRevenueForThreshold(c.min === 0 ? 0 : c.min, csat, data.targetMejEngagement, data.targetCollabRevenue)
                    return (
                      <td key={c.id} style={isCurrent ? { fontWeight: 700, color: c.color } : undefined}>
                        {c.min === 0 ? <span style={{ color: '#15803d' }}>Qualquer valor</span>
                          : !isFinite(minRev) ? <span style={{ color: '#dc2626' }}>Impossível</span>
                          : BRL.format(minRev)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
