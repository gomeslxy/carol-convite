import { memo, useId } from "react";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ORNAMENTOS GEOMÉTRICOS IMPERIAIS (Azul Royal & Prata Metálico)
 *  Otimizados para renderização vetorial nítida em telas Retina sem filtros SVG pesados.
 * ─────────────────────────────────────────────────────────────────────────────
 */

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
      width={64}
      height={64}
      viewBox="0 0 64 64"
      className={`pointer-events-none aspect-square overflow-visible ${className}`}
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
