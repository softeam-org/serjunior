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
