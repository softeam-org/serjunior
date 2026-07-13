/**
 * Ícones do Lucide (https://lucide.dev) embutidos como SVG inline.
 *
 * Usamos os paths oficiais do Lucide (licença ISC/MIT) em vez do pacote
 * `lucide-react` para não adicionar dependência. O visual é idêntico ao da
 * biblioteca. Para adicionar um ícone novo, copie os elementos internos do
 * SVG correspondente em lucide.dev e crie um componente usando <Base>.
 */

import type { SVGProps } from 'react'

function Base({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

/** Lucide: target */
export function IconTarget(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </Base>
  )
}

/** Lucide: rocket */
export function IconRocket(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </Base>
  )
}

/** Lucide: handshake */
export function IconHandshake(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </Base>
  )
}

/** Lucide: arrow-up-right */
export function IconArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </Base>
  )
}

/** Lucide: map-pin */
export function IconMapPin(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </Base>
  )
}

/** Lucide: chevron-left */
export function IconChevronLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="m15 18-6-6 6-6" />
    </Base>
  )
}

/** Lucide: chevron-right */
export function IconChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="m9 18 6-6-6-6" />
    </Base>
  )
}

/** Lucide: check */
export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Base>
  )
}

/** Lucide: building-2 */
export function IconBuilding(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
    </Base>
  )
}

/** Lucide: gauge */
export function IconGauge(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </Base>
  )
}

/** Lucide: info */
export function IconInfo(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </Base>
  )
}

/** Lucide: alert-triangle */
export function IconAlertTriangle(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4M12 17h.01" />
    </Base>
  )
}

/** Lucide: trending-up */
export function IconTrendingUp(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M16 7h6v6" />
      <path d="m22 7-8.5 8.5-5-5L2 17" />
    </Base>
  )
}
