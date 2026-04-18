/**
 * Configuração do triênio estratégico da SerJunior.
 *
 * Este arquivo concentra todas as regras de negócio que mudam a cada ciclo do
 * planejamento estratégico. Qualquer alteração aqui requer um novo deploy.
 *
 * Triênio atual: 2022–2025
 */

export const TRIENIO = {
  /** Identificação do ciclo — aparece como referência em mensagens de erro/suporte. */
  cycle: '2022–2025',

  // ─── Clusters ─────────────────────────────────────────────────────────────
  /**
   * Definição de cada cluster: identificador interno, nome exibido, faixa de índice
   * e cor visual. Os clusters devem estar em ordem crescente de índice.
   *
   * Fórmula do índice (implementada em src/utils/cluster.ts → calcIndex):
   *   índice = faturamento × CSAT × (1 + %engajamentoMEJ / 100) × (1 + %collab / 100) × 100
   *
   * O maxIndex do último cluster é sempre Infinity.
   */
  clusters: [
    { id: 'C1', label: 'Cluster 1', minIndex: 0,              maxIndex: 12_000_000,  color: '#2563eb' },
    { id: 'C2', label: 'Cluster 2', minIndex: 12_000_000.01,  maxIndex: 24_000_000,  color: '#059669' },
    { id: 'C3', label: 'Cluster 3', minIndex: 24_000_000.01,  maxIndex: 61_000_000,  color: '#d97706' },
    { id: 'C4', label: 'Cluster 4', minIndex: 61_000_000.01,  maxIndex: 130_000_000, color: '#ea580c' },
    { id: 'C5', label: 'Cluster 5', minIndex: 130_000_000.01, maxIndex: Infinity,    color: '#7c3aed' },
  ],

  // ─── Regra de movimentação ────────────────────────────────────────────────
  /**
   * Quantos clusters uma empresa pode subir ou cair em uma única avaliação.
   * No triênio atual: 1 (só pode mover ±1 cluster por ciclo de avaliação).
   * Se a regra mudar para ±2 no próximo triênio, basta alterar este valor.
   */
  maxClusterMovement: 1,

  // ─── CSAT ─────────────────────────────────────────────────────────────────
  csat: {
    /** Valor mínimo possível do CSAT. */
    min: 0,
    /** Valor máximo possível do CSAT. */
    max: 5,
    /**
     * Quando true, CSAT = 0 anula completamente o índice, independentemente
     * dos outros indicadores. Regra vigente no triênio atual.
     */
    zeroAnnulsIndex: true,
    /**
     * Níveis de CSAT usados na tabela de projeção (aba "O que falta?").
     * Altere para mudar a granularidade ou o intervalo exibido.
     */
    projectionLevels: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
  },

  // ─── Simulação ─────────────────────────────────────────────────────────────
  /**
   * Limites dos controles de simulação (aba "Simular projetos").
   * São tetos dos sliders — não representam regras de negócio, apenas ajudam
   * a calibrar o intervalo útil para as empresas do triênio.
   */
  simulation: {
    maxProjects:  200,
    maxAvgTicket: 100_000,
  },
} as const

// ─── Tipos derivados do config ────────────────────────────────────────────────
export type ClusterConfig = typeof TRIENIO.clusters[number]
export type ClusterId = ClusterConfig['id']
