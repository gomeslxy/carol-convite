import { useId, type CSSProperties, type SVGProps } from "react";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LACINHOS ACETINADOS DE FITA EM AZUL ROYAL & PRATA (SEM FLORES)
 *  Fitas com brilho cilíndrico 3D, dobras suaves e contorno prateado delicado.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type BowVariant = "royal" | "silver" | "duo";

const useSafeId = (prefix: string) => `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

interface RibbonPalette {
  loopStops: [string, string, string, string, string];
  cavityStops: [string, string];
  tailStops: [string, string, string, string];
  knotStops: [string, string, string];
  crease: string;
  specular: string;
}

const PALETTES: Record<BowVariant, RibbonPalette> = {
  royal: {
    loopStops: ["#93C5FD", "#3B82F6", "#1D4ED8", "#1E40AF", "#172554"],
    cavityStops: ["#090D16", "#172554"],
    tailStops: ["#1E40AF", "#60A5FA", "#1D4ED8", "#0F172A"],
    knotStops: ["#93C5FD", "#2563EB", "#1E3A8A"],
    crease: "#090D16",
    specular: "#EFF6FF",
  },
  silver: {
    loopStops: ["#FFFFFF", "#F8FAFC", "#CBD5E1", "#94A3B8", "#E2E8F0"],
    cavityStops: ["#475569", "#94A3B8"],
    tailStops: ["#E2E8F0", "#FFFFFF", "#94A3B8", "#CBD5E1"],
    knotStops: ["#FFFFFF", "#E2E8F0", "#94A3B8"],
    crease: "#475569",
    specular: "#FFFFFF",
  },
  duo: {
    loopStops: ["#60A5FA", "#2563EB", "#1D4ED8", "#1E40AF", "#172554"],
    cavityStops: ["#0F172A", "#172554"],
    tailStops: ["#1E3A8A", "#3B82F6", "#1E40AF", "#0F172A"],
    knotStops: ["#FFFFFF", "#E2E8F0", "#94A3B8"],
    crease: "#0F172A",
    specular: "#FFFFFF",
  },
};

export interface BowGlyphProps {
  variant: BowVariant;
  idPrefix: string;
}

export function BowGlyph({ variant, idPrefix }: BowGlyphProps) {
  const p = PALETTES[variant];
  const loopLId = `${idPrefix}-loop-l`;
  const loopRId = `${idPrefix}-loop-r`;
  const cavityId = `${idPrefix}-cavity`;
  const tailLId = `${idPrefix}-tail-l`;
  const tailRId = `${idPrefix}-tail-r`;
  const knotId = `${idPrefix}-knot`;
  const trimId = `${idPrefix}-trim`;
  const dropId = `${idPrefix}-drop`;

  return (
    <g>
      <defs>
        <linearGradient id={loopLId} x1="0%" y1="12%" x2="100%" y2="88%">
          <stop offset="0%" stopColor={p.loopStops[3]} />
          <stop offset="24%" stopColor={p.loopStops[0]} />
          <stop offset="50%" stopColor={p.loopStops[1]} />
          <stop offset="76%" stopColor={p.loopStops[2]} />
          <stop offset="100%" stopColor={p.loopStops[4]} />
        </linearGradient>

        <linearGradient id={loopRId} x1="100%" y1="12%" x2="0%" y2="88%">
          <stop offset="0%" stopColor={p.loopStops[3]} />
          <stop offset="24%" stopColor={p.loopStops[0]} />
          <stop offset="50%" stopColor={p.loopStops[1]} />
          <stop offset="76%" stopColor={p.loopStops[2]} />
          <stop offset="100%" stopColor={p.loopStops[4]} />
        </linearGradient>

        <linearGradient id={cavityId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={p.cavityStops[0]} />
          <stop offset="100%" stopColor={p.cavityStops[1]} />
        </linearGradient>

        <linearGradient id={tailLId} x1="65%" y1="0%" x2="18%" y2="100%">
          <stop offset="0%" stopColor={p.tailStops[3]} />
          <stop offset="28%" stopColor={p.tailStops[0]} />
          <stop offset="56%" stopColor={p.tailStops[1]} />
          <stop offset="100%" stopColor={p.tailStops[2]} />
        </linearGradient>

        <linearGradient id={tailRId} x1="35%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor={p.tailStops[3]} />
          <stop offset="28%" stopColor={p.tailStops[0]} />
          <stop offset="56%" stopColor={p.tailStops[1]} />
          <stop offset="100%" stopColor={p.tailStops[2]} />
        </linearGradient>

        <linearGradient id={knotId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.knotStops[0]} />
          <stop offset="48%" stopColor={p.knotStops[1]} />
          <stop offset="100%" stopColor={p.knotStops[2]} />
        </linearGradient>

        <linearGradient id={trimId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#CBD5E1" />
          <stop offset="75%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        <filter id={dropId} x="-18%" y="-18%" width="136%" height="142%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.2" floodColor="#090D16" floodOpacity="0.34" />
        </filter>
      </defs>

      <g filter={`url(#${dropId})`}>
        {/* Caudas pendentes */}
        <path
          d="M72 48 C59 66 42 84 22 109 L40 103 L47 118 C62 95 73 74 79 50 Z"
          fill={`url(#${tailLId})`}
          stroke={`url(#${trimId})`}
          strokeWidth="1.05"
          strokeLinejoin="round"
        />
        <path
          d="M88 48 C101 66 118 84 138 109 L120 103 L113 118 C98 95 87 74 81 50 Z"
          fill={`url(#${tailRId})`}
          stroke={`url(#${trimId})`}
          strokeWidth="1.05"
          strokeLinejoin="round"
        />

        {/* Cavidade interna das alças */}
        <path
          d="M75 41 C58 24 34 15 20 24 C15 28 16 35 24 39 C39 31 57 35 75 43 Z"
          fill={`url(#${cavityId})`}
        />
        <path
          d="M85 41 C102 24 126 15 140 24 C145 28 144 35 136 39 C121 31 103 35 85 43 Z"
          fill={`url(#${cavityId})`}
        />

        {/* Alças frontais acetinadas */}
        <path
          d="M77 43 C59 24 30 12 14 25 C3 33 6 52 20 59 C37 68 59 58 77 48 Z"
          fill={`url(#${loopLId})`}
          stroke={`url(#${trimId})`}
          strokeWidth="1.15"
          strokeLinejoin="round"
        />
        <path
          d="M83 43 C101 24 130 12 146 25 C157 33 154 52 140 59 C123 68 101 58 83 48 Z"
          fill={`url(#${loopRId})`}
          stroke={`url(#${trimId})`}
          strokeWidth="1.15"
          strokeLinejoin="round"
        />

        {/* Vincos de profundidade */}
        <path
          d="M74 44 C56 36 35 34 18 41 C35 42 55 44 74 46 Z"
          fill={p.crease}
          opacity="0.3"
        />
        <path
          d="M86 44 C104 36 125 34 142 41 C125 42 105 44 86 46 Z"
          fill={p.crease}
          opacity="0.3"
        />

        {/* Brilho especular */}
        <path
          d="M19 28 C33 19 55 28 71 41"
          fill="none"
          stroke={p.specular}
          strokeOpacity="0.85"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M141 28 C127 19 105 28 89 41"
          fill="none"
          stroke={p.specular}
          strokeOpacity="0.85"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Nó central */}
        <path
          d="M70 36 C75 33 85 33 90 36 C93 41 93 49 90 55 C85 58 75 58 70 55 C67 49 67 41 70 36 Z"
          fill={`url(#${knotId})`}
          stroke={`url(#${trimId})`}
          strokeWidth="1.2"
        />
      </g>
    </g>
  );
}

export interface BowProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  variant?: BowVariant;
  title?: string;
}

export function Bow({ variant = "royal", title, className, style, ...rest }: BowProps) {
  const id = useSafeId("bow");
  return (
    <svg
      viewBox="0 0 160 126"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <BowGlyph variant={variant} idPrefix={id} />
    </svg>
  );
}

export interface CornerBowClusterProps {
  className?: string;
  style?: CSSProperties;
  corner?: "top-left" | "top-right" | "bottom-right" | "bottom-left";
}

export function CornerBowCluster(_props: CornerBowClusterProps) {
  return null;
}

export interface SeamBowGarlandProps {
  className?: string;
  style?: CSSProperties;
  position: "top" | "bottom";
}

export function SeamBowGarland(_props: SeamBowGarlandProps) {
  return null;
}

export interface EdgeBowAccentProps {
  className?: string;
  style?: CSSProperties;
  side?: "left" | "right";
  variant?: BowVariant;
}

export function EdgeBowAccent(_props: EdgeBowAccentProps) {
  return null;
}

export interface FiligreeCornerProps {
  className?: string;
  style?: CSSProperties;
  corner?: "top-right" | "bottom-left" | "top-left" | "bottom-right";
}

export function FiligreeCorner(_props: FiligreeCornerProps) {
  return null;
}

export const CornerRibbon = CornerBowCluster;
