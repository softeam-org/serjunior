import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode, type RefObject, type SVGProps } from 'react'
import { Link } from 'react-router-dom'
import { EJS, IMPACTO, type EJ } from '../config/ejs'
import {
  IconArrowUpRight,
  IconHandshake,
  IconMapPin,
  IconRocket,
  IconTarget,
} from '../components/icons'
import SiteHeader from '../components/SiteHeader'
import '../styles/landing.css'

/* ─── Hooks de animação ──────────────────────────────────────────────────────── */

/** Retorna [ref, inView] — inView vira true quando o elemento aparece na viewport. */
function useInView<T extends HTMLElement>(): [RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

/** Envolve conteúdo com um fade + slide-up disparado ao entrar na tela. */
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/** Anima um número de 0 até o alvo quando entra na tela. Preserva prefixo/sufixo (ex.: "+1000"). */
function CountUp({ value }: { value: string }) {
  // Parse feito uma única vez por valor — evita recriar o objeto a cada render
  // (o que reiniciava a animação em loop).
  const parsed = useMemo(() => {
    const m = value.match(/^(\D*)(\d+)(\D*)$/)
    return m
      ? { prefix: m[1], target: parseInt(m[2], 10), suffix: m[3], hasNumber: true }
      : { prefix: '', target: 0, suffix: '', hasNumber: false }
  }, [value])

  const [ref, inView] = useInView<HTMLSpanElement>()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView || !parsed.hasNumber) return
    let raf = 0
    const start = performance.now()
    const duration = 1500
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      setN(Math.round(eased * parsed.target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, parsed.hasNumber, parsed.target])

  if (!parsed.hasNumber) return <span ref={ref}>{value}</span>
  return (
    <span ref={ref}>
      {parsed.prefix}
      {n}
      {parsed.suffix}
    </span>
  )
}

/* ─── Cards ──────────────────────────────────────────────────────────────────── */

/** Iniciais usadas como fallback quando a EJ ainda não tem logo. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => !['de', 'da', 'do', 'e'].includes(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function EJCard({ ej }: { ej: EJ }) {
  return (
    <a
      className="ej-card"
      href={ej.website}
      target="_blank"
      rel="noopener noreferrer"
      title={`Visitar ${ej.name}`}
    >
      <div className="ej-card-banner" aria-hidden="true" />
      <div className="ej-card-body">
        <div className="ej-card-logo">
          {ej.logo ? (
            <img src={`${import.meta.env.BASE_URL}${ej.logo.replace(/^\//, '')}`} alt={`Logo da ${ej.name}`} />
          ) : (
            <span className="ej-card-initials">{initials(ej.name)}</span>
          )}
        </div>
        <span className="ej-card-name">{ej.name}</span>
        <span className="ej-card-city">
          <IconMapPin className="ej-card-pin" width={14} height={14} />
          {ej.city}
        </span>
        <p className="ej-card-services">{ej.services}</p>
        <span className="ej-card-visit">
          Ver portfólio
          <IconArrowUpRight className="ej-card-arrow" width={16} height={16} />
        </span>
      </div>
    </a>
  )
}

/* ─── Página ─────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="landing">
      <SiteHeader />

      <main className="landing-main" id="top">
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section className="landing-hero">
          <div className="hero-blob hero-blob-green" aria-hidden="true" />
          <div className="hero-blob hero-blob-yellow" aria-hidden="true" />
          <div className="hero-blob hero-blob-blue" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />

          <div className="landing-hero-content">
            <h1 className="landing-hero-title">
              Fortalecendo o movimento{' '}
              <span className="landing-hero-gradient">empresa júnior</span> em Sergipe
            </h1>
            <p className="landing-hero-subtitle">
              A SERJÚNIOR conecta, representa e desenvolve as empresas juniores do estado,
              formando líderes e gerando impacto real para a sociedade sergipana.
            </p>
            <div className="landing-hero-actions">
              <a href="#ejs" className="btn btn-primary">Conheça as EJs</a>
              <a href="#sobre" className="btn btn-secondary">Saiba mais</a>
            </div>
          </div>

          <a href="#sobre" className="hero-scroll" aria-label="Rolar para baixo">
            <span className="hero-scroll-mouse"><span className="hero-scroll-wheel" /></span>
          </a>
        </section>

        {/* ─── Sobre ────────────────────────────────────────────────────── */}
        <section id="sobre" className="landing-section landing-about">
          <Reveal>
            <h2 className="landing-section-title">Sobre a federação</h2>
            <p className="landing-section-lead">
              Somos a federação que une as empresas juniores de Sergipe em torno de um
              propósito comum: transformar estudantes em empreendedores capazes de mudar o país.
            </p>
          </Reveal>
          <div className="landing-about-grid">
            {(
              [
                {
                  Icon: IconTarget,
                  title: 'Missão',
                  text: 'Representar e potencializar as empresas juniores de Sergipe, promovendo desenvolvimento, integração e resultados de alto impacto.',
                },
                {
                  Icon: IconRocket,
                  title: 'Visão',
                  text: 'Ser referência nacional em desenvolvimento do Movimento Empresa Júnior, com uma rede forte, madura e reconhecida.',
                },
                {
                  Icon: IconHandshake,
                  title: 'Valores',
                  text: 'Protagonismo estudantil, colaboração em rede, ética, resultados e compromisso com o desenvolvimento de Sergipe.',
                },
              ] as { Icon: ComponentType<SVGProps<SVGSVGElement>>; title: string; text: string }[]
            ).map((card, i) => (
              <Reveal key={card.title} delay={i * 120} className="landing-about-card">
                <card.Icon className="landing-about-glyph" />
                <span className="landing-about-icon">
                  <card.Icon width={26} height={26} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── Números / Impacto ────────────────────────────────────────── */}
        <section className="landing-impact">
          <div className="landing-impact-inner">
            {IMPACTO.map((item, i) => (
              <Reveal key={item.label} delay={i * 100} className="landing-impact-item">
                <span className="landing-impact-value">
                  <CountUp value={item.value} />
                </span>
                <span className="landing-impact-label">{item.label}</span>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── Portfólio das EJs ────────────────────────────────────────── */}
        <section id="ejs" className="landing-section">
          <Reveal>
            <h2 className="landing-section-title">Empresas Juniores da rede</h2>
            <p className="landing-section-lead">
              Conheça as EJs que fazem parte da SERJÚNIOR. Clique em uma delas para
              visitar seu site e portfólio.
            </p>
          </Reveal>
          <div className="ej-grid">
            {EJS.sort((a, b) => a.name.localeCompare(b.name)).map((ej, i) => (
              <Reveal key={ej.id} delay={(i % 3) * 100} className="ej-card-wrap">
                <EJCard ej={ej} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── Contato ──────────────────────────────────────────────────── */}
        <section id="contato" className="landing-contact">
          <div className="landing-contact-inner">
            <Reveal>
              <h2 className="landing-section-title">Vamos conversar?</h2>
              <p className="landing-section-lead">
                Sua EJ quer fazer parte da rede ou quer contratar um projeto? Fale com a gente.
              </p>
              <div className="landing-contact-actions">
                <a href="mailto:contato@serjunior.com.br" className="btn btn-primary">
                  contato@serjunior.com.br
                </a>
              </div>
              <div className="landing-social">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span className="landing-footer-brand">SERJÚNIOR</span>
          <div className="landing-footer-links">
            <Link to="/wiki">Wiki</Link>
            <Link to="/dashboard">Dashboard de Cluster</Link>
            <a href="#ejs">EJs</a>
            <a href="#contato">Contato</a>
          </div>
          <span className="landing-footer-copy">
            &copy; {new Date().getFullYear()} SERJÚNIOR — Federação Sergipana de Empresas Juniores
          </span>
        </div>
      </footer>
    </div>
  )
}
