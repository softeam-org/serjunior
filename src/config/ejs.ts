/**
 * Portfólio das Empresas Juniores (EJs) da rede SERJÚNIOR.
 *
 * Cada item vira um card clicável na landing page. Para popular com os dados
 * reais, basta editar o array `EJS` abaixo — nenhuma outra alteração é
 * necessária.
 *
 * Logos:
 *   • Coloque os arquivos em `public/logos/` (crie a pasta se não existir).
 *   • Referencie pelo caminho absoluto a partir da raiz pública, ex.: '/logos/nome.png'.
 *   • Enquanto não houver logo, deixe `logo` como `undefined` — o card exibe
 *     automaticamente as iniciais da EJ como fallback.
 */

export interface EJ {
  /** Identificador único e estável (usado como key da lista). */
  id: string
  /** Nome da empresa júnior exibido no card. */
  name: string
  /** Cidade / instituição de origem. */
  city: string
  /** URL do site ou portfólio da EJ (o card inteiro linka para cá). */
  website: string
  /** Texto curto com os principais serviços, ex.: 'Websites, sistemas e manutenção de software'. */
  services: string
  /** Caminho do logo em public/, ex.: '/logos/minha-ej.png'. Opcional. */
  logo?: string
}

/**
 * ⚠️ DADOS PLACEHOLDER — substitua pelos dados reais das EJs da rede.
 * Adicione ou remova itens livremente.
 */
export const EJS: EJ[] = [
  {
    id: 'softeam',
    name: 'Softeam',
    city: 'Aracaju - UFS',
    website: 'https://softeam.com.br',
    services: 'Websites, sistemas e manutenção de software.',
    logo: '/logos/softeam.png',
  }
]

export const IMPACTO: { value: string; label: string }[] = [
  { value: '+15', label: 'Empresas Juniores' },
  { value: '+500', label: 'Empreendedores' },
  { value: '+1000', label: 'Projetos realizados' },
  { value: '8', label: 'Cidades atendidas' },
]
