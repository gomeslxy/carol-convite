"use client";

import type confettiType from "canvas-confetti";
import { motion, useMotionValue, useSpring } from "framer-motion";
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

const DOOR_TRANSITION = {
  duration: 0.95,
  ease: LUXURY_EASE,
} as const;

const UNSEAL_SPARKS = [
  { x: -88, y: -52, size: 10, rot: -25, delay: 0, color: "#FFFFFF" },
  { x: 92, y: -46, size: 9, rot: 30, delay: 0.02, color: "#93C5FD" },
  { x: -104, y: 10, size: 8, rot: 15, delay: 0.04, color: "#B8C0CC" },
  { x: 106, y: 14, size: 10, rot: -18, delay: 0.02, color: "#FFFFFF" },
  { x: -72, y: 74, size: 9, rot: 42, delay: 0.05, color: "#3B82F6" },
  { x: 76, y: 70, size: 10, rot: -35, delay: 0.03, color: "#E2E8F0" },
  { x: -22, y: -98, size: 8, rot: 12, delay: 0.01, color: "#60A5FA" },
  { x: 28, y: -94, size: 9, rot: -14, delay: 0.04, color: "#FFFFFF" },
  { x: -30, y: 96, size: 8, rot: 22, delay: 0.02, color: "#B8C0CC" },
  { x: 26, y: 94, size: 9, rot: -20, delay: 0.05, color: "#93C5FD" },
] as const;

const CORNER_ROTATION: Record<"tl" | "tr" | "bl" | "br", string> = {
  tl: "none",
  tr: "scale(-1, 1)",
  bl: "scale(1, -1)",
  br: "scale(-1, -1)",
};

/**
 * Cantoneira linear minimalista em prata fosca (#B8C0CC) e azul royal (#0A2463)
 * para enquadramento editorial das extremidades sem poluir o centro.
 */
function EditorialCornerBracket({
  position,
  className = "",
}: {
  position: "tl" | "tr" | "bl" | "br";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`pointer-events-none select-none overflow-visible ${className}`}
      style={{ transform: CORNER_ROTATION[position] }}
      aria-hidden
    >
      <path
        d="M 2 44 L 2 5 Q 2 2 5 2 L 44 2"
        fill="none"
        stroke="#B8C0CC"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M 8 34 L 8 11 L 11 8 L 34 8"
        fill="none"
        stroke="#0A2463"
        strokeOpacity="0.48"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M 8 5.2 L 10.8 8 L 8 10.8 L 5.2 8 Z"
        fill="#0A2463"
        fillOpacity="0.72"
      />
    </svg>
  );
}

/**
 * Moldura perimetral minimalista de cada aba da capa bipartida.
 */
function CoverDoorFrame({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className={`absolute top-3.5 bottom-3.5 sm:top-6 sm:bottom-6 border-[#B8C0CC]/70 ${
          isLeft
            ? "left-3.5 sm:left-6 right-2.5 border-y border-l"
            : "right-3.5 sm:right-6 left-2.5 border-y border-r"
        }`}
      />
      <div
        className={`absolute top-5 bottom-5 sm:top-8 sm:bottom-8 border-[#0A2463]/16 ${
          isLeft
            ? "left-5 sm:left-8 right-4 border-y border-l"
            : "right-5 sm:right-8 left-4 border-y border-r"
        }`}
      />

      <EditorialCornerBracket
        position={isLeft ? "tl" : "tr"}
        className={`absolute top-3.5 sm:top-6 size-9 sm:size-12 ${
          isLeft ? "left-3.5 sm:left-6" : "right-3.5 sm:right-6"
        }`}
      />
      <EditorialCornerBracket
        position={isLeft ? "bl" : "br"}
        className={`absolute bottom-3.5 sm:bottom-6 size-9 sm:size-12 ${
          isLeft ? "left-3.5 sm:left-6" : "right-3.5 sm:right-6"
        }`}
      />
    </div>
  );
}

/**
 * Texto curvo "TOQUE PARA ABRIR" contornando suavemente a base do brasão
 * com arco delicado superior em prata fosca (#B8C0CC).
 */
function CurvedCrestCaption({ visible }: { visible: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const arcId = `crest-text-arc-${uid}`;

  return (
    <motion.svg
      viewBox="0 0 240 240"
      initial={false}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.25, ease: LUXURY_EASE }}
      className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[138%] -translate-x-1/2 -translate-y-1/2 overflow-visible select-none"
      aria-hidden
    >
      <defs>
        {/* Arco inferior concêntrico sentido anti-horário (esquerda -> direita) contornando o brasão */}
        <path id={arcId} d="M 10,120 A 110,110 0 0 0 230,120" />
      </defs>

      {/* Arco sutil superior concêntrico em prata fosca (#B8C0CC) */}
      <path
        d="M 38.8,51.9 A 106,106 0 0 1 201.2,51.9"
        fill="none"
        stroke="#B8C0CC"
        strokeOpacity="0.6"
        strokeWidth="0.85"
        strokeLinecap="round"
      />

      <text
        fill="#071739"
        className="animate-breathe-soft font-serif text-[9.5px] font-semibold uppercase"
        style={{ letterSpacing: "0.22em" }}
      >
        <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
          ✦ TOQUE PARA ABRIR ✦
        </textPath>
      </text>
    </motion.svg>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CAPA DE ABERTURA BIPARTIDA (CoverGate)
 *  - Portas bipartidas 50% / 50% em papel texturizado off-white/pérola (#F4F5F7).
 *  - Junção central realista com sombra interna (inset) e filete prata/marinho.
 *  - Brasão barroco perolado com coroa e letra "C" em azul royal (PNG transparente,
 *    priority + drop-shadow multicamada sem efeitos de brilho extras).
 *  - Chamada "TOQUE PARA ABRIR" contornando o brasão em arco circular.
 *  - Coreografia 60fps: micro-flutuação idle, tap spring, dispersão em 350ms e
 *    abertura cinematográfica das portas em 950ms (cubic-bezier 0.22, 1, 0.36, 1).
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function CoverGate({ onOpenStart, onOpenComplete }: CoverGateProps) {
  const [phase, setPhase] = useState<GatePhase>("idle");

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
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      setPhase("opening");
      onOpenStartRef.current();
      const tl = gsap.timeline();
      tl.call(() => onOpenCompleteRef.current(), undefined, 0.2);
      timelineRef.current = tl;
      return;
    }

    // 1. Dissolução do brasão + partículas prateadas e azul royal (~350ms)
    setPhase("unsealing");
    confettiCleanupRef.current = fireLuxuryCelebration(confettiRef.current);

    const tl = gsap.timeline();
    timelineRef.current = tl;

    // 2. Deslizamento cinematográfico das portas bipartidas (duration: 950ms)
    tl.call(
      () => {
        setPhase("opening");
        onOpenStartRef.current();
      },
      undefined,
      0.35,
    );

    // 3. Desmontagem limpa e liberação do scroll ao término da transição
    tl.call(() => onOpenCompleteRef.current(), undefined, 1.32);
  }, [sealRawX, sealRawY]);

  const isIdle = phase === "idle";
  const isUnsealing = phase === "unsealing";
  const isOpening = phase === "opening";
  const isAnimatingDoors = isUnsealing || isOpening;

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
          PORTA ESQUERDA (50% — sobreposta à direita com junção editorial realista)
         ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={false}
        animate={{ x: isOpening ? "-102%" : "0%" }}
        transition={DOOR_TRANSITION}
        style={{ willChange: isAnimatingDoors ? "transform" : "auto" }}
        className="bg-paper-fine absolute inset-y-0 left-0 z-20 w-1/2 overflow-hidden border-r border-[#B8C0CC]/75 shadow-[inset_-1px_0_0_rgba(255,255,255,0.88),inset_-10px_0_18px_-14px_rgba(7,23,57,0.14),6px_0_22px_-6px_rgba(7,23,57,0.22)]"
        aria-hidden
      >
        <CoverDoorFrame side="left" />

        {/* Identidade sutil no canto superior esquerdo */}
        <div className="pointer-events-none absolute top-7 left-7 sm:top-11 sm:left-12 flex flex-col items-start">
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

        {/* Filete delicado em prata/azul-marinho na junção central */}
        <div className="pointer-events-none absolute inset-y-6 right-2.5 w-px bg-gradient-to-b from-transparent via-[#B8C0CC]/75 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#0A2463]/28 to-transparent" />
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          PORTA DIREITA (50% — sombra interna de oclusão na linha de encontro)
         ════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={false}
        animate={{ x: isOpening ? "102%" : "0%" }}
        transition={DOOR_TRANSITION}
        style={{ willChange: isAnimatingDoors ? "transform" : "auto" }}
        className="bg-paper-fine absolute inset-y-0 right-0 z-10 w-1/2 overflow-hidden shadow-[inset_14px_0_24px_-12px_rgba(7,23,57,0.22),inset_2px_0_4px_-1px_rgba(7,23,57,0.10)]"
        aria-hidden
      >
        <CoverDoorFrame side="right" />

        {/* Data oficial sutil no canto inferior direito */}
        <div className="pointer-events-none absolute right-7 bottom-7 sm:right-12 sm:bottom-11 flex items-center gap-1.5 font-serif text-[9px] sm:text-[10px] tracking-[0.24em] text-[#071739]/65 uppercase">
          <span className="text-[#0A2463]/65">✦</span>
          <span>{FORMATTED_EVENT_DATE.short}</span>
        </div>

        {/* Filete paralelo delicado próximo à junção central */}
        <div className="pointer-events-none absolute inset-y-6 left-2.5 w-px bg-gradient-to-b from-transparent via-[#B8C0CC]/75 to-transparent" />
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          BRASÃO BARROCO CENTRAL + TEXTO EM ARCO CONTORNANDO O BRASÃO
         ════════════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        <motion.div
          style={{ x: isIdle ? sealX : 0, y: isIdle ? sealY : 0 }}
          className="relative flex items-center justify-center"
        >
          {/* Dispersão sutil de partículas ao destravar */}
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
                    scale: [0.25, 1.12, 0.3],
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

          {/* Botão Interativo do Brasão Barroco + Texto curvo contornando */}
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
                : { duration: 0.35, ease: LUXURY_EASE }
            }
            style={{ willChange: isAnimatingDoors ? "transform, opacity" : "auto" }}
            className="pointer-events-auto group relative z-20 cursor-pointer rounded-full p-5 sm:p-6 outline-none focus-visible:ring-4 focus-visible:ring-[#0A2463]/35"
          >
            {/* Micro-flutuação vertical idle (~4.2s, y: [-3, 3]) */}
            <div className={isIdle ? "animate-crest-float relative" : "relative"}>
              <div className="relative aspect-[576/610] w-[clamp(124px,34vw,152px)] max-w-[30dvh] md:w-[164px]">
                <Image
                  src={CREST_SRC}
                  alt={`Brasão monograma ${EVENT.initial} de ${EVENT.name} — ${EVENT.age} anos`}
                  width={CREST_WIDTH}
                  height={CREST_HEIGHT}
                  priority
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                  sizes="(max-width: 767px) 152px, 164px"
                  draggable={false}
                  className="size-full object-contain transition-[filter] duration-300 ease-out [filter:drop-shadow(0_14px_22px_rgba(7,23,57,0.22))_drop-shadow(0_5px_9px_rgba(10,36,99,0.14))_drop-shadow(0_2px_3px_rgba(7,23,57,0.12))] group-hover:[filter:drop-shadow(0_20px_30px_rgba(7,23,57,0.28))_drop-shadow(0_8px_14px_rgba(10,36,99,0.18))_drop-shadow(0_3px_5px_rgba(7,23,57,0.14))]"
                />

                {/* Texto curvo "TOQUE PARA ABRIR" contornando o brasão */}
                <CurvedCrestCaption visible={isIdle} />
              </div>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
