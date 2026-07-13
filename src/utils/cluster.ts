import { TRIENIO, type ClusterId } from '../config/trienio'

export type { ClusterId }

export interface Cluster {
  id: ClusterId
  label: string
  min: number
  max: number
  color: string
}

export interface CompanyData {
  companyName: string
  currentCluster: ClusterId
  revenue: number
  csat: number
  mejEngagement: number
  collabRevenue: number
  targetRevenue: number
  targetCsat: number
  targetMejEngagement: number
  targetCollabRevenue: number
}

// Derivados do config — fonte única de verdade
export const CLUSTERS: Cluster[] = TRIENIO.clusters.map((c) => ({
  id: c.id,
  label: c.label,
  min: c.minIndex,
  max: c.maxIndex,
  color: c.color,
}))

export const CSAT_LEVELS: number[] = [...TRIENIO.csat.projectionLevels]
export const MAX_CLUSTER_MOVEMENT: number = TRIENIO.maxClusterMovement
export const CSAT_MAX: number = TRIENIO.csat.max
export const CSAT_MIN: number = TRIENIO.csat.min

export function calcIndex(
  revenue: number,
  csat: number,
  mejEng: number,
  collabPct: number,
): number {
  if (TRIENIO.csat.zeroAnnulsIndex && csat === 0) return 0
  if (revenue <= 0) return 0
  return revenue * csat * (1 + mejEng / 100) * (1 + collabPct / 100) * 100
}

export function getClusterByIndex(index: number): Cluster {
  if (index <= 0) return CLUSTERS[0]
  for (let i = CLUSTERS.length - 1; i >= 0; i--) {
    if (index >= CLUSTERS[i].min) return CLUSTERS[i]
  }
  return CLUSTERS[0]
}

export function getClusterById(id: ClusterId): Cluster {
  return CLUSTERS.find((c) => c.id === id)!
}

export function getClusterIndex(id: ClusterId): number {
  return CLUSTERS.findIndex((c) => c.id === id)
}

/** Retorna [cluster abaixo | null, cluster atual, cluster acima | null] */
export function getPossibleOutcomes(currentId: ClusterId): Array<Cluster | null> {
  const idx = getClusterIndex(currentId)
  const move = MAX_CLUSTER_MOVEMENT
  return [
    idx - move >= 0 ? CLUSTERS[idx - move] : null,
    CLUSTERS[idx],
    idx + move < CLUSTERS.length ? CLUSTERS[idx + move] : null,
  ]
}

/**
 * Aplica a regra de movimentação máxima por avaliação.
 * Se o índice qualificaria para um cluster além do permitido, retorna o cluster
 * mais extremo ainda dentro do limite.
 */
export function applyMovementRule(rawClusterIdx: number, currentClusterIdx: number): number {
  const move = MAX_CLUSTER_MOVEMENT
  return Math.max(
    Math.max(0, currentClusterIdx - move),
    Math.min(Math.min(CLUSTERS.length - 1, currentClusterIdx + move), rawClusterIdx),
  )
}

export function getCollabPct(collabRevenue: number, totalRevenue: number): number {
  if (totalRevenue <= 0) return 0
  return (collabRevenue / totalRevenue) * 100
}

/**
 * Faturamento mínimo para atingir um limiar de índice.
 * Derivado de: índice = csat*(1+eng/100)*100*(revenue + collabRev)
 */
export function minRevenueForThreshold(
  threshold: number,
  csat: number,
  mejEng: number,
  collabRev: number,
): number {
  if (csat <= 0) return Infinity
  const divisor = csat * (1 + mejEng / 100) * 100
  return Math.max(0, threshold / divisor - collabRev)
}

export interface FloorValues {
  minRevenue: number | null
  minCsat: number | null
  minMejEngagement: number | null
  minCollabRevenue: number | null
}

/**
 * Valor mínimo que cada variável isoladamente poderia ter — mantendo as outras
 * três no valor atual — para que o índice ainda atinja `targetIndex`.
 * `null` significa que nenhum valor dentro dos limites da variável alcançaria
 * o alvo sozinho (ex.: precisaria de CSAT > 5 ou engajamento > 100%).
 */
export function getFloorValues(data: CompanyData, targetIndex: number): FloorValues {
  const { revenue, csat, mejEngagement, collabRevenue } = data
  const baseMultiplier = (c: number, m: number) => c * (1 + m / 100) * 100

  const revDenominator = baseMultiplier(csat, mejEngagement)
  const minRevenue = revDenominator > 0 ? Math.max(0, targetIndex / revDenominator - collabRevenue) : null

  const csatDenominator = (revenue + collabRevenue) * (1 + mejEngagement / 100) * 100
  const rawMinCsat = csatDenominator > 0 ? targetIndex / csatDenominator : null
  const minCsat = rawMinCsat !== null && rawMinCsat <= CSAT_MAX ? Math.max(CSAT_MIN, rawMinCsat) : null

  const mejDenominator = csat * (revenue + collabRevenue) * 100
  const rawMinMej = mejDenominator > 0 ? (targetIndex / mejDenominator - 1) * 100 : null
  const minMejEngagement = rawMinMej !== null && rawMinMej <= 100 ? Math.max(0, rawMinMej) : null

  const collabDenominator = baseMultiplier(csat, mejEngagement)
  const rawMinCollab = collabDenominator > 0 ? targetIndex / collabDenominator - revenue : null
  const minCollabRevenue = rawMinCollab !== null && rawMinCollab <= revenue ? Math.max(0, rawMinCollab) : null

  return { minRevenue, minCsat, minMejEngagement, minCollabRevenue }
}

export interface CsatSafetyMargin {
  current: number
  /** Menor CSAT que ainda mantém o cluster atual, com faturamento/engajamento/collab no valor de hoje. `null` = nenhum CSAT dentro de [0,5] sustentaria o cluster. */
  floor: number | null
  /** current - floor. Negativo = o CSAT de hoje já está abaixo do piso. */
  buffer: number | null
  bufferPct: number | null
}

/**
 * Margem de segurança do CSAT: é o único indicador que pode efetivamente cair
 * de uma avaliação para a outra (é uma média de satisfação, não um acumulado
 * como faturamento, faturamento collab ou engajamento MEJ, que só tendem a
 * subir ao longo do ciclo). Calcula quanto o CSAT pode cair — mantendo os
 * demais indicadores no valor atual — antes da empresa cair para o cluster
 * abaixo. `floorIndex` normalmente é o piso do cluster atual (`currentCluster.min`).
 */
export function getCsatSafetyMargin(data: CompanyData, floorIndex: number): CsatSafetyMargin {
  const { minCsat } = getFloorValues(data, floorIndex)
  if (minCsat === null) return { current: data.csat, floor: null, buffer: null, bufferPct: null }
  const buffer = data.csat - minCsat
  const bufferPct = data.csat > 0 ? (buffer / data.csat) * 100 : 0
  return { current: data.csat, floor: minCsat, buffer, bufferPct }
}

export const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
})

export function fmtIndex(v: number): string {
  if (!isFinite(v)) return '∞'
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v)
}

export function fmtPct(v: number, dec = 1): string {
  return `${v.toFixed(dec)}%`
}

export type PacingStatus = 'ahead' | 'onTrack' | 'behind'

export interface YearPacing {
  /** Fração do ano civil já decorrida, 0–1. */
  fracElapsed: number
  daysRemaining: number
  expectedRevenue: number
  expectedCollabRevenue: number
  /** Faturamento atual / meta, em %. */
  revenuePct: number
  /** Faturamento collab atual / meta, em %. */
  collabPct: number
  status: PacingStatus
}

const PACING_TOLERANCE_PP = 5

/**
 * Compara o quanto do ano civil já passou com o quanto das metas de
 * faturamento (cumulativas — só tendem a subir ao longo do ciclo) já foi
 * atingido, assumindo um ritmo linear ao longo do ano até a avaliação de
 * fim de ano (31/12).
 */
export function getYearPacing(data: CompanyData, today: Date = new Date()): YearPacing {
  const year = today.getFullYear()
  const yearStart = new Date(year, 0, 1).getTime()
  const yearEnd = new Date(year, 11, 31).getTime()
  const totalMs = yearEnd - yearStart
  const fracElapsed = Math.min(1, Math.max(0, (today.getTime() - yearStart) / totalMs))
  const daysRemaining = Math.max(0, Math.ceil((yearEnd - today.getTime()) / 86_400_000))

  const expectedRevenue = data.targetRevenue * fracElapsed
  const expectedCollabRevenue = data.targetCollabRevenue * fracElapsed

  const revenuePct = data.targetRevenue > 0 ? (data.revenue / data.targetRevenue) * 100 : 100
  const collabPct = data.targetCollabRevenue > 0 ? (data.collabRevenue / data.targetCollabRevenue) * 100 : 100

  const diff = revenuePct - fracElapsed * 100
  const status: PacingStatus =
    diff >= PACING_TOLERANCE_PP ? 'ahead' : diff <= -PACING_TOLERANCE_PP ? 'behind' : 'onTrack'

  return { fracElapsed, daysRemaining, expectedRevenue, expectedCollabRevenue, revenuePct, collabPct, status }
}

export const STORAGE_KEY = 'serjunior_company_v1'

export function saveData(data: CompanyData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function loadData(): CompanyData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CompanyData) : null
  } catch {
    return null
  }
}
