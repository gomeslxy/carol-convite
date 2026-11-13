import { memo, useId, type SVGProps } from "react";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LACINHOS ACETINADOS DE ALTA-COSTURA EM AZUL ROYAL & PRATA (ZERO FLORES)
 *  Fitas esculpidas com 6 stops cilíndricos, sombras de oclusão sobre as caudas,
 *  pregas convergentes ao nó abobadado e acabamento em V (swallowtail).
 *  Sem filtros SVG pesados (<feDropShadow>) para 60fps e nitidez Retina no Safari/iOS.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type BowVariant = "royal" | "silver" | "duo";

interface RibbonPalette {
  loopStops: [string, string, string, string, string, string];
  cavityStops: [string, string, string];
  tailStops: [string, string, string, string, string];
  knotStops: [string, string, string, string];
  crease: string;
  creaseSoft: string;
  specular: string;
  rimLight: string;
  tailShadow: string;
}

const PALETTES: Record<BowVariant, RibbonPalette> = {
  royal: {
    loopStops: ["#1E3A8A", "#93C5FD", "#60A5FA", "#2563EB", "#1D4ED8", "#0F172A"],
    cavityStops: ["#060911", "#0F172A", "#1E3A8A"],
    tailStops: ["#0F172A", "#1E3A8A", "#60A5FA", "#2563EB", "#172554"],
    knotStops: ["#BFDBFE", "#60A5FA", "#1D4ED8", "#0F172A"],
    crease: "#060B16",
    creaseSoft: "#172554",
    specular: "#F8FAFC",
    rimLight: "#93C5FD",
    tailShadow: "#060B16",
  },
  silver: {
    loopStops: ["#94A3B8", "#FFFFFF", "#F8FAFC", "#E2E8F0", "#CBD5E1", "#64748B"],
    cavityStops: ["#334155", "#64748B", "#94A3B8"],
    tailStops: ["#64748B", "#CBD5E1", "#FFFFFF", "#E2E8F0", "#94A3B8"],
    knotStops: ["#FFFFFF", "#F8FAFC", "#CBD5E1", "#64748B"],
    crease: "#475569",
    creaseSoft: "#64748B",
    specular: "#FFFFFF",
    rimLight: "#FFFFFF",
    tailShadow: "#334155",
  },
  duo: {
    loopStops: ["#1E3A8A", "#93C5FD", "#3B82F6", "#1D4ED8", "#1E40AF", "#0F172A"],
    cavityStops: ["#090D16", "#172554", "#1E3A8A"],
    tailStops: ["#0F172A", "#1E3A8A", "#3B82F6", "#1D4ED8", "#172554"],
    knotStops: ["#FFFFFF", "#E2E8F0", "#CBD5E1", "#64748B"],
    crease: "#090D16",
    creaseSoft: "#1E3A8A",
    specular: "#FFFFFF",
    rimLight: "#E2E8F0",
    tailShadow: "#090D16",
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
  const tailShadowId = `${idPrefix}-tail-shadow`;
  const knotId = `${idPrefix}-knot`;
  const trimId = `${idPrefix}-trim`;

  return (
    <g>
      <defs>
        {/* Gradiente cilíndrico acetinado de 6 pontos para alça esquerda */}
        <linearGradient id={loopLId} x1="6%" y1="10%" x2="96%" y2="90%">
          <stop offset="0%" stopColor={p.loopStops[0]} />
          <stop offset="18%" stopColor={p.loopStops[1]} />
          <stop offset="38%" stopColor={p.loopStops[2]} />
          <stop offset="62%" stopColor={p.loopStops[3]} />
          <stop offset="84%" stopColor={p.loopStops[4]} />
          <stop offset="100%" stopColor={p.loopStops[5]} />
        </linearGradient>

        {/* Gradiente cilíndrico acetinado de 6 pontos para alça direita */}
        <linearGradient id={loopRId} x1="94%" y1="10%" x2="4%" y2="90%">
          <stop offset="0%" stopColor={p.loopStops[0]} />
          <stop offset="18%" stopColor={p.loopStops[1]} />
          <stop offset="38%" stopColor={p.loopStops[2]} />
          <stop offset="62%" stopColor={p.loopStops[3]} />
          <stop offset="84%" stopColor={p.loopStops[4]} />
          <stop offset="100%" stopColor={p.loopStops[5]} />
        </linearGradient>

        {/* Cavidade profunda da dobra interna */}
        <linearGradient id={cavityId} x1="0%" y1="0%" x2="10%" y2="100%">
          <stop offset="0%" stopColor={p.cavityStops[0]} />
          <stop offset="55%" stopColor={p.cavityStops[1]} />
          <stop offset="100%" stopColor={p.cavityStops[2]} />
        </linearGradient>

        {/* Caudas onduladas com brilho longitudinal */}
        <linearGradient id={tailLId} x1="72%" y1="4%" x2="18%" y2="98%">
          <stop offset="0%" stopColor={p.tailStops[0]} />
          <stop offset="22%" stopColor={p.tailStops[1]} />
          <stop offset="50%" stopColor={p.tailStops[2]} />
          <stop offset="76%" stopColor={p.tailStops[3]} />
          <stop offset="100%" stopColor={p.tailStops[4]} />
        </linearGradient>

        <linearGradient id={tailRId} x1="28%" y1="4%" x2="82%" y2="98%">
          <stop offset="0%" stopColor={p.tailStops[0]} />
          <stop offset="22%" stopColor={p.tailStops[1]} />
          <stop offset="50%" stopColor={p.tailStops[2]} />
          <stop offset="76%" stopColor={p.tailStops[3]} />
          <stop offset="100%" stopColor={p.tailStops[4]} />
        </linearGradient>

        {/* Sombra projetada das alças e nó sobre as caudas */}
        <linearGradient id={tailShadowId} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={p.tailShadow} stopOpacity="0.62" />
          <stop offset="65%" stopColor={p.tailShadow} stopOpacity="0.18" />
          <stop offset="100%" stopColor={p.tailShadow} stopOpacity="0" />
        </linearGradient>

        {/* Nó central abobadado */}
        <radialGradient id={knotId} cx="38%" cy="30%" r="72%">
          <stop offset="0%" stopColor={p.knotStops[0]} />
          <stop offset="34%" stopColor={p.knotStops[1]} />
          <stop offset="72%" stopColor={p.knotStops[2]} />
          <stop offset="100%" stopColor={p.knotStops[3]} />
        </radialGradient>

        {/* Filete prateado metálico das bordas */}
        <linearGradient id={trimId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="32%" stopColor="#CBD5E1" />
          <stop offset="66%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      <g>
        {/* 1. Caudas pendentes com ondulação fluida e corte clássico em "V" (swallowtail) */}
        <path
          d="M72 48 C61 65 44 85 20 112 L38 103 L45 120 C62 96 73 74 79 51 Z"
          fill={`url(#${tailLId})`}
          stroke={`url(#${trimId})`}
          strokeWidth="1.05"
          strokeLinejoin="round"
        />
        <path
          d="M88 48 C99 65 116 85 140 112 L122 103 L115 120 C98 96 87 74 81 51 Z"
          fill={`url(#${tailRId})`}
          stroke={`url(#${trimId})`}
          strokeWidth="1.05"
          strokeLinejoin="round"
        />

        {/* Filete prateado interno sutil e brilho longitudinal nas caudas */}
        <path
          d="M71 54 C59 71 45 88 28 107"
          fill="none"
          stroke={p.specular}
          strokeOpacity="0.48"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M89 54 C101 71 115 88 132 107"
          fill="none"
          stroke={p.specular}
          strokeOpacity="0.48"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M75 52 C65 70 55 88 44 109"
          fill="none"
          stroke={p.creaseSoft}
          strokeOpacity="0.42"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M85 52 C95 70 105 88 116 109"
          fill="none"
          stroke={p.creaseSoft}
          strokeOpacity="0.42"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Sombra projetada das alças e do nó sobre a parte superior das caudas */}
        <path
          d="M71 48 C65 60 58 69 51 77 L68 79 C73 68 77 58 79 50 Z"
          fill={`url(#${tailShadowId})`}
        />
        <path
          d="M89 48 C95 60 102 69 109 77 L92 79 C87 68 83 58 81 50 Z"
          fill={`url(#${tailShadowId})`}
        />

        {/* 2. Cavidade interna profunda das alças */}
        <path
          d="M75 40 C58 21 31 12 16 22 C11 26 12 34 22 39 C38 30 57 34 75 43 Z"
          fill={`url(#${cavityId})`}
        />
        <path
          d="M85 40 C102 21 129 12 144 22 C149 26 148 34 138 39 C122 30 103 34 85 43 Z"
          fill={`url(#${cavityId})`}
        />

        {/* 3. Alças frontais acetinadas esculpidas */}
        <path
          d="M77 42 C58 21 28 10 12 24 C1 33 4 53 19 61 C36 70 59 60 77 48 Z"
          fill={`url(#${loopLId})`}
          stroke={`url(#${trimId})`}
          strokeWidth="1.15"
          strokeLinejoin="round"
        />
        <path
          d="M83 42 C102 21 132 10 148 24 C159 33 156 53 141 61 C124 70 101 60 83 48 Z"
          fill={`url(#${loopRId})`}
          stroke={`url(#${trimId})`}
          strokeWidth="1.15"
          strokeLinejoin="round"
        />

        {/* 4. Múltiplas pregas convergindo para o nó central (3 linhas de tensão/vinco por lado) */}
        <path
          d="M74 42 C57 32 37 28 21 33 C37 33 56 38 74 44 Z"
          fill={p.crease}
          opacity="0.24"
        />
        <path
          d="M74 45 C54 38 32 37 14 43 C32 43 54 46 74 47 Z"
          fill={p.crease}
          opacity="0.34"
        />
        <path
          d="M74 47 C58 46 41 49 24 55 C42 53 58 50 74 48 Z"
          fill={p.creaseSoft}
          opacity="0.32"
        />

        <path
          d="M86 42 C103 32 123 28 139 33 C123 33 104 38 86 44 Z"
          fill={p.crease}
          opacity="0.24"
        />
        <path
          d="M86 45 C106 38 128 37 146 43 C128 43 106 46 86 47 Z"
          fill={p.crease}
          opacity="0.34"
        />
        <path
          d="M86 47 C102 46 119 49 136 55 C118 53 102 50 86 48 Z"
          fill={p.creaseSoft}
          opacity="0.32"
        />

        {/* 5. Reflexo especular duplo na crista e contra-luz inferior nas alças */}
        <path
          d="M16 26 C31 16 55 24 71 39"
          fill="none"
          stroke={p.specular}
          strokeOpacity="0.88"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M23 30 C37 24 54 29 68 41"
          fill="none"
          stroke={p.specular}
          strokeOpacity="0.45"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <path
          d="M21 57 C37 64 56 57 71 49"
          fill="none"
          stroke={p.rimLight}
          strokeOpacity="0.52"
          strokeWidth="0.95"
          strokeLinecap="round"
        />

        <path
          d="M144 26 C129 16 105 24 89 39"
          fill="none"
          stroke={p.specular}
          strokeOpacity="0.88"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M137 30 C123 24 106 29 92 41"
          fill="none"
          stroke={p.specular}
          strokeOpacity="0.45"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <path
          d="M139 57 C123 64 104 57 89 49"
          fill="none"
          stroke={p.rimLight}
          strokeOpacity="0.52"
          strokeWidth="0.95"
          strokeLinecap="round"
        />

        {/* 6. Nó central abobadado 3D com pregas horizontais de tensão e brilho diagonal */}
        <path
          d="M69 36 C74 32 86 32 91 36 C94 42 94 50 91 56 C86 59 74 59 69 56 C66 50 66 42 69 36 Z"
          fill={`url(#${knotId})`}
          stroke={`url(#${trimId})`}
          strokeWidth="1.25"
        />
        {/* Pregas horizontais sutis no nó */}
        <path
          d="M71 42 Q80 40 89 42"
          fill="none"
          stroke={p.crease}
          strokeOpacity="0.28"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <path
          d="M71 50 Q80 52 89 50"
          fill="none"
          stroke={p.crease}
          strokeOpacity="0.32"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        {/* Brilho diagonal superior no nó */}
        <path
          d="M72 37 C76 35 83 35 86 38"
          fill="none"
          stroke={p.specular}
          strokeOpacity="0.82"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

export interface BowProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  variant?: BowVariant;
  title?: string;
}

export const Bow = memo(function Bow({
  variant = "royal",
  title,
  className = "",
  style,
  ...rest
}: BowProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg
      viewBox="0 0 160 126"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_6px_10px_rgba(9,13,22,0.38)] ${className}`}
      style={style}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <BowGlyph variant={variant} idPrefix={`bow-${uid}`} />
    </svg>
  );
});
