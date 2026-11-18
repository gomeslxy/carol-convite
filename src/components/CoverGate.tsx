"use client";

import type confettiType from "canvas-confetti";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { gsap } from "gsap";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { BowGlyph } from "@/components/BowDecoration";
import { fireLuxuryCelebration } from "@/components/LuxuryParticles";
import { useScrollLock } from "@/components/SmoothScrollProvider";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";

type ConfettiFn = typeof confettiType;
type GatePhase = "idle" | "unsealing" | "opening";

export interface CoverGateProps {
  /** Disparado quando as duas portas começam a deslizar, revelando o pôster principal. */
  onOpenStart: () => void;
  /** Disparado quando a abertura bipartida conclui e o scroll (Lenis) é liberado. */
  onOpenComplete: () => void;
}

const CREST_SRC = "/images/brasao-barroco-c.png";
const CREST_WIDTH = 576;
const CREST_HEIGHT = 610;

const LUXURY_EASE = [0.22, 1, 0.36, 1] as const;

const DOOR_SPRING_TRANSITION = {
  type: "spring",
  stiffness: 62,
  damping: 16,
  mass: 1,
  restDelta: 0.2,
} as const;

const UNSEAL_SPARKS = [
  { x: -96, y: -56, size: 10, rot: -25, delay: 0, color: "#FFFFFF" },
  { x: 98, y: -48, size: 9, rot: 30, delay: 0.02, color: "#93C5FD" },
  { x: -112, y: 12, size: 8, rot: 15, delay: 0.04, color: "#CBD5E1" },
  { x: 112, y: 16, size: 10, rot: -18, delay: 0.02, color: "#FFFFFF" },
  { x: -78, y: 78, size: 9, rot: 42, delay: 0.05, color: "#1E40AF" },
  { x: 82, y: 74, size: 10, rot: -35, delay: 0.03, color: "#E2E8F0" },
  { x: -24, y: -106, size: 8, rot: 12, delay: 0.01, color: "#60A5FA" },
  { x: 28, y: -102, size: 9, rot: -14, delay: 0.04, color: "#FFFFFF" },
  { x: -32, y: 102, size: 8, rot: 22, delay: 0.02, color: "#B8C0CC" },
  { x: 26, y: 98, size: 9, rot: -20, delay: 0.05, color: "#93C5FD" },
] as const;

const CORNER_ROTATION: Record<"tl" | "tr" | "bl" | "br", string> = {
  tl: "none",
  tr: "scale(-1, 1)",
  bl: "scale(1, -1)",
  br: "scale(-1, -1)",
};

/**
 * Estrela facetada bicolor de 5 pontas em Azul Royal ou Prata para a decoração da página.
 */
function FacetedPageStar({
  x,
  y,
  r,
  rot = 0,
  tone = "royal",
}: {
  x: number;
  y: number;
  r: number;
  rot?: number;
  tone?: "royal" | "silver";
}) {
  const pts: [string, string][] = [];
  for (let i = 0; i < 10; i++) {
    const rad = ((i * 36 - 90) * Math.PI) / 180;
    const len = i % 2 === 0 ? r : r * 0.42;
    pts.push([(Math.cos(rad) * len).toFixed(1), (Math.sin(rad) * len).toFixed(1)]);
  }
  const poly = pts.map((p) => p.join(",")).join(" ");
  const isRoyal = tone === "royal";

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rot})`}>
      <polygon
        points={poly}
        fill={isRoyal ? "#1E40AF" : "#CBD5E1"}
        stroke={isRoyal ? "#071739" : "#64748B"}
        strokeWidth="0.95"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,0 ${pts[0].join(",")} ${pts[1].join(",")}`}
        fill={isRoyal ? "#60A5FA" : "#FFFFFF"}
        opacity="0.82"
      />
      <polygon
        points={`0,0 ${pts[2].join(",")} ${pts[3].join(",")}`}
        fill={isRoyal ? "#3B82F6" : "#F8FAFC"}
        opacity="0.68"
      />
      <polygon
        points={`0,0 ${pts[8].join(",")} ${pts[9].join(",")}`}
        fill={isRoyal ? "#93C5FD" : "#FFFFFF"}
        opacity="0.74"
      />
    </g>
  );
}

/** Estrela lapidada de 4 pontas (✦) para acentos estelares na página. */
function FourPointStar({
  x,
  y,
  s,
  fill = "#0A2463",
  opacity = 0.88,
  twinkleDelay,
}: {
  x: number;
  y: number;
  s: number;
  fill?: string;
  opacity?: number;
  twinkleDelay?: string;
}) {
  const d = `M ${x} ${y - s} C ${x + s * 0.18} ${y - s * 0.24} ${x + s * 0.24} ${y - s * 0.18} ${x + s} ${y} C ${x + s * 0.24} ${y + s * 0.18} ${x + s * 0.18} ${y + s * 0.24} ${x} ${y + s} C ${x - s * 0.18} ${y + s * 0.24} ${x - s * 0.24} ${y + s * 0.18} ${x - s} ${y} C ${x - s * 0.24} ${y - s * 0.18} ${x - s * 0.18} ${y - s * 0.24} ${x} ${y - s} Z`;

  if (twinkleDelay !== undefined) {
    return (
      <path
        d={d}
        fill={fill}
        opacity={opacity}
        style={{ transformOrigin: `${x}px ${y}px`, animationDelay: twinkleDelay }}
        className="animate-spark-twinkle"
      />
    );
  }

  return <path d={d} fill={fill} opacity={opacity} />;
}

/**
 * Ornamento de canto com riscos caligráficos chiques, estrela e laçada fina em Azul Royal & Prata.
 */
function EditorialCornerOrnament({
  position,
  className = "",
}: {
  position: "tl" | "tr" | "bl" | "br";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`pointer-events-none select-none overflow-visible ${className}`}
      style={{ transform: CORNER_ROTATION[position] }}
      aria-hidden
    >
      <path
        d="M 3 84 L 3 9 Q 3 3 9 3 L 84 3"
        fill="none"
        stroke="#B8C0CC"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M 11 64 L 11 15 L 15 11 L 64 11"
        fill="none"
        stroke="#0A2463"
        strokeOpacity="0.4"
        strokeWidth="0.95"
        strokeLinecap="round"
      />

      {/* Riscos caligráficos fluidos em Azul Royal & Prata */}
      <path
        d="M 15 56 C 15 36, 24 22, 42 16 C 31 20, 22 30, 21 44"
        fill="none"
        stroke="#1E40AF"
        strokeOpacity="0.52"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M 56 15 C 36 15, 22 24, 16 42 C 20 31, 30 22, 44 21"
        fill="none"
        stroke="#94A3B8"
        strokeOpacity="0.88"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M 22 22 C 30 14, 38 18, 34 25 C 30 30, 23 27, 22 22 Z"
        fill="none"
        stroke="#0A2463"
        strokeOpacity="0.42"
        strokeWidth="0.95"
      />

      {/* Estrela de 4 pontas no vértice */}
      <path
        d="M 11 5.5 C 12 9 13 10 16.5 11 C 13 12 12 13 11 16.5 C 10 13 9 12 5.5 11 C 9 10 10 9 11 5.5 Z"
        fill="#0A2463"
        fillOpacity="0.78"
      />
      <path
        d="M 28 24 C 28.6 26.2 29.8 27.4 32 28 C 29.8 28.6 28.6 29.8 28 32 C 27.4 29.8 26.2 28.6 24 28 C 26.2 27.4 27.4 26.2 28 24 Z"
        fill="#1E40AF"
        fillOpacity="0.65"
      />
    </svg>
  );
}

/**
 * Decoração artística independente impressa NA PÁGINA (dividida entre as portas esquerda e direita),
 * posicionada atrás do broche: riscos caligráficos chiques, 3 laços acetinados Azul Royal,
 * estrelas facetadas/brilhantes e toques sutis de flores estilizadas em Azul Royal & Prata.
 * A lateral direita imediata do broche permanece limpa para o texto "TOQUE PARA ABRIR".
 */
function CoverPageCenterOrnament({
  side,
  animateStars,
}: {
  side: "left" | "right";
  animateStars: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const petalGrad = `page-petal-${uid}`;
  const leafGrad = `page-leaf-${uid}`;
  const isLeft = side === "left";

  const renderBlossom = (x: number, y: number, scale: number, rot: number, opacity: number) => (
    <g transform={`translate(${x}, ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <path
          key={angle}
          d="M 0 -2 C -12 -18, -8 -30, 0 -28 C 8 -30, 12 -18, 0 -2 Z"
          transform={`rotate(${angle})`}
          fill={`url(#${petalGrad})`}
          stroke="#0A2463"
          strokeOpacity="0.32"
          strokeWidth="0.8"
        />
      ))}
      <circle cx="0" cy="0" r="3.5" fill="#0A2463" />
      <circle cx="-1" cy="-1" r="1.2" fill="#93C5FD" />
    </g>
  );

  const renderLeaf = (x: number, y: number, scale: number, rot: number, opacity: number) => (
    <g transform={`translate(${x}, ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
      <path
        d="M 0 0 C -9 -14, -7 -32, 0 -42 C 7 -32, 9 -14, 0 0 Z"
        fill={`url(#${leafGrad})`}
        stroke="#0A2463"
        strokeOpacity="0.38"
        strokeWidth="0.8"
      />
      <line x1="0" y1="-2" x2="0" y2="-38" stroke="#E2E8F0" strokeOpacity="0.62" strokeWidth="0.7" />
    </g>
  );

  return (
    <svg
      viewBox={isLeft ? "0 0 270 740" : "270 0 270 740"}
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 aspect-[270/740] w-[clamp(162px,46.6vw,202px)] max-w-[32.5dvh] md:w-[224px] select-none ${
        isLeft ? "right-0" : "left-0"
      }`}
      aria-hidden
    >
      <defs>
        <radialGradient id={petalGrad} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#DBEAFE" />
          <stop offset="55%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#0A2463" />
        </radialGradient>
        <linearGradient id={leafGrad} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="55%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#071739" />
        </linearGradient>
      </defs>

      {/* 1. Moldura geométrica vertical alongada em Prata e Azul Royal (centro em 270, 370) */}
      <path
        d="M 270 34 L 372 370 L 270 706 L 168 370 Z"
        fill="none"
        stroke="rgba(148,163,184,0.72)"
        strokeWidth="1.2"
      />
      <path
        d="M 270 60 L 360 370 L 270 680 L 180 370 Z"
        fill="none"
        stroke="rgba(10,36,99,0.26)"
        strokeWidth="0.95"
      />
      <line x1="270" y1="16" x2="270" y2="724" stroke="rgba(10,36,99,0.22)" strokeWidth="1.1" />

      {/* 2. Riscos caligráficos chiques (arabescos fluidos em Azul Royal & Prata) */}
      <path
        d="M 258 232 C 202 114, 92 100, 72 190 C 58 250, 120 282, 146 244 C 164 218, 132 198, 118 218"
        fill="none"
        stroke="#0A2463"
        strokeOpacity="0.78"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M 244 220 C 194 134, 114 122, 92 194"
        fill="none"
        stroke="#94A3B8"
        strokeOpacity="0.9"
        strokeWidth="1.15"
        strokeLinecap="round"
      />

      {/* Risco superior direito (acima da zona do texto "TOQUE PARA ABRIR") */}
      <path
        d="M 282 224 C 322 114, 408 66, 456 128 C 476 156, 444 190, 422 170"
        fill="none"
        stroke="#1E40AF"
        strokeOpacity="0.7"
        strokeWidth="1.95"
        strokeLinecap="round"
      />
      <path
        d="M 290 212 C 330 132, 394 94, 434 136"
        fill="none"
        stroke="#CBD5E1"
        strokeWidth="1.15"
        strokeLinecap="round"
      />

      {/* Curva elegante flanqueando a lateral esquerda do broche */}
      <path
        d="M 162 304 C 66 344, 52 464, 136 518 C 176 544, 216 512, 196 484"
        fill="none"
        stroke="#1E40AF"
        strokeOpacity="0.64"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M 150 330 C 82 370, 80 448, 144 496"
        fill="none"
        stroke="#94A3B8"
        strokeOpacity="0.82"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* Cascata inferior simétrica de riscos e S-curves */}
      <path
        d="M 250 516 C 188 622, 90 636, 104 700 C 115 740, 172 734, 178 694"
        fill="none"
        stroke="#0A2463"
        strokeOpacity="0.78"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M 290 516 C 352 622, 450 636, 436 700 C 425 740, 368 734, 362 694"
        fill="none"
        stroke="#1E40AF"
        strokeOpacity="0.72"
        strokeWidth="1.95"
        strokeLinecap="round"
      />
      <path
        d="M 262 530 C 234 642, 194 716, 244 734"
        fill="none"
        stroke="#94A3B8"
        strokeOpacity="0.88"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M 278 530 C 306 642, 346 716, 296 734"
        fill="none"
        stroke="#94A3B8"
        strokeOpacity="0.88"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* 3. Um pouco de flor & folhas delicadas (~20%, equilibradas atrás dos laços) */}
      {renderLeaf(218, 176, 1.0, -38, 0.78)}
      {renderLeaf(238, 160, 0.84, -12, 0.68)}
      {renderBlossom(186, 190, 0.84, -15, 0.84)}
      {renderLeaf(332, 164, 0.86, 40, 0.68)}
      {renderLeaf(202, 598, 1.02, -142, 0.78)}
      {renderLeaf(336, 604, 0.94, 138, 0.72)}
      {renderBlossom(368, 618, 0.78, 20, 0.78)}
      {renderBlossom(170, 584, 0.72, -28, 0.74)}

      {/* 4. Estrelas facetadas & cintilações em Azul Royal e Prata */}
      <FacetedPageStar x={118} y={170} r={15} rot={-12} tone="royal" />
      <FacetedPageStar x={412} y={144} r={13} rot={14} tone="silver" />
      <FacetedPageStar x={94} y={404} r={14} rot={8} tone="silver" />
      <FacetedPageStar x={402} y={664} r={15} rot={18} tone="royal" />
      <FacetedPageStar x={144} y={658} r={12.5} rot={-16} tone="silver" />

      <FourPointStar
        x={270}
        y={22}
        s={16}
        fill="#0A2463"
        opacity={0.9}
        twinkleDelay={animateStars ? "0s" : undefined}
      />
      <FourPointStar
        x={270}
        y={718}
        s={16}
        fill="#0A2463"
        opacity={0.9}
        twinkleDelay={animateStars ? "1.6s" : undefined}
      />
      <FourPointStar
        x={70}
        y={296}
        s={11}
        fill="#1E40AF"
        opacity={0.82}
        twinkleDelay={animateStars ? "0.7s" : undefined}
      />
      <FourPointStar
        x={110}
        y={548}
        s={11}
        fill="#60A5FA"
        opacity={0.92}
        twinkleDelay={animateStars ? "1.2s" : undefined}
      />
      <FourPointStar
        x={448}
        y={202}
        s={10.5}
        fill="#1E40AF"
        opacity={0.82}
        twinkleDelay={animateStars ? "0.4s" : undefined}
      />
      <FourPointStar
        x={444}
        y={580}
        s={11.5}
        fill="#60A5FA"
        opacity={0.92}
        twinkleDelay={animateStars ? "2.0s" : undefined}
      />

      {/* 5. Laços acetinados esculturais em Azul Royal (reutilizando BowGlyph de alta-costura) */}
      <g transform="translate(270, 162) scale(0.76) translate(-80, -48)">
        <BowGlyph variant="royal" idPrefix={`${uid}-top-bow`} />
      </g>

      <g transform="translate(158, 238) rotate(-24) scale(0.5) translate(-80, -48)">
        <BowGlyph variant="duo" idPrefix={`${uid}-left-bow`} />
      </g>

      <g transform="translate(270, 558) scale(1.0) translate(-80, -48)">
        <BowGlyph variant="royal" idPrefix={`${uid}-bottom-bow`} />
      </g>
    </svg>
  );
}

/**
 * Moldura perimetral, cantoneiras caligráficas e metade da decoração central da página.
 */
function CoverDoorFrame({
  side,
  animateStars,
}: {
  side: "left" | "right";
  animateStars: boolean;
}) {
  const isLeft = side === "left";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Vinheta sutil nas extremidades externas da folha de papel */}
      <div
        className="absolute inset-0"
        style={{
          background: isLeft
            ? "linear-gradient(90deg, rgba(7,23,57,0.06) 0%, transparent 24%), linear-gradient(180deg, rgba(7,23,57,0.045) 0%, transparent 18%, transparent 82%, rgba(7,23,57,0.055) 100%)"
            : "linear-gradient(270deg, rgba(7,23,57,0.06) 0%, transparent 24%), linear-gradient(180deg, rgba(7,23,57,0.045) 0%, transparent 18%, transparent 82%, rgba(7,23,57,0.055) 100%)",
        }}
      />

      <div
        className={`absolute top-3.5 bottom-3.5 sm:top-6 sm:bottom-6 border-[#B8C0CC]/75 ${
          isLeft
            ? "left-3.5 sm:left-6 right-2.5 border-y border-l"
            : "right-3.5 sm:right-6 left-2.5 border-y border-r"
        }`}
      />
      <div
        className={`absolute top-5 bottom-5 sm:top-8 sm:bottom-8 border-[#0A2463]/18 ${
          isLeft
            ? "left-5 sm:left-8 right-4 border-y border-l"
            : "right-5 sm:right-8 left-4 border-y border-r"
        }`}
      />

      <EditorialCornerOrnament
        position={isLeft ? "tl" : "tr"}
        className={`absolute top-3.5 sm:top-6 size-16 sm:size-22 ${
          isLeft ? "left-3.5 sm:left-6" : "right-3.5 sm:right-6"
        }`}
      />
      <EditorialCornerOrnament
        position={isLeft ? "bl" : "br"}
        className={`absolute bottom-3.5 sm:bottom-6 size-16 sm:size-22 ${
          isLeft ? "left-3.5 sm:left-6" : "right-3.5 sm:right-6"
        }`}
      />

      {/* Decoração da página separada do broche e dividida pela fresta central */}
      <CoverPageCenterOrnament side={side} animateStars={animateStars} />
    </div>
  );
}

/**
 * Texto curvo "TOQUE PARA ABRIR" contornando suavemente a lateral direita do broche limpo
 * diretamente sobre o papel claro (sem disco ou fundo atrás).
 */
function CurvedCrestCaption({ visible }: { visible: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const arcId = `crest-right-arc-${uid}`;

  return (
    <motion.svg
      viewBox={`0 0 ${CREST_WIDTH} ${CREST_HEIGHT}`}
      initial={false}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.24, ease: LUXURY_EASE }}
      className="pointer-events-none absolute inset-0 size-full overflow-visible select-none"
      aria-hidden
    >
      <defs>
        {/* Arco direito concêntrico ao selo (centro 288, 305 | raio 324 | -48° a +34°) */}
        <path id={arcId} d="M 504.8,64.2 A 324,324 0 0 1 556.6,486.2" />
      </defs>

      <text
        fill="#071739"
        fontSize="31"
        fontWeight={600}
        className="animate-breathe-soft font-serif uppercase"
        style={{ letterSpacing: "0.17em" }}
      >
        <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
          TOQUE PARA ABRIR
        </textPath>
      </text>
    </motion.svg>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CAPA DE ABERTURA BIPARTIDA (CoverGate)
 *  - Portas bipartidas 50% / 50% em papel artesanal (#F4F5F7) contendo a
 *    decoração separada da página (laços Royal Blue, riscos caligráficos chiques,
 *    estrelas facetadas e toques sutis botânicos) que se abre junto com as portas.
 *  - Broche central independente em Madrepérola & Prata com "C" em Azul Royal
 *    (zero fundo, zero círculo atrás, zero flores acopladas), sobreposto à fresta
 *    com sombra projetada realista e shimmer restrito ao esmalte interno.
 *  - Chamada "TOQUE PARA ABRIR" contornando suavemente a lateral direita do broche.
 *  - Abertura fluida por física spring (transform: translate3d) e liberação do Lenis.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function CoverGate({ onOpenStart, onOpenComplete }: CoverGateProps) {
  const [phase, setPhase] = useState<GatePhase>("idle");
  const prefersReducedMotion = useReducedMotion();

  const isOpeningRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const confettiRef = useRef<ConfettiFn | null>(null);
  const confettiCleanupRef = useRef<(() => void) | null>(null);
  const onOpenStartRef = useRef(onOpenStart);
  const onOpenCompleteRef = useRef(onOpenComplete);

  onOpenStartRef.current = onOpenStart;
  onOpenCompleteRef.current = onOpenComplete;

  useScrollLock(true);

  useEffect(() => {
    let alive = true;
    import("canvas-confetti").then((mod) => {
      if (alive) confettiRef.current = mod.default;
    });

    return () => {
      alive = false;
      timelineRef.current?.kill();
      timelineRef.current = null;
      confettiCleanupRef.current?.();
      confettiCleanupRef.current = null;
    };
  }, []);

  // Tração magnética sutil apenas para ponteiros não-touch no desktop
  const sealRawX = useMotionValue(0);
  const sealRawY = useMotionValue(0);
  const sealX = useSpring(sealRawX, { stiffness: 220, damping: 24, mass: 0.5 });
  const sealY = useSpring(sealRawY, { stiffness: 220, damping: 24, mass: 0.5 });

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (isOpeningRef.current || e.pointerType === "touch") return;
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5));
      const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5));
      sealRawX.set(nx * 8);
      sealRawY.set(ny * 8);
    },
    [sealRawX, sealRawY],
  );

  const handlePointerLeave = useCallback(() => {
    sealRawX.set(0);
    sealRawY.set(0);
  }, [sealRawX, sealRawY]);

  const handleTriggerOpen = useCallback(() => {
    if (isOpeningRef.current) return;
    isOpeningRef.current = true;

    sealRawX.set(0);
    sealRawY.set(0);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(14);
    }

    const reducedMotion =
      prefersReducedMotion ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (reducedMotion) {
      setPhase("opening");
      onOpenStartRef.current();
      const tl = gsap.timeline();
      tl.call(() => onOpenCompleteRef.current(), undefined, 0.2);
      timelineRef.current = tl;
      return;
    }

    // 1. Dissolução do broche + explosão leve de brilhos azuis e prateados (~340ms)
    setPhase("unsealing");
    confettiCleanupRef.current = fireLuxuryCelebration(confettiRef.current);

    const tl = gsap.timeline();
    timelineRef.current = tl;

    // 2. Abertura fluida das portas bipartidas com física spring (carregando a decoração da página)
    tl.call(
      () => {
        setPhase("opening");
        onOpenStartRef.current();
      },
      undefined,
      0.34,
    );

    // 3. Desmontagem limpa do overlay e liberação do scroll Lenis
    tl.call(() => onOpenCompleteRef.current(), undefined, 1.36);
  }, [prefersReducedMotion, sealRawX, sealRawY]);

  const isIdle = phase === "idle";
  const isUnsealing = phase === "unsealing";
  const isOpening = phase === "opening";
  const isAnimatingDoors = isUnsealing || isOpening;
  const animatePageStars = isIdle && !prefersReducedMotion;

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`fixed inset-0 z-40 h-dvh w-screen overflow-hidden select-none touch-none ${
        isOpening ? "pointer-events-none" : "pointer-events-auto"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`Capa do convite de ${EVENT.name} — ${EVENT.age} Anos`}
    >
      {/* ════════════════════════════════════════════════════════════════════════
          PORTA ESQUERDA (50% — sobreposta à direita com sombra realista na junção)
         ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={false}
        animate={{ x: isOpening ? "-102%" : "0%" }}
        transition={DOOR_SPRING_TRANSITION}
        style={{ willChange: isAnimatingDoors ? "transform" : "auto" }}
        className="bg-paper-fine absolute inset-y-0 left-0 z-20 w-1/2 overflow-hidden border-r border-[#B8C0CC]/80 shadow-[inset_-1px_0_0_rgba(255,255,255,0.92),inset_-12px_0_22px_-14px_rgba(7,23,57,0.16),8px_0_28px_-6px_rgba(7,23,57,0.28),2px_0_6px_-2px_rgba(7,23,57,0.15)]"
        aria-hidden
      >
        <CoverDoorFrame side="left" animateStars={animatePageStars} />

        {/* Identidade editorial discreta no canto superior esquerdo */}
        <div className="pointer-events-none absolute top-8 left-8 sm:top-12 sm:left-14 flex flex-col items-start">
          <span className="font-script text-[26px] sm:text-[34px] leading-none text-[#071739]/85">
            {EVENT.name}
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-px w-4 bg-[#0A2463]/45" />
            <span className="font-serif text-[9px] sm:text-[10.5px] font-semibold tracking-[0.26em] text-[#0A2463]/80 uppercase">
              {EVENT.age} ANOS
            </span>
          </div>
        </div>

        {/* Filetes paralelos prata/azul-marinho na junção central */}
        <div className="pointer-events-none absolute inset-y-6 right-2.5 w-px bg-gradient-to-b from-transparent via-[#B8C0CC]/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#0A2463]/32 to-transparent" />
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          PORTA DIREITA (50% — oclusão profunda na linha de encontro central)
         ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={false}
        animate={{ x: isOpening ? "102%" : "0%" }}
        transition={DOOR_SPRING_TRANSITION}
        style={{ willChange: isAnimatingDoors ? "transform" : "auto" }}
        className="bg-paper-fine absolute inset-y-0 right-0 z-10 w-1/2 overflow-hidden shadow-[inset_18px_0_30px_-12px_rgba(7,23,57,0.26),inset_3px_0_6px_-1px_rgba(7,23,57,0.14)]"
        aria-hidden
      >
        <CoverDoorFrame side="right" animateStars={animatePageStars} />

        {/* Data oficial discreta no canto inferior direito */}
        <div className="pointer-events-none absolute right-8 bottom-8 sm:right-14 sm:bottom-12 flex items-center gap-1.5 font-serif text-[9px] sm:text-[10px] tracking-[0.24em] text-[#071739]/68 uppercase">
          <span className="text-[#0A2463]/70">✦</span>
          <span>{FORMATTED_EVENT_DATE.short}</span>
        </div>

        {/* Filete paralelo delicado próximo à junção central */}
        <div className="pointer-events-none absolute inset-y-6 left-2.5 w-px bg-gradient-to-b from-transparent via-[#B8C0CC]/80 to-transparent" />
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          BROCHE BARROCO PURO CENTRAL (ZERO FUNDO) + TEXTO CURVO À DIREITA
         ════════════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        <motion.div
          style={{ x: isIdle ? sealX : 0, y: isIdle ? sealY : 0 }}
          className="relative flex items-center justify-center"
        >
          {/* Explosão leve de brilhos azuis e prateados ao clicar/tocar */}
          {isAnimatingDoors && (
            <>
              {UNSEAL_SPARKS.map((spark, idx) => (
                <motion.svg
                  key={`spark-${idx}`}
                  viewBox="0 0 24 24"
                  initial={{ x: 0, y: 0, scale: 0.25, opacity: 0.95, rotate: 0 }}
                  animate={{
                    x: spark.x,
                    y: spark.y,
                    scale: [0.25, 1.14, 0.3],
                    opacity: [0, 1, 0],
                    rotate: spark.rot,
                  }}
                  transition={{
                    duration: 0.62,
                    delay: spark.delay,
                    ease: LUXURY_EASE,
                  }}
                  style={{ width: spark.size, height: spark.size }}
                  className="pointer-events-none absolute z-30"
                  aria-hidden
                >
                  <path
                    d="M12 0 C13.5 8 16 10.5 24 12 C16 13.5 13.5 16 12 24 C10.5 16 8 13.5 0 12 C8 10.5 10.5 8 12 0 Z"
                    fill={spark.color}
                  />
                </motion.svg>
              ))}
            </>
          )}

          {/* Botão Interativo do Broche Puro (sem fundo/círculo atrás) + Texto Curvo à Direita */}
          <motion.button
            type="button"
            onClick={handleTriggerOpen}
            disabled={!isIdle}
            aria-label={`Abrir convite de ${EVENT.name} — ${EVENT.age} Anos`}
            initial={false}
            animate={isIdle ? { scale: 1, opacity: 1 } : { scale: 1.12, opacity: 0 }}
            whileHover={isIdle ? { scale: 1.04 } : undefined}
            whileTap={isIdle ? { scale: 0.94 } : undefined}
            transition={
              isIdle
                ? { type: "spring", stiffness: 420, damping: 24, mass: 0.6 }
                : { duration: 0.34, ease: LUXURY_EASE }
            }
            style={{ willChange: isAnimatingDoors ? "transform, opacity" : "auto" }}
            className="pointer-events-auto group relative z-20 cursor-pointer rounded-full p-4 sm:p-5 outline-none focus-visible:ring-4 focus-visible:ring-[#0A2463]/35"
          >
            {/* Micro-flutuação vertical idle (~4.2s, GPU translate3d) */}
            <div className={isIdle ? "animate-crest-float relative" : "relative"}>
              <div className="relative aspect-[576/610] w-[clamp(150px,43vw,186px)] max-w-[30dvh] md:w-[206px]">
                {/* Broche Barroco Transparente em Madrepérola/Prata & "C" Azul Royal (zero fundo) */}
                <Image
                  src={CREST_SRC}
                  alt={`Brasão monograma ${EVENT.initial} de ${EVENT.name} — ${EVENT.age} anos`}
                  width={CREST_WIDTH}
                  height={CREST_HEIGHT}
                  priority
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                  sizes="(max-width: 767px) 186px, 206px"
                  draggable={false}
                  className="relative z-10 size-full object-contain transition-[filter] duration-300 ease-out [filter:drop-shadow(0_14px_22px_rgba(7,23,57,0.24))_drop-shadow(0_5px_9px_rgba(10,36,99,0.16))_drop-shadow(0_2px_3px_rgba(7,23,57,0.12))] group-hover:[filter:drop-shadow(0_20px_30px_rgba(7,23,57,0.30))_drop-shadow(0_8px_14px_rgba(10,36,99,0.20))_drop-shadow(0_3px_5px_rgba(7,23,57,0.14))]"
                />

                {/* Reflexo especular diagonal (shimmer) estritamente dentro do medalhão interno "C" */}
                {isIdle && !prefersReducedMotion && (
                  <div
                    className="pointer-events-none absolute top-1/2 left-1/2 z-20 aspect-square w-[42%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
                    aria-hidden
                  >
                    <div
                      className="animate-brooch-shimmer absolute -inset-y-8 left-0 w-[38%]"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 25%, rgba(255,255,255,0.56) 50%, rgba(147,197,253,0.16) 75%, transparent 100%)",
                      }}
                    />
                  </div>
                )}

                {/* Texto curvo "TOQUE PARA ABRIR" contornando exclusivamente a lateral direita */}
                <CurvedCrestCaption visible={isIdle} />
              </div>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
