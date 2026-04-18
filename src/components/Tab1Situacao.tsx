import {
  CLUSTERS,
  calcIndex,
  getClusterById,
  getCollabPct,
  BRL,
  fmtIndex,
  fmtPct,
  type CompanyData,
} from '../utils/cluster'

interface Props { data: CompanyData }

const CLUSTER_COLORS: Record<string, string> = {
  C1: 'var(--c1)', C2: 'var(--c2)', C3: 'var(--c3)', C4: 'var(--c4)', C5: 'var(--c5)',
}

function ProgressBar({
  label, current, target, displayCurrent, displayTarget, color,
}: {
  label: string; current: number; target: number
  displayCurrent: string; displayTarget: string; color: string
}) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 100
  return (
    <div className="db-prog-wrap">
      <div className="db-prog-header">
        <span className="db-prog-label">{label}</span>
        <span className="db-prog-values">{displayCurrent} / {displayTarget}</span>
        <span className="db-prog-pct">{fmtPct(pct)}</span>
      </div>
      <div className="db-prog-track">
        <div className="db-prog-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function Tab1Situacao({ data }: Props) {
  const collabPct = getCollabPct(data.collabRevenue, data.revenue)
  const index = calcIndex(data.revenue, data.csat, data.mejEngagement, collabPct)
  const currentCluster = getClusterById(data.currentCluster)

  const targetCollabPct = getCollabPct(data.targetCollabRevenue, data.targetRevenue)
  const targetIndex = calcIndex(data.targetRevenue, data.targetCsat, data.targetMejEngagement, targetCollabPct)

  const revProgress = data.targetRevenue > 0 ? (data.revenue / data.targetRevenue) * 100 : 100
  const clColor = CLUSTER_COLORS[data.currentCluster]

  return (
    <div>
      {data.csat === 0 && (
        <div className="db-alert-csat">
          <span className="db-alert-icon">⚠️</span>
          <div>
            <div className="db-alert-title">CSAT zerado — pontuação anulada</div>
            <div className="db-alert-body">
              O CSAT é o único indicador que pode zerar toda a pontuação da empresa, não importa
              o quanto os outros estejam bons. Com CSAT = 0, o índice vai a zero e o cluster
              calculado não reflete a realidade. Registre a avaliação dos clientes para desbloquear
              o cálculo correto.
            </div>
          </div>
        </div>
      )}

      <p className="db-section-title">Visão geral</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.85rem' }}>
        Resumo do desempenho atual da sua empresa: onde você está hoje, qual é a sua pontuação e quanto falta para bater a meta de faturamento.
      </p>
      <div className="db-grid-5" style={{ marginBottom: '1.25rem' }}>
        <div className="db-card">
          <div className="db-card-title">Empresa</div>
          <div className="db-card-value" style={{ fontSize: '1.05rem', lineHeight: 1.4 }}>
            {data.companyName}
          </div>
        </div>

        <div className="db-card" style={{ borderColor: clColor + '66' }}>
          <div className="db-card-title">Cluster atual</div>
          <div className="db-card-value lg" style={{ color: clColor, fontSize: '1.2rem' }}>{currentCluster.label}</div>
        </div>

        <div className="db-card">
          <div className="db-card-title">Índice atual</div>
          <div
            className="db-card-value"
            style={{ color: data.csat === 0 ? '#dc2626' : 'var(--color-text)' }}
          >
            {fmtIndex(index)}
          </div>
          <div className="db-card-sub">Meta: {fmtIndex(targetIndex)}</div>
        </div>

        <div className="db-card">
          <div className="db-card-title">Faturamento</div>
          <div className="db-card-value" style={{ fontSize: '1.1rem' }}>{BRL.format(data.revenue)}</div>
          <div className="db-card-sub">Meta: {BRL.format(data.targetRevenue)}</div>
        </div>

        <div className="db-card">
          <div className="db-card-title">Progresso de faturamento</div>
          <div
            className="db-card-value lg"
            style={{
              color: revProgress >= 100 ? '#15803d' : revProgress >= 70 ? '#92400e' : '#dc2626',
            }}
          >
            {fmtPct(revProgress)}
          </div>
          <div className="db-prog-track" style={{ marginTop: '0.5rem' }}>
            <div
              className="db-prog-fill"
              style={{
                width: `${Math.min(revProgress, 100)}%`,
                background: revProgress >= 100 ? '#16a34a' : revProgress >= 70 ? '#d97706' : '#dc2626',
              }}
            />
          </div>
        </div>
      </div>

      <p className="db-section-title">Progresso por variável</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.85rem' }}>
        Quanto você já avançou em cada indicador em relação à meta. A barra mostra o percentual concluído — 100% significa que a meta foi atingida.
      </p>
      <div
        className="db-card"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}
      >
        <ProgressBar
          label="Faturamento"
          current={data.revenue} target={data.targetRevenue}
          displayCurrent={BRL.format(data.revenue)} displayTarget={BRL.format(data.targetRevenue)}
          color="#3b82f6"
        />
        <ProgressBar
          label="CSAT"
          current={data.csat} target={data.targetCsat}
          displayCurrent={data.csat.toFixed(1)} displayTarget={data.targetCsat.toFixed(1)}
          color="#10b981"
        />
        <ProgressBar
          label="Engajamento MEJ"
          current={data.mejEngagement} target={data.targetMejEngagement}
          displayCurrent={fmtPct(data.mejEngagement)} displayTarget={fmtPct(data.targetMejEngagement)}
          color="#f59e0b"
        />
        <ProgressBar
          label="Faturamento collab"
          current={data.collabRevenue} target={data.targetCollabRevenue}
          displayCurrent={BRL.format(data.collabRevenue)} displayTarget={BRL.format(data.targetCollabRevenue)}
          color="var(--c5)"
        />
      </div>

      <p className="db-section-title">Ranking de clusters</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.85rem' }}>
        Os clusters vão do 1 ao 5 e representam o nível de desenvolvimento da empresa júnior, calculado com base na pontuação. O segmento destacado é onde sua empresa está agora.
      </p>
      <div className="db-card db-spectrum-wrap">
        <div className="db-spectrum-bar" style={{ position: 'relative' }}>
          {CLUSTERS.map((c) => (
            <div
              key={c.id}
              className={`db-spectrum-seg ${c.id === data.currentCluster ? 'active' : ''}`}
              style={{ background: c.color, fontSize: '0.6rem' }}
            >
              {c.label}
            </div>
          ))}
        </div>
        <div style={{ height: '1rem' }} />
        <div className="db-spectrum-labels">
          {CLUSTERS.map((c, i) => (
            <div key={c.id} className="db-spectrum-range">
              <div style={{ fontWeight: 700, color: c.color, fontSize: '0.72rem' }}>{c.label}</div>
              <div>
                {i === 0 ? '0' : new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(c.min)}
                {' – '}
                {c.max === Infinity
                  ? '∞'
                  : new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(c.max)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
