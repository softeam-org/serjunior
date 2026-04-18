import { useState } from 'react'
import { CLUSTERS, CSAT_MIN, CSAT_MAX } from '../utils/cluster'
import type { CompanyData, ClusterId } from '../utils/cluster'

interface Props {
  initial: CompanyData | null
  onComplete: (data: CompanyData) => void
}

const BLANK: CompanyData = {
  companyName: '',
  currentCluster: 'C1',
  revenue: 0,
  csat: 0,
  mejEngagement: 0,
  collabRevenue: 0,
  targetRevenue: 0,
  targetCsat: 5,
  targetMejEngagement: 100,
  targetCollabRevenue: 0,
}

export default function Onboarding({ initial, onComplete }: Props) {
  const [form, setForm] = useState<CompanyData>(initial ?? BLANK)
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyData, string>>>({})

  function set<K extends keyof CompanyData>(key: K, value: CompanyData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof CompanyData, string>> = {}
    if (!form.companyName.trim()) errs.companyName = 'Obrigatório'
    if (form.revenue < 0) errs.revenue = 'Deve ser ≥ 0'
    if (form.csat < CSAT_MIN || form.csat > CSAT_MAX) errs.csat = `Entre ${CSAT_MIN},0 e ${CSAT_MAX},0`
    if (form.mejEngagement < 0 || form.mejEngagement > 100) errs.mejEngagement = 'Entre 0 e 100%'
    if (form.collabRevenue < 0) errs.collabRevenue = 'Deve ser ≥ 0'
    if (form.collabRevenue > form.revenue && form.revenue > 0)
      errs.collabRevenue = 'Não pode exceder o faturamento total'
    if (form.targetRevenue <= 0) errs.targetRevenue = 'Deve ser > 0'
    if (form.targetCsat <= CSAT_MIN || form.targetCsat > CSAT_MAX) errs.targetCsat = `Entre 0,1 e ${CSAT_MAX},0`
    if (form.targetMejEngagement < 0 || form.targetMejEngagement > 100)
      errs.targetMejEngagement = 'Entre 0 e 100%'
    if (form.targetCollabRevenue < 0) errs.targetCollabRevenue = 'Deve ser ≥ 0'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onComplete(form)
  }

  function numField(key: keyof CompanyData, label: string, opts: {
    min?: number; max?: number; step?: number; placeholder?: string; hint?: string
  } = {}) {
    return (
      <div className="ob-field">
        <label className="ob-label">{label}{opts.hint && <span style={{ color: 'var(--db-muted)', fontWeight: 400, marginLeft: 4 }}>({opts.hint})</span>}</label>
        <input
          className="ob-input"
          type="number"
          min={opts.min ?? 0}
          max={opts.max}
          step={opts.step ?? 1}
          placeholder={opts.placeholder ?? '0'}
          value={form[key] as number}
          onChange={(e) => {
            const raw = e.target.value
            const parsed = parseFloat(raw)
            set(key, isNaN(parsed) ? 0 : parsed)
          }}
        />
        {errors[key] && <span style={{ fontSize: '0.72rem', color: '#dc2626' }}>{errors[key]}</span>}
      </div>
    )
  }

  return (
    <div className="ob-wrap">
      <div className="ob-card">
        <div className="ob-header">
          <div className="ob-logo">SerJunior</div>
          <p className="ob-subtitle">Dashboard de Acompanhamento de Cluster</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Dados da empresa ── */}
          <p className="ob-section-title">Dados da empresa</p>
          <div className="ob-grid">
            <div className="ob-field full">
              <label className="ob-label">Nome da empresa</label>
              <input
                className="ob-input"
                type="text"
                placeholder="Ex.: EJ Soluções"
                value={form.companyName}
                onChange={(e) => set('companyName', e.target.value)}
              />
              {errors.companyName && <span style={{ fontSize: '0.72rem', color: 'var(--db-danger)' }}>{errors.companyName}</span>}
            </div>

            <div className="ob-field">
              <label className="ob-label">Cluster atual</label>
              <select
                className="ob-select"
                value={form.currentCluster}
                onChange={(e) => set('currentCluster', e.target.value as ClusterId)}
              >
                {CLUSTERS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {numField('revenue', 'Faturamento atual', { placeholder: '50000', hint: 'R$' })}
            {numField('csat', 'CSAT atual', { min: 0, max: 5, step: 0.1, placeholder: '4.5', hint: '0,0 – 5,0' })}
            {numField('mejEngagement', 'Engajamento MEJ atual', { min: 0, max: 100, step: 0.1, placeholder: '65', hint: '%' })}
            {numField('collabRevenue', 'Faturamento collab atual', { placeholder: '10000', hint: 'R$' })}
          </div>

          {/* ── Metas ── */}
          <p className="ob-section-title">Metas</p>
          <div className="ob-grid">
            {numField('targetRevenue', 'Meta de faturamento', { placeholder: '100000', hint: 'R$' })}
            {numField('targetCsat', 'Meta de CSAT', { min: 0.1, max: 5, step: 0.1, placeholder: '5.0', hint: '0,1 – 5,0' })}
            {numField('targetMejEngagement', 'Meta de engajamento MEJ', { min: 0, max: 100, step: 0.1, placeholder: '80', hint: '%' })}
            {numField('targetCollabRevenue', 'Meta de faturamento collab', { placeholder: '25000', hint: 'R$' })}
          </div>

          <div className="ob-footer">
            {initial && (
              <button type="button" className="db-btn db-btn-ghost" onClick={() => onComplete(initial)}>
                Cancelar
              </button>
            )}
            <button type="submit" className="db-btn db-btn-primary">
              {initial ? 'Salvar alterações' : 'Entrar no dashboard →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
