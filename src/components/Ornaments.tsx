import { useId } from "react";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ORNAMENTOS 3D & BALÃO METALIZADO "18" (Fiel às Referências em Azul & Prata)
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Balão Metalizado 3D (Foil Mylar Balloon "18") em Prata Cromado Espelhado
 * com reflexos especulares cilíndricos e dobras de mylar (inspirado nos balões
 * metalizados das fotos de referência).
 */
export function FoilBalloon18({ className = "w-28" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n: string) => `foil18-${uid}-${n}`;

  return (
    <svg viewBox="0 0 240 165" className={className} aria-hidden>
      <defs>
        {/* Gradiente Cromado Espelhado 3D Principal */}
        <linearGradient id={id("chrome-body")} x1="12%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="16%" stopColor="#E2E8F0" />
          <stop offset="32%" stopColor="#64748B" />
          <stop offset="46%" stopColor="#1E293B" />
          <stop offset="58%" stopColor="#F8FAFC" />
          <stop offset="74%" stopColor="#94A3B8" />
          <stop offset="88%" stopColor="#334155" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>

        {/* Reflexo Interno de Volume Inflado (3D Pillow Effect) */}
        <radialGradient id={id("pillow-1")} cx="35%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E2E8F0" />
          <stop offset="68%" stopColor="#64748B" />
          <stop offset="88%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#94A3B8" />
        </radialGradient>

        <radialGradient id={id("pillow-8")} cx="38%" cy="26%" r="72%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="32%" stopColor="#F1F5F9" />
          <stop offset="64%" stopColor="#64748B" />
          <stop offset="86%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </radialGradient>

        {/* Borda de Solda do Balão Metalizado (Mylar Seam) */}
        <linearGradient id={id("seam")} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#94A3B8" />
          <stop offset="55%" stopColor="#334155" />
          <stop offset="80%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        <filter id={id("drop")} x="-18%" y="-18%" width="136%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.28" />
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1E3A8A" floodOpacity="0.18" />
        </filter>
      </defs>

      <g filter={`url(#${id("drop")})`}>
        {/* ───────── DÍGITO "1" EM BALÃO METALIZADO 3D ───────── */}
        <g transform="translate(8, 6) rotate(-4 55 75)">
          {/* Aba de selagem inferior do balão 1 */}
          <path
            d="M 55 142 L 65 142 L 68 151 L 52 151 Z"
            fill={`url(#${id("seam")})`}
          />

          {/* Corpo inflado do número 1 */}
          <path
            d="M 48 16
               C 55 10, 68 10, 74 16
               C 78 20, 78 126, 78 134
               C 78 142, 68 145, 58 145
               C 48 145, 42 141, 42 133
               L 42 54
               L 30 62
               C 22 66, 14 60, 14 51
               C 14 44, 20 38, 28 32
               Z"
            fill={`url(#${id("pillow-1")})`}
            stroke={`url(#${id("seam")})`}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Reflexo cromado cilíndrico interno do 1 */}
          <path
            d="M 55 22 L 55 132"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.78"
          />
          <path
            d="M 67 24 L 67 132"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.42"
          />
          {/* Vincos característicos de balão inflado */}
          <path d="M 42 54 C 46 52, 50 54, 52 57" fill="none" stroke="#334155" strokeWidth="1.4" opacity="0.6" />
          <path d="M 42 92 C 45 91, 48 92, 50 94" fill="none" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.8" />
        </g>

        {/* ───────── DÍGITO "8" EM BALÃO METALIZADO 3D ───────── */}
        <g transform="translate(88, 6) rotate(4 68 75)">
          {/* Aba de selagem inferior do balão 8 */}
          <path
            d="M 62 143 L 74 143 L 77 152 L 59 152 Z"
            fill={`url(#${id("seam")})`}
          />

          {/* Corpo inflado do número 8 com furos internos (fillRule evenodd) */}
          <path
            fillRule="evenodd"
            d="M 68 12
               C 98 12, 116 27, 116 47
               C 116 60, 106 70, 94 75
               C 110 81, 122 93, 122 110
               C 122 132, 100 146, 68 146
               C 36 146, 14 132, 14 110
               C 14 93, 26 81, 42 75
               C 30 70, 20 60, 20 47
               C 20 27, 38 12, 68 12 Z
               M 68 36
               C 56 36, 49 42, 49 49
               C 49 56, 56 62, 68 62
               C 80 62, 87 56, 87 49
               C 87 42, 80 36, 68 36 Z
               M 68 88
               C 53 88, 45 96, 45 107
               C 45 118, 53 125, 68 125
               C 83 125, 91 118, 91 107
               C 91 96, 83 88, 68 88 Z"
            fill={`url(#${id("pillow-8")})`}
            stroke={`url(#${id("seam")})`}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Brilhos especulares curvos de mylar no 8 */}
          <path
            d="M 34 44 C 34 30, 50 22, 68 22 C 82 22, 94 27, 98 36"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
            opacity="0.82"
          />
          <path
            d="M 28 108 C 26 95, 36 84, 48 80"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 104 96 C 110 108, 104 124, 86 132"
            fill="none"
            stroke="#1E293B"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.42"
          />
          <path
            d="M 48 134 C 62 138, 78 138, 92 132"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.65"
          />
        </g>
      </g>
    </svg>
  );
}

/**
 * Numeral "18" Editorial Esculpido em Prata / Azul Royal (Usado no selo do envelope).
 */
export function Emblem18({
  strokeUrl,
  fillUrl,
}: {
  strokeUrl: string;
  fillUrl: string;
  accentUrl?: string;
}) {
  return (
    <g>
      {/* Estrela de 4 pontas no topo */}
      <path
        d="M 100 40 C 101.2 46 103.5 48.2 109.5 49.5 C 103.5 50.8 101.2 53 100 59 C 98.8 53 96.5 50.8 90.5 49.5 C 96.5 48.2 98.8 46 100 40 Z"
        fill={fillUrl}
        opacity="0.95"
      />

      {/* Numeral "18" em tipografia clássica serifada */}
      <text
        x="99"
        y="122"
        textAnchor="middle"
        fill={fillUrl}
        style={{
          fontFamily: "var(--font-serif), 'Cinzel', Georgia, serif",
          fontSize: "58px",
          fontWeight: 600,
          letterSpacing: "0.03em",
        }}
      >
        18
      </text>

      {/* Filete horizontal minimalista com ponto central abaixo do 18 */}
      <line
        x1="72"
        y1="138"
        x2="92"
        y2="138"
        stroke={strokeUrl}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <circle cx="100" cy="138" r="1.8" fill={fillUrl} opacity="0.9" />
      <line
        x1="108"
        y1="138"
        x2="128"
        y2="138"
        stroke={strokeUrl}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />
    </g>
  );
}

export const CalligraphicMonogramC = Emblem18;

/**
 * Emblema Minimalista do Topo ("18").
 */
export function MonogramCrest({ className }: { initial?: string; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n: string) => `crest18-${uid}-${n}`;

  return (
    <svg viewBox="0 0 200 180" className={className} aria-hidden>
      <defs>
        <linearGradient id={id("silver")} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id={id("royal")} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#172554" />
          <stop offset="50%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      <circle
        cx="100"
        cy="96"
        r="54"
        fill="#FFFFFF"
        fillOpacity="0.8"
        stroke={`url(#${id("silver")})`}
        strokeWidth="1"
      />
      <circle
        cx="100"
        cy="96"
        r="49"
        fill="none"
        stroke={`url(#${id("silver")})`}
        strokeWidth="0.6"
        opacity="0.65"
      />

      <g transform="translate(0, -2)">
        <Emblem18 strokeUrl={`url(#${id("silver")})`} fillUrl={`url(#${id("royal")})`} />
      </g>
    </svg>
  );
}

/**
 * Divisor minimalista prateado luminoso com estrela central sutil.
 */
export function SilverDivider({ className = "" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `div-grad-${uid}`;

  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden>
      <svg viewBox="0 0 320 16" className="w-full max-w-[260px] sm:max-w-[300px] overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0" />
            <stop offset="28%" stopColor="#CBD5E1" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="72%" stopColor="#CBD5E1" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1="10" y1="8" x2="148" y2="8" stroke={`url(#${gradId})`} strokeWidth="0.95" />
        <path
          d="M 160 2.5 C 161 6 162.8 7 166 8 C 162.8 9 161 10 160 13.5 C 159 10 157.2 9 154 8 C 157.2 7 159 6 160 2.5 Z"
          fill="#F8FAFC"
        />
        <line x1="172" y1="8" x2="310" y2="8" stroke={`url(#${gradId})`} strokeWidth="0.95" />
      </svg>
    </div>
  );
}

/**
 * Ícone elegante de vestuário (Vestido de festa + Terno/Blazer) em Prata Metálico para "ESPORTE FINO".
 */
export function DressCodeIcon({ className = "size-8" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const silverId = `dress-silver-${uid}`;

  return (
    <svg viewBox="0 0 56 44" className={className} aria-hidden>
      <defs>
        <linearGradient id={silverId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      <path
        d="M 12 7 L 15 13 L 18 7 L 20 7 L 19 16 L 26 37 L 6 37 L 13 16 L 12 7 Z"
        fill={`url(#${silverId})`}
      />
      <line x1="13" y1="16.5" x2="19" y2="16.5" stroke="#1E40AF" strokeWidth="1.1" strokeLinecap="round" />

      <path
        d="M 34 8 L 38 6 L 41 13 L 44 6 L 48 8 L 52 14 L 49 17 L 47 13 L 47 37 L 35 37 L 35 13 L 33 17 L 30 14 Z"
        fill={`url(#${silverId})`}
      />
      <path d="M 38 7 L 41 16 L 44 7" fill="none" stroke="#1E40AF" strokeWidth="1.1" strokeLinejoin="round" />
      <line x1="41" y1="16" x2="41" y2="25" stroke="#1E40AF" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
