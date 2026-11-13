import { memo, useId } from "react";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ORNAMENTOS 3D & BALÃO METALIZADO "18" (Azul Royal & Prata Metálico)
 *  Otimizados para renderização vetorial nítida em telas Retina sem filtros SVG pesados.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Balão Metalizado 3D (Foil Mylar Balloon "18") em Prata Cromado Espelhado
 * com reflexos especulares cilíndricos e dobras de mylar.
 */
export const FoilBalloon18 = memo(function FoilBalloon18({
  className = "w-28",
}: {
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n: string) => `foil18-${uid}-${n}`;

  return (
    <svg
      viewBox="0 0 240 165"
      className={`drop-shadow-[0_8px_14px_rgba(15,23,42,0.34)] ${className}`}
      aria-hidden
    >
      <defs>
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
      </defs>

      <g>
        {/* ───────── DÍGITO "1" EM BALÃO METALIZADO 3D ───────── */}
        <g transform="translate(8, 6) rotate(-4 55 75)">
          <path d="M 55 142 L 65 142 L 68 151 L 52 151 Z" fill={`url(#${id("seam")})`} />

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
          <path
            d="M 42 54 C 46 52, 50 54, 52 57"
            fill="none"
            stroke="#334155"
            strokeWidth="1.4"
            opacity="0.6"
          />
          <path
            d="M 42 92 C 45 91, 48 92, 50 94"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            opacity="0.8"
          />
        </g>

        {/* ───────── DÍGITO "8" EM BALÃO METALIZADO 3D ───────── */}
        <g transform="translate(88, 6) rotate(4 68 75)">
          <path d="M 62 143 L 74 143 L 77 152 L 59 152 Z" fill={`url(#${id("seam")})`} />

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
});

/**
 * Brasão Editorial "C · 18" Esculpido em Prata Metálica (Usado no selo do envelope).
 */
export const Emblem18 = memo(function Emblem18({
  strokeUrl,
  fillUrl,
  initial = "C",
}: {
  strokeUrl: string;
  fillUrl: string;
  initial?: string;
}) {
  return (
    <g>
      {/* Arco duplo pontilhado / filete prateado fino interno */}
      <circle
        cx="100"
        cy="100"
        r="70"
        fill="none"
        stroke={strokeUrl}
        strokeWidth="0.7"
        strokeDasharray="2 4.5"
        opacity="0.58"
      />
      <circle
        cx="100"
        cy="100"
        r="64"
        fill="none"
        stroke={strokeUrl}
        strokeWidth="0.55"
        opacity="0.34"
      />

      {/* Estrela de 4 pontas no topo */}
      <path
        d="M 100 32 C 101.1 37.2 103.2 39.2 108.5 40.3 C 103.2 41.4 101.1 43.4 100 48.6 C 98.9 43.4 96.8 41.4 91.5 40.3 C 96.8 39.2 98.9 37.2 100 32 Z"
        fill={fillUrl}
        opacity="0.96"
      />

      {/* Micro-estrelas laterais flanqueando o monograma */}
      <path
        d="M 52 98 C 52.6 100.4 53.6 101.4 56 102 C 53.6 102.6 52.6 103.6 52 106 C 51.4 103.6 50.4 102.6 48 102 C 50.4 101.4 51.4 100.4 52 98 Z"
        fill={fillUrl}
        opacity="0.72"
      />
      <path
        d="M 148 98 C 148.6 100.4 149.6 101.4 152 102 C 149.6 102.6 148.6 103.6 148 106 C 147.4 103.6 146.4 102.6 144 102 C 146.4 101.4 147.4 100.4 148 98 Z"
        fill={fillUrl}
        opacity="0.72"
      />

      {/* Monograma sutil no topo do brasão */}
      <text
        x="100"
        y="70"
        textAnchor="middle"
        fill={fillUrl}
        opacity="0.94"
        style={{
          fontFamily: "var(--font-serif), 'Cinzel', Georgia, serif",
          fontSize: "19px",
          fontWeight: 600,
          letterSpacing: "0.18em",
        }}
      >
        {initial}
      </text>

      {/* Numeral "18" em tipografia clássica serifada */}
      <text
        x="99"
        y="127"
        textAnchor="middle"
        fill={fillUrl}
        style={{
          fontFamily: "var(--font-serif), 'Cinzel', Georgia, serif",
          fontSize: "57px",
          fontWeight: 600,
          letterSpacing: "0.03em",
        }}
      >
        18
      </text>

      {/* Filete horizontal minimalista com losango/ponto central */}
      <line
        x1="66"
        y1="143"
        x2="91"
        y2="143"
        stroke={strokeUrl}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.82"
      />
      <path d="M 100 139.5 L 103.2 143 L 100 146.5 L 96.8 143 Z" fill={fillUrl} opacity="0.95" />
      <line
        x1="109"
        y1="143"
        x2="134"
        y2="143"
        stroke={strokeUrl}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.82"
      />
    </g>
  );
});

/**
 * Divisor minimalista prateado luminoso com estrela central facetada e micro-cristais laterais.
 */
export const SilverDivider = memo(function SilverDivider({
  className = "",
}: {
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `div-grad-${uid}`;

  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden>
      <svg viewBox="0 0 320 20" className="w-full max-w-[260px] sm:max-w-[300px] overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0" />
            <stop offset="26%" stopColor="#CBD5E1" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.98" />
            <stop offset="74%" stopColor="#CBD5E1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1="10" y1="10" x2="134" y2="10" stroke={`url(#${gradId})`} strokeWidth="0.95" />
        {/* Micro-cristal esquerdo */}
        <path d="M 142 7.5 L 144.5 10 L 142 12.5 L 139.5 10 Z" fill="#E2E8F0" opacity="0.82" />
        {/* Estrela central facetada em 2 camadas */}
        <path
          d="M 160 2.5 C 161.2 7.1 162.9 8.8 167.5 10 C 162.9 11.2 161.2 12.9 160 17.5 C 158.8 12.9 157.1 11.2 152.5 10 C 157.1 8.8 158.8 7.1 160 2.5 Z"
          fill="#F8FAFC"
        />
        <path
          d="M 160 6.5 L 163.5 10 L 160 13.5 L 156.5 10 Z"
          fill="#FFFFFF"
          opacity="0.95"
        />
        {/* Micro-cristal direito */}
        <path d="M 178 7.5 L 180.5 10 L 178 12.5 L 175.5 10 Z" fill="#E2E8F0" opacity="0.82" />
        <line x1="186" y1="10" x2="310" y2="10" stroke={`url(#${gradId})`} strokeWidth="0.95" />
      </svg>
    </div>
  );
});

const CORNER_TRANSFORM: Record<"tl" | "tr" | "bl" | "br", string> = {
  tl: "",
  tr: "scale(-1, 1)",
  bl: "scale(1, -1)",
  br: "scale(-1, -1)",
};

/**
 * Cantoneira geométrica imperial em Prata Metálico (zero elementos florais).
 * Linhas duplas entrelaçadas em ângulo reto com estrela de 4 pontas no vértice.
 */
export const CornerFiligree = memo(function CornerFiligree({
  position,
  className = "",
  tone = "light",
}: {
  position: "tl" | "tr" | "bl" | "br";
  className?: string;
  tone?: "light" | "slate";
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `corner-${uid}`;
  const isSlate = tone === "slate";

  return (
    <svg
      viewBox="0 0 64 64"
      className={`pointer-events-none overflow-visible ${className}`}
      style={{ transform: CORNER_TRANSFORM[position] }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isSlate ? "#64748B" : "#FFFFFF"} stopOpacity="0.95" />
          <stop offset="50%" stopColor={isSlate ? "#94A3B8" : "#E2E8F0"} stopOpacity="0.72" />
          <stop offset="100%" stopColor={isSlate ? "#CBD5E1" : "#CBD5E1"} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Linha dupla externa em ângulo reto */}
      <path
        d="M 4 54 L 4 8 Q 4 4 8 4 L 54 4"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {/* Linha interna entrelaçada com chanfro geométrico no canto */}
      <path
        d="M 10 44 L 10 16 L 16 10 L 44 10"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.82"
      />
      {/* Travamento diagonal minimalista */}
      <line
        x1="4"
        y1="20"
        x2="20"
        y2="4"
        stroke={`url(#${gradId})`}
        strokeWidth="0.85"
        opacity="0.65"
      />
      {/* Estrela de 4 pontas no vértice */}
      <path
        d="M 13 6 C 13.7 9.8 15.2 11.3 19 12 C 15.2 12.7 13.7 14.2 13 18 C 12.3 14.2 10.8 12.7 7 12 C 10.8 11.3 12.3 9.8 13 6 Z"
        fill={isSlate ? "#64748B" : "#FFFFFF"}
        opacity="0.9"
      />
      {/* Micro-cristal de remate */}
      <circle cx="24" cy="24" r="1.35" fill={isSlate ? "#94A3B8" : "#E2E8F0"} opacity="0.78" />
    </svg>
  );
});

/**
 * Ícone elegante de vestuário (Vestido de festa + Terno/Blazer) em Prata Metálico.
 */
export const DressCodeIcon = memo(function DressCodeIcon({
  className = "size-8",
}: {
  className?: string;
}) {
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
      <line
        x1="13"
        y1="16.5"
        x2="19"
        y2="16.5"
        stroke="#1E40AF"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      <path
        d="M 34 8 L 38 6 L 41 13 L 44 6 L 48 8 L 52 14 L 49 17 L 47 13 L 47 37 L 35 37 L 35 13 L 33 17 L 30 14 Z"
        fill={`url(#${silverId})`}
      />
      <path
        d="M 38 7 L 41 16 L 44 7"
        fill="none"
        stroke="#1E40AF"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <line
        x1="41"
        y1="16"
        x2="41"
        y2="25"
        stroke="#1E40AF"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
});
