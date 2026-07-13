import { useRef, useState } from 'react'
import {
  CLUSTERS,
  CSAT_MIN,
  CSAT_MAX,
  MAX_CLUSTER_MOVEMENT,
  calcIndex,
  getCollabPct,
  getClusterByIndex,
  getClusterIndex,
  applyMovementRule,
  fmtIndex,
} from '../utils/cluster'
import type { CompanyData, ClusterId } from '../utils/cluster'
import {
  IconBuilding,
  IconGauge,
  IconTarget,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconInfo,
  IconAlertTriangle,
} from './icons'

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

const STEPS = [
  { n: 1, label: 'Identificação', Icon: IconBuilding },
  { n: 2, label: 'Indicadores', Icon: IconGauge },
  { n: 3, label: 'Metas', Icon: IconTarget },
] as const

/** Chaves validadas em cada etapa do wizard. */
const STEP_FIELDS: Record<number, (keyof CompanyData)[]> = {
  1: ['companyName'],
  2: ['revenue', 'csat', 'mejEngagement', 'collabRevenue'],
  3: ['targetRevenue', 'targetCsat', 'targetMejEngagement', 'targetCollabRevenue'],
}

/**
 * Input numérico que mantém estado de exibição (string) separado do valor
 * semântico (number). Isso evita o "0 preso" do type="number" controlado,
 * onde o browser bloqueia digitação enquanto o campo mostra "0".
 *
 * Aceita vírgula como separador decimal (padrão pt-BR).
 */
function NumInput({
  numValue,
  onNumChange,
  placeholder,
  step,
  prefix,
  suffix,
}: {
  numValue: number
  onNumChange: (v: number) => void
  placeholder?: string
  step?: number
  prefix?: string
  suffix?: string
}) {
  // Inicializa vazio quando o valor é 0, para o usuário digitar livremente
  const [text, setText] = useState(() => (numValue === 0 ? '' : String(numValue)))

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d,.]/, '').replace(/^0+(\d)/, '$1')
    setText(raw)
    // Aceita vírgula como decimal (pt-BR)
    const norm = raw.replace(',', '.')
    const parsed = parseFloat(norm)
    onNumChange(isNaN(parsed) ? 0 : parsed)
  }

  function handleBlur() {
    // Normaliza a exibição ao sair do campo
    const norm = text.replace(',', '.')
    const parsed = parseFloat(norm)
    setText(isNaN(parsed) || parsed === 0 ? '' : String(parsed))
  }

  return (
    <div className={`ob-input-wrap${prefix ? ' has-prefix' : ''}${suffix ? ' has-suffix' : ''}`}>
      {prefix && <span className="ob-input-affix prefix">{prefix}</span>}
      <input
        className="ob-input"
        type="text"
        inputMode="decimal"
        placeholder={placeholder ?? '0'}
        value={text}
        step={step}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {suffix && <span className="ob-input-affix suffix">{suffix}</span>}
    </div>
  )
}

/**
 * Painel de pré-visualização do índice/cluster calculado ao vivo.
 *
 * O cluster exibido respeita a regra de movimentação máxima por avaliação
 * (±MAX_CLUSTER_MOVEMENT a partir do cluster atual): mesmo que o índice bruto
 * qualifique para um cluster distante, a EJ só chega até o limite permitido.
 */
function IndexPreview({
  title,
  revenue,
  csat,
  mejEngagement,
  collabRevenue,
  currentCluster,
}: {
  title: string
  revenue: number
  csat: number
  mejEngagement: number
  collabRevenue: number
  currentCluster: ClusterId
}) {
  const collabPct = getCollabPct(collabRevenue, revenue)
  const index = calcIndex(revenue, csat, mejEngagement, collabPct)
  const annulled = csat === 0 && revenue > 0

  // Cluster bruto pelo índice, depois limitado pela regra de movimentação.
  const rawIdx = getClusterIndex(getClusterByIndex(index).id)
  const currentIdx = getClusterIndex(currentCluster)
  const effIdx = applyMovementRule(rawIdx, currentIdx)
  const cluster = CLUSTERS[effIdx]
  // A regra segurou a EJ abaixo do que o índice permitiria?
  const capped = rawIdx > effIdx

  return (
    <aside className="ob-preview">
      <div className="ob-preview-title">{title}</div>
      <div className={`ob-preview-index ${annulled ? 'annulled' : ''}`}>{fmtIndex(index)}</div>
      <div className="ob-preview-cluster">
        <span className={`cluster-badge ${cluster.id}`}>{cluster.label}</span>
      </div>

      {annulled && (
        <div className="ob-preview-note danger">
          CSAT zerado anula o índice. Cluster não reflete a realidade.
        </div>
      )}

      {capped && !annulled && (
        <div className="ob-preview-note warn">
          <IconInfo width={13} height={13} /> Limite de {MAX_CLUSTER_MOVEMENT} cluster por avaliação, o índice
          daria mais, mas a subida é gradual.
        </div>
      )}
    </aside>
  )
}

const HINTS: Partial<Record<keyof CompanyData, string>> = {
  revenue: 'Faturamento bruto acumulado no período avaliado.',
  csat: 'Média das avaliações de satisfação dos clientes (0 a 5).',
  mejEngagement: '% de membros ativos no Movimento Empresa Júnior.',
  collabRevenue: 'Parte do faturamento vinda de projetos em parceria (collab).',
}

export default function Onboarding({ initial, onComplete }: Props) {
  const [form, setForm] = useState<CompanyData>(initial ?? BLANK)
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyData, string>>>({})
  const [step, setStep] = useState(1)

  // Momento em que a etapa de metas foi aberta. Serve de guarda contra
  // ativação dupla (Enter segurado / duplo-clique) que concluiria o wizard
  // logo ao chegar nas metas, dando a impressão de que a etapa foi pulada.
  const step3At = useRef(0)

  function set<K extends keyof CompanyData>(key: K, value: CompanyData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function computeErrors(f: CompanyData): Partial<Record<keyof CompanyData, string>> {
    const errs: Partial<Record<keyof CompanyData, string>> = {}
    if (!f.companyName.trim()) errs.companyName = 'Informe o nome da empresa'
    if (f.revenue <= 0) errs.revenue = 'Deve ser maior que 0'
    if (f.csat < CSAT_MIN || f.csat > CSAT_MAX) errs.csat = `Entre ${CSAT_MIN},0 e ${CSAT_MAX},0`
    if (f.mejEngagement < 0 || f.mejEngagement > 100) errs.mejEngagement = 'Entre 0 e 100%'
    if (f.collabRevenue < 0) errs.collabRevenue = 'Deve ser ≥ 0'
    if (f.collabRevenue > f.revenue && f.revenue > 0)
      errs.collabRevenue = 'Não pode exceder o faturamento total'
    if (f.targetRevenue <= 0) errs.targetRevenue = 'Deve ser maior que 0'
    if (f.targetCsat <= CSAT_MIN || f.targetCsat > CSAT_MAX)
      errs.targetCsat = `Entre 0,1 e ${CSAT_MAX},0`
    if (f.targetMejEngagement < 0 || f.targetMejEngagement > 100)
      errs.targetMejEngagement = 'Entre 0 e 100%'
    if (f.targetCollabRevenue < 0) errs.targetCollabRevenue = 'Deve ser ≥ 0'
    return errs
  }

  /** Valida só as chaves da etapa atual e devolve se está tudo certo. */
  function validateStep(s: number): boolean {
    const all = computeErrors(form)
    const scoped: Partial<Record<keyof CompanyData, string>> = {}
    for (const key of STEP_FIELDS[s]) if (all[key]) scoped[key] = all[key]
    setErrors((prev) => ({ ...prev, ...Object.fromEntries(STEP_FIELDS[s].map((k) => [k, scoped[k]])) }))
    return Object.keys(scoped).length === 0
  }

  function goNext() {
    if (!validateStep(step)) return
    if (step === 2) step3At.current = Date.now() // marca a chegada nas metas
    setStep((s) => Math.min(s + 1, 3))
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1))
  }

  /** Conclusão do wizard — só a partir da etapa de metas e por ação deliberada. */
  function handleFinish() {
    // Ignora ativação acidental logo ao abrir as metas (Enter segurado / duplo-clique).
    if (Date.now() - step3At.current < 400) return

    const all = computeErrors(form)
    if (Object.keys(all).length > 0) {
      setErrors(all)
      // Leva a pessoa de volta à primeira etapa com erro.
      for (const s of [1, 2, 3]) {
        if (STEP_FIELDS[s].some((k) => all[k])) {
          setStep(s)
          break
        }
      }
      return
    }
    onComplete(form)
  }

  // Ação do botão primário / Enter. NUNCA conclui direto: nas etapas iniciais
  // avança; na etapa de metas delega ao handleFinish (que tem a guarda de tempo).
  function handlePrimary() {
    if (step < 3) goNext()
    else handleFinish()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handlePrimary()
  }

  function errorSpan(key: keyof CompanyData) {
    if (!errors[key]) return null
    return <span className="ob-error">{errors[key]}</span>
  }

  function numField(
    key: keyof CompanyData,
    label: string,
    opts: { placeholder?: string; step?: number; prefix?: string; suffix?: string } = {},
  ) {
    return (
      <div className="ob-field">
        <label className="ob-label">{label}</label>
        <NumInput
          numValue={form[key] as number}
          onNumChange={(v) => set(key, v as CompanyData[typeof key])}
          placeholder={opts.placeholder}
          step={opts.step}
          prefix={opts.prefix}
          suffix={opts.suffix}
        />
        {HINTS[key] && (
          <span className="ob-hint">
            <IconInfo width={12} height={12} /> {HINTS[key]}
          </span>
        )}
        {errorSpan(key)}
      </div>
    )
  }

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="ob-wrap">
      <div className="ob-card">
        <div className="ob-header">
          <div className="ob-logo">SerJunior</div>
          <p className="ob-subtitle">Dashboard de Acompanhamento de Cluster</p>
        </div>

        {/* Stepper */}
        <div className="ob-stepper">
          <div className="ob-stepper-line">
            <div className="ob-stepper-line-fill" style={{ width: `${progressPct}%` }} />
          </div>
          {STEPS.map(({ n, label, Icon }) => {
            const state = step === n ? 'active' : step > n ? 'done' : ''
            return (
              <button
                key={n}
                type="button"
                className={`ob-step ${state}`}
                onClick={() => step > n && setStep(n)}
                disabled={step < n}
              >
                <span className="ob-step-dot">
                  {step > n ? <IconCheck width={16} height={16} /> : <Icon width={16} height={16} />}
                </span>
                <span className="ob-step-label">{label}</span>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Etapa 1: Identificação ── */}
          {step === 1 && (
            <div className="ob-step-body">
              <p className="ob-step-heading">Vamos identificar sua empresa</p>
              <p className="ob-step-desc">
                Comece pelo básico: o nome da EJ e em qual cluster da Brasil Júnior ela está hoje.
              </p>
              <div className="ob-grid">
                <div className="ob-field full">
                  <label className="ob-label">Nome da empresa</label>
                  <div className="ob-input-wrap">
                    <input
                      className="ob-input"
                      type="text"
                      placeholder="Ex.: EJ Soluções"
                      value={form.companyName}
                      onChange={(e) => set('companyName', e.target.value)}
                      autoFocus
                    />
                  </div>
                  {errorSpan('companyName')}
                </div>

                <div className="ob-field full">
                  <label className="ob-label">Cluster atual</label>
                  <select
                    className="ob-select"
                    value={form.currentCluster}
                    onChange={(e) => set('currentCluster', e.target.value as ClusterId)}
                  >
                    {CLUSTERS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <span className="ob-hint">
                    <IconInfo width={12} height={12} /> O cluster onde a EJ foi classificada na última avaliação.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Etapa 2: Indicadores atuais ── */}
          {step === 2 && (
            <div className="ob-step-body">
              <p className="ob-step-heading">Indicadores atuais</p>
              <p className="ob-step-desc">
                Preencha os números do período. O índice e o cluster são calculados ao vivo à direita.
              </p>

              {form.csat === 0 && form.revenue > 0 && (
                <div className="ob-inline-alert danger">
                  <IconAlertTriangle width={16} height={16} />
                  <span>
                    <strong>CSAT zerado anula toda a pontuação.</strong> É o único indicador que zera o
                    índice — registre a satisfação dos clientes para o cálculo refletir a realidade.
                  </span>
                </div>
              )}

              <div className="ob-step-layout">
                <div className="ob-grid">
                  {numField('revenue', 'Faturamento atual', { placeholder: '50000', prefix: 'R$' })}
                  {numField('csat', 'CSAT atual', { placeholder: '4,5', step: 0.1, suffix: `/ ${CSAT_MAX}` })}
                  {numField('mejEngagement', 'Engajamento MEJ', { placeholder: '65', step: 0.1, suffix: '%' })}
                  {numField('collabRevenue', 'Faturamento collab', { placeholder: '10000', prefix: 'R$' })}
                </div>
                <IndexPreview
                  title="Índice atual"
                  revenue={form.revenue}
                  csat={form.csat}
                  mejEngagement={form.mejEngagement}
                  collabRevenue={form.collabRevenue}
                  currentCluster={form.currentCluster}
                />
              </div>
            </div>
          )}

          {/* ── Etapa 3: Metas ── */}
          {step === 3 && (
            <div className="ob-step-body">
              <p className="ob-step-heading">Metas do portal da Brasil Júnior</p>
              <p className="ob-step-desc">
                Transcreva as metas definidas para a sua EJ no portal da Brasil Júnior. O preview
                mostra a qual cluster essas metas correspondem.
              </p>

              <div className="ob-inline-alert info">
                <IconTarget width={16} height={16} />
                <span>
                  <strong>Estas são as metas oficiais da BJ, não metas internas.</strong> Use exatamente
                  os valores que aparecem no portal para o acompanhamento bater com a avaliação.
                </span>
              </div>

              <div className="ob-step-layout">
                <div className="ob-grid">
                  {numField('targetRevenue', 'Meta de faturamento', { placeholder: '100000', prefix: 'R$' })}
                  {numField('targetCsat', 'Meta de CSAT', { placeholder: '5,0', step: 0.1, suffix: `/ ${CSAT_MAX}` })}
                  {numField('targetMejEngagement', 'Meta de engajamento MEJ', { placeholder: '85', step: 0.1, suffix: '%' })}
                  {numField('targetCollabRevenue', 'Meta de faturamento collab', { placeholder: '25000', prefix: 'R$' })}
                </div>
                <IndexPreview
                  title="Índice com as metas"
                  revenue={form.targetRevenue}
                  csat={form.targetCsat}
                  mejEngagement={form.targetMejEngagement}
                  collabRevenue={form.targetCollabRevenue}
                  currentCluster={form.currentCluster}
                />
              </div>
            </div>
          )}

          {/* Footer / navegação */}
          <div className="ob-footer">
            <div className="ob-footer-left">
              {step > 1 && (
                <button type="button" className="db-btn db-btn-ghost" onClick={goBack}>
                  <IconChevronLeft width={16} height={16} /> Voltar
                </button>
              )}
              {initial && step === 1 && (
                <button type="button" className="db-btn db-btn-ghost" onClick={() => onComplete(initial)}>
                  Cancelar
                </button>
              )}
            </div>

            <button type="button" className="db-btn db-btn-primary" onClick={handlePrimary}>
              {step < 3 ? 'Continuar' : initial ? 'Salvar alterações' : 'Entrar no dashboard'}
              <IconChevronRight width={16} height={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
