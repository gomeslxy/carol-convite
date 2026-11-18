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
const CREST_WIDTH = 760;
const CREST_HEIGHT = 882;

const LUXURY_EASE = [0.22, 1, 0.36, 1] as const;

const DOOR_SPRING_TRANSITION = {
  type: "spring",
  stiffness: 62,
  damping: 16,
  mass: 1,
  restDelta: 0.2,
} as const;

const UNSEAL_SPARKS = [
  { x: -102, y: -58, size: 10, rot: -25, delay: 0, color: "#FFFFFF" },
  { x: 104, y: -50, size: 9, rot: 30, delay: 0.02, color: "#93C5FD" },
  { x: -118, y: 12, size: 8, rot: 15, delay: 0.04, color: "#CBD5E1" },
  { x: 118, y: 16, size: 10, rot: -18, delay: 0.02, color: "#FFFFFF" },
  { x: -82, y: 84, size: 9, rot: 42, delay: 0.05, color: "#1E40AF" },
  { x: 86, y: 78, size: 10, rot: -35, delay: 0.03, color: "#E2E8F0" },
  { x: -24, y: -112, size: 8, rot: 12, delay: 0.01, color: "#60A5FA" },
  { x: 30, y: -106, size: 9, rot: -14, delay: 0.04, color: "#FFFFFF" },
  { x: -34, y: 108, size: 8, rot: 22, delay: 0.02, color: "#B8C0CC" },
  { x: 28, y: 104, size: 9, rot: -20, delay: 0.05, color: "#93C5FD" },
] as const;

const AMBIENT_CREST_SPARKS = [
  { top: "12%", left: "16%", size: 10, color: "#1E40AF", delay: "0s", dur: "3.6s", desktopOnly: false },
  { top: "8%", left: "78%", size: 9, color: "#60A5FA", delay: "0.9s", dur: "4.1s", desktopOnly: false },
  { top: "48%", left: "4%", size: 8, color: "#94A3B8", delay: "1.5s", dur: "3.8s", desktopOnly: false },
  { top: "74%", left: "89%", size: 10, color: "#0A2463", delay: "0.5s", dur: "4.3s", desktopOnly: false },
  { top: "86%", left: "22%", size: 9, color: "#3B82F6", delay: "1.9s", dur: "3.9s", desktopOnly: false },
  { top: "24%", left: "88%", size: 8, color: "#FFFFFF", delay: "1.2s", dur: "3.5s", desktopOnly: false },
  { top: "30%", left: "9%", size: 7, color: "#FFFFFF", delay: "2.3s", dur: "4.2s", desktopOnly: true },
  { top: "90%", left: "66%", size: 8, color: "#93C5FD", delay: "0.7s", dur: "4.0s", desktopOnly: true },
  { top: "4%", left: "48%", size: 7, color: "#CBD5E1", delay: "1.7s", dur: "3.7s", desktopOnly: true },
  { top: "64%", left: "11%", size: 8, color: "#1E40AF", delay: "2.1s", dur: "4.4s", desktopOnly: true },
] as const;

const CORNER_ROTATION: Record<"tl" | "tr" | "bl" | "br", string> = {
  tl: "none",
  tr: "scale(-1, 1)",
  bl: "scale(1, -1)",
  br: "scale(-1, -1)",
};

/**
 * Ornamento barroco delicado com ramos estilizados e arabescos em Azul Royal & Prata
 * para emoldurar os cantos da capa sem poluir o centro.
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
      viewBox="0 0 88 88"
      className={`pointer-events-none select-none overflow-visible ${className}`}
      style={{ transform: CORNER_ROTATION[position] }}
      aria-hidden
    >
      {/* Moldura angular dupla prata & azul royal */}
      <path
        d="M 3 76 L 3 8 Q 3 3 8 3 L 76 3"
        fill="none"
        stroke="#B8C0CC"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M 10 58 L 10 14 L 14 10 L 58 10"
        fill="none"
        stroke="#0A2463"
        strokeOpacity="0.42"
        strokeWidth="0.95"
        strokeLinecap="round"
      />

      {/* Arabescos barrocos e folhagens delicadas em Prata e Azul Royal */}
      <path
        d="M 14 48 C 14 33, 21 21, 35 16 C 28 19, 21 27, 20 38"
        fill="none"
        stroke="#1E40AF"
        strokeOpacity="0.45"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <path
        d="M 48 14 C 33 14, 21 21, 16 35 C 19 28, 27 21, 38 20"
        fill="none"
        stroke="#94A3B8"
        strokeOpacity="0.85"
        strokeWidth="1.15"
        strokeLinecap="round"
      />

      {/* Folhas estilizadas sutis */}
      <path
        d="M 21 21 C 24 14, 31 14, 32 19 C 28 21, 24 22, 21 21 Z"
        fill="#0A2463"
        fillOpacity="0.28"
      />
      <path
        d="M 21 21 C 14 24, 14 31, 19 32 C 21 28, 22 24, 21 21 Z"
        fill="#1E40AF"
        fillOpacity="0.24"
      />
      <path
        d="M 14 30 C 16 34, 15 39, 12 41 C 11 37, 12 33, 14 30 Z"
        fill="#94A3B8"
        fillOpacity="0.52"
      />
      <path
        d="M 30 14 C 34 16, 39 15, 41 12 C 37 11, 33 12, 30 14 Z"
        fill="#94A3B8"
        fillOpacity="0.52"
      />

      {/* Voluta de remate e cristal lapidado no vértice */}
      <path
        d="M 10 6.5 L 13.5 10 L 10 13.5 L 6.5 10 Z"
        fill="#0A2463"
        fillOpacity="0.72"
      />
      <circle cx="24" cy="24" r="1.4" fill="#1E40AF" fillOpacity="0.55" />
    </svg>
  );
}

/**
 * Moldura perimetral e cantoneiras ornamentais de cada aba da capa bipartida.
 */
function CoverDoorFrame({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Vinheta sutil nas extremidades externas da folha de papel */}
      <div
        className="absolute inset-0"
        style={{
          background: isLeft
            ? "linear-gradient(90deg, rgba(7,23,57,0.065) 0%, transparent 24%), linear-gradient(180deg, rgba(7,23,57,0.045) 0%, transparent 18%, transparent 82%, rgba(7,23,57,0.055) 100%)"
            : "linear-gradient(270deg, rgba(7,23,57,0.065) 0%, transparent 24%), linear-gradient(180deg, rgba(7,23,57,0.045) 0%, transparent 18%, transparent 82%, rgba(7,23,57,0.055) 100%)",
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
        className={`absolute top-3.5 sm:top-6 size-14 sm:size-20 ${
          isLeft ? "left-3.5 sm:left-6" : "right-3.5 sm:right-6"
        }`}
      />
      <EditorialCornerOrnament
        position={isLeft ? "bl" : "br"}
        className={`absolute bottom-3.5 sm:bottom-6 size-14 sm:size-20 ${
          isLeft ? "left-3.5 sm:left-6" : "right-3.5 sm:right-6"
        }`}
      />
    </div>
  );
}

/**
 * Texto curvo "TOQUE PARA ABRIR" posicionado exclusivamente na lateral direita do brasão,
 * acompanhando em arco a curvatura externa direita do medalhão central (viewBox 760x882).
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
        {/* Arco direito concêntrico ao medalhão (centro 446.1, 429.4 | raio 288 | -53° a +23°) */}
        <path id={arcId} d="M 618.2,201.0 A 288,288 0 0 1 709.4,541.1" />
      </defs>

      <text
        fill="#071739"
        fontSize="30"
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
 *  - Portas bipartidas 50% / 50% em papel artesanal (#F4F5F7) com vinheta e
 *    junção central realista em alto-relevo + cantoneiras barrocas Royal & Prata.
 *  - Brasão barroco perolado com ornamentos externos em Azul Royal & Prata
 *    (zero dourado) + halo luminoso, reflexo especular diagonal (shimmer) e
 *    micropartículas cintilantes em GPU.
 *  - Chamada "TOQUE PARA ABRIR" contornando suavemente a lateral direita do selo.
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

    // 1. Dissolução do brasão + explosão leve de brilhos azuis e prateados (~340ms)
    setPhase("unsealing");
    confettiCleanupRef.current = fireLuxuryCelebration(confettiRef.current);

    const tl = gsap.timeline();
    timelineRef.current = tl;

    // 2. Abertura fluida das portas bipartidas com física spring
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

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`fixed inset-0 z-40 h-dvh w-screen overflow-hidden select-none touch-none ${isOpening ? "pointer-events-none" : "pointer-events-auto"
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
        <CoverDoorFrame side="left" />

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
        <CoverDoorFrame side="right" />

        {/* Data oficial discreta no canto inferior direito */}
        <div className="pointer-events-none absolute right-8 bottom-8 sm:right-14 sm:bottom-12 flex items-center gap-1.5 font-serif text-[9px] sm:text-[10px] tracking-[0.24em] text-[#071739]/68 uppercase">
          <span className="text-[#0A2463]/70">✦</span>
          <span>{FORMATTED_EVENT_DATE.short}</span>
        </div>

        {/* Filete paralelo delicado próximo à junção central */}
        <div className="pointer-events-none absolute inset-y-6 left-2.5 w-px bg-gradient-to-b from-transparent via-[#B8C0CC]/80 to-transparent" />
      </motion.div>

      {/* ════════════════════════════════════════════════════════════════════════
          BRASÃO BARROCO CENTRAL + HALO + SHIMMER + TEXTO CURVO À DIREITA
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

          {/* Botão Interativo do Brasão Barroco + Texto Curvo à Direita */}
          <motion.button
            type="button"
            onClick={handleTriggerOpen}
            disabled={!isIdle}
            aria-label={`Abrir convite de ${EVENT.name} — ${EVENT.age} Anos`}
            initial={false}
            animate={isIdle ? { scale: 1, opacity: 1 } : { scale: 1.12, opacity: 0 }}
            whileHover={isIdle ? { scale: 1.035 } : undefined}
            whileTap={isIdle ? { scale: 0.94 } : undefined}
            transition={
              isIdle
                ? { type: "spring", stiffness: 420, damping: 24, mass: 0.6 }
                : { duration: 0.34, ease: LUXURY_EASE }
            }
            style={{ willChange: isAnimatingDoors ? "transform, opacity" : "auto" }}
            className="pointer-events-auto group relative z-20 -translate-x-[3.5%] cursor-pointer rounded-full p-3 sm:p-5 outline-none focus-visible:ring-4 focus-visible:ring-[#0A2463]/35"
          >
            {/* Micro-flutuação vertical idle (~4.2s, GPU translate3d) */}
            <div className={isIdle ? "animate-crest-float relative" : "relative"}>
              <div className="relative aspect-[760/882] w-[clamp(226px,64vw,268px)] max-w-[44dvh] md:w-[300px]">
                {/* Halo luminoso suave em Azul Royal e Prata atrás do medalhão */}
                <div
                  className={`pointer-events-none absolute top-[48.7%] left-[58.7%] aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    isIdle && !prefersReducedMotion ? "animate-halo-pulse" : ""
                  }`}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.88) 0%, rgba(147,197,253,0.26) 42%, rgba(30,64,175,0.12) 66%, transparent 76%)",
                  }}
                  aria-hidden
                />

                {/* Micropartículas brilhantes flutuando discretamente ao redor (adaptativas no mobile) */}
                {isIdle && !prefersReducedMotion && (
                  <div className="pointer-events-none absolute inset-0" aria-hidden>
                    {AMBIENT_CREST_SPARKS.map((sp, idx) => (
                      <svg
                        key={`ambient-${idx}`}
                        viewBox="0 0 24 24"
                        style={{
                          top: sp.top,
                          left: sp.left,
                          width: sp.size,
                          height: sp.size,
                          animationDelay: sp.delay,
                          animationDuration: sp.dur,
                        }}
                        className={`animate-spark-twinkle pointer-events-none absolute ${
                          sp.desktopOnly ? "hidden sm:block" : "block"
                        }`}
                      >
                        <path
                          d="M12 0 C13.5 8 16 10.5 24 12 C16 13.5 13.5 16 12 24 C10.5 16 8 13.5 0 12 C8 10.5 10.5 8 12 0 Z"
                          fill={sp.color}
                        />
                      </svg>
                    ))}
                  </div>
                )}

                {/* Brasão Barroco com ornamentos externos Royal & Prata (FCP prioritário) */}
                <Image
                  src={CREST_SRC}
                  alt={`Brasão monograma ${EVENT.initial} de ${EVENT.name} — ${EVENT.age} anos`}
                  width={CREST_WIDTH}
                  height={CREST_HEIGHT}
                  priority
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                  sizes="(max-width: 767px) 268px, 300px"
                  draggable={false}
                  className="relative z-10 size-full object-contain transition-[filter] duration-300 ease-out [filter:drop-shadow(0_16px_24px_rgba(7,23,57,0.22))_drop-shadow(0_6px_10px_rgba(10,36,99,0.14))_drop-shadow(0_2px_4px_rgba(7,23,57,0.10))] group-hover:[filter:drop-shadow(0_22px_32px_rgba(7,23,57,0.28))_drop-shadow(0_8px_14px_rgba(10,36,99,0.18))_drop-shadow(0_3px_6px_rgba(7,23,57,0.14))]"
                />

                {/* Reflexo especular diagonal (shimmer) passando suavemente pelo esmalte do selo */}
                {isIdle && !prefersReducedMotion && (
                  <div
                    className="pointer-events-none absolute top-[48.7%] left-[58.7%] z-20 aspect-square w-[58%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
                    aria-hidden
                  >
                    <div
                      className="animate-brooch-shimmer absolute -inset-y-8 left-0 w-[38%]"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0.62) 50%, rgba(147,197,253,0.18) 75%, transparent 100%)",
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
