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
    id: 'ej-exemplo-1',
    name: 'EJ Exemplo Um',
    city: 'Aracaju — UFS',
    website: 'https://exemplo1.com.br',
    services: 'Websites, sistemas e manutenção de software.',
    // logo: '/logos/ej-exemplo-1.png',
  },
  {
    id: 'ej-exemplo-2',
    name: 'EJ Exemplo Dois',
    city: 'São Cristóvão — UFS',
    website: 'https://exemplo2.com.br',
    services: 'Consultoria em engenharia e projetos estruturais.',
    // logo: '/logos/ej-exemplo-2.png',
  },
  {
    id: 'ej-exemplo-3',
    name: 'EJ Exemplo Três',
    city: 'Aracaju — Unit',
    website: 'https://exemplo3.com.br',
    services: 'Identidade visual, design gráfico e social media.',
    // logo: '/logos/ej-exemplo-3.png',
  },
  {
    id: 'ej-exemplo-4',
    name: 'EJ Exemplo Quatro',
    city: 'Lagarto — UFS',
    website: 'https://exemplo4.com.br',
    services: 'Planejamento financeiro e consultoria empresarial.',
    // logo: '/logos/ej-exemplo-4.png',
  },
  {
    id: 'ej-exemplo-5',
    name: 'EJ Exemplo Cinco',
    city: 'Itabaiana — UFS',
    website: 'https://exemplo5.com.br',
    services: 'Marketing digital, tráfego pago e branding.',
    // logo: '/logos/ej-exemplo-5.png',
  },
  {
    id: 'ej-exemplo-6',
    name: 'EJ Exemplo Seis',
    city: 'Aracaju — IFS',
    website: 'https://exemplo6.com.br',
    services: 'Automação, eletrônica e soluções de IoT.',
    // logo: '/logos/ej-exemplo-6.png',
  },
]

/**
 * ⚠️ DADOS PLACEHOLDER — números de impacto exibidos na landing page.
 * Ajuste os valores reais da federação aqui.
 */
export const IMPACTO: { value: string; label: string }[] = [
  { value: '+15', label: 'Empresas Juniores' },
  { value: '+500', label: 'Empreendedores' },
  { value: '+1000', label: 'Projetos realizados' },
  { value: '8', label: 'Cidades atendidas' },
]
