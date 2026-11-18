"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useScrollLock } from "@/components/SmoothScrollProvider";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";

type GatePhase = "idle" | "unsealing" | "opening";

export interface CoverGateProps {
  /** Disparado quando as duas portas já abriram o suficiente para revelar a coreografia do pôster. */
  onOpenStart: () => void;
  /** Disparado quando a abertura bipartida conclui e o scroll (Lenis) é liberado. */
  onOpenComplete: () => void;
}

const CREST_SRC = "/images/brasao-barroco-c.png";
const CREST_WIDTH = 576;
const CREST_HEIGHT = 610;

const BACKDROP_SRC = "/images/cover-ornament-backdrop-right.png";
const BACKDROP_WIDTH = 370;
const BACKDROP_HEIGHT = 1404;

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

const DOOR_OPEN_TRANSITION = {
  duration: 1.95,
  ease: LUXURY_EASE,
} as const;

const UNSEAL_SPARKS = [
  { x: -116, y: -68, size: 11, rot: -25, delay: 0, color: "#FFFFFF" },
  { x: 118, y: -58, size: 10, rot: 30, delay: 0.04, color: "#93C5FD" },
  { x: -134, y: 14, size: 9, rot: 15, delay: 0.08, color: "#CBD5E1" },
  { x: 136, y: 18, size: 11, rot: -18, delay: 0.04, color: "#FFFFFF" },
  { x: -94, y: 92, size: 10, rot: 42, delay: 0.1, color: "#1E40AF" },
  { x: 98, y: 88, size: 11, rot: -35, delay: 0.05, color: "#E2E8F0" },
  { x: -28, y: -124, size: 9, rot: 12, delay: 0.03, color: "#60A5FA" },
  { x: 34, y: -118, size: 10, rot: -14, delay: 0.08, color: "#FFFFFF" },
  { x: -38, y: 120, size: 9, rot: 22, delay: 0.05, color: "#B8C0CC" },
  { x: 32, y: 116, size: 10, rot: -20, delay: 0.09, color: "#93C5FD" },
  { x: -70, y: -102, size: 8, rot: 18, delay: 0.11, color: "#3B82F6" },
  { x: 76, y: -96, size: 8, rot: -22, delay: 0.07, color: "#FFFFFF" },
  { x: -72, y: 108, size: 8, rot: 28, delay: 0.11, color: "#CBD5E1" },
  { x: 74, y: 104, size: 8, rot: -26, delay: 0.08, color: "#60A5FA" },
] as const;

const CORNER_ROTATION: Record<"tl" | "tr" | "bl" | "br", string> = {
  tl: "none",
  tr: "scale(-1, 1)",
  bl: "scale(1, -1)",
  br: "scale(-1, -1)",
};

/**
 * Cantoneira arquitetônica minimalista em prata fosca (#B8C0CC) e azul royal (#0A2463).
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
      width={48}
      height={48}
      viewBox="0 0 48 48"
      className={`pointer-events-none aspect-square select-none overflow-visible ${className}`}
      style={{ transform: CORNER_ROTATION[position] }}
      aria-hidden
    >
      <path
        d="M 2 42 L 2 5 Q 2 2 5 2 L 42 2"
        fill="none"
        stroke="#B8C0CC"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M 8 32 L 8 11 L 11 8 L 32 8"
        fill="none"
        stroke="#0A2463"
        strokeOpacity="0.4"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M 8 5.2 L 10.8 8 L 8 10.8 L 5.2 8 Z"
        fill="#0A2463"
        fillOpacity="0.68"
      />
    </svg>
  );
}

/**
 * Moldura perimetral das portas bipartidas.
 * Na porta direita (`side === "right"`), acopla a metade direita cortada da ilustração
 * colada exatamente na divisória central vertical do site (`left-0`).
 */
function CoverDoorFrame({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: isLeft
            ? "linear-gradient(90deg, rgba(7,23,57,0.055) 0%, transparent 24%), linear-gradient(180deg, rgba(7,23,57,0.04) 0%, transparent 18%, transparent 82%, rgba(7,23,57,0.05) 100%)"
            : "linear-gradient(270deg, rgba(7,23,57,0.055) 0%, transparent 24%), linear-gradient(180deg, rgba(7,23,57,0.04) 0%, transparent 18%, transparent 82%, rgba(7,23,57,0.05) 100%)",
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

      {!isLeft && (
        <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 aspect-[370/1404] w-[96%] max-w-[205px] md:w-[225px] select-none">
          <Image
            src={BACKDROP_SRC}
            alt=""
            width={BACKDROP_WIDTH}
            height={BACKDROP_HEIGHT}
            priority
            fetchPriority="high"
            loading="eager"
            decoding="sync"
            sizes="(max-width: 767px) 205px, 225px"
            draggable={false}
            className="size-full object-contain object-left"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Texto curvo "TOQUE PARA ABRIR" contornando suavemente a lateral direita do broche
 * em área limpa sobre o papel claro.
 */
function CurvedCrestCaption({ visible }: { visible: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const arcId = `crest-right-arc-${uid}`;

  return (
    <motion.svg
      width={CREST_WIDTH}
      height={CREST_HEIGHT}
      viewBox={`0 0 ${CREST_WIDTH} ${CREST_HEIGHT}`}
      initial={false}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.35, ease: LUXURY_EASE }}
      className="pointer-events-none absolute inset-0 size-full overflow-visible select-none"
      aria-hidden
    >
      <defs>
        <path id={arcId} d="M 504.8,64.2 A 324,324 0 0 1 556.6,486.2" />
      </defs>

      <text
        fill="#071739"
        stroke="#F4F5F7"
        strokeOpacity="0.92"
        strokeWidth="12"
        strokeLinejoin="round"
        fontSize="31"
        fontWeight={600}
        className="animate-breathe-soft font-serif uppercase"
        style={{ letterSpacing: "0.17em", paintOrder: "stroke fill" }}
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
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function CoverGate({ onOpenStart, onOpenComplete }: CoverGateProps) {
  const [phase, setPhase] = useState<GatePhase>("idle");
  const prefersReducedMotion = useReducedMotion();

  const isOpeningRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const onOpenStartRef = useRef(onOpenStart);
  const onOpenCompleteRef = useRef(onOpenComplete);

  onOpenStartRef.current = onOpenStart;
  onOpenCompleteRef.current = onOpenComplete;

  // Destrava o scroll assim que as portas já abriram o centro para evitar sensação de travamento
  useScrollLock(phase !== "opening");

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) {
      window.clearTimeout(id);
    }
    timersRef.current = [];
  }, []);

  const scheduleTimer = useCallback((cb: () => void, delayMs: number) => {
    const id = window.setTimeout(cb, delayMs);
    timersRef.current.push(id);
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

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
    clearTimers();

    sealRawX.set(0);
    sealRawY.set(0);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(16);
    }

    const reducedMotion =
      prefersReducedMotion ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (reducedMotion) {
      setPhase("opening");
      onOpenStartRef.current();
      scheduleTimer(() => onOpenCompleteRef.current(), 250);
      return;
    }

    // 1. Destrave limpo do broche + ondas de choque + fagulhas estelares (sem confetes)
    setPhase("unsealing");

    // 2. Abertura lenta e fluida das portas (e liberação imediata do scroll)
    scheduleTimer(() => {
      setPhase("opening");
    }, 580);

    // 3. Disparo do HeroPoster em plena visibilidade
    scheduleTimer(() => {
      onOpenStartRef.current();
    }, 950);

    // 4. Desmontagem do overlay após as portas deixarem a tela
    scheduleTimer(() => {
      onOpenCompleteRef.current();
    }, 2600);
  }, [clearTimers, prefersReducedMotion, scheduleTimer, sealRawX, sealRawY]);

  const isIdle = phase === "idle";
  const isUnsealing = phase === "unsealing";
  const isOpening = phase === "opening";
  const isAnimatingDoors = isUnsealing || isOpening;

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`fixed inset-0 z-40 h-dvh w-screen overflow-hidden select-none ${
        isOpening ? "pointer-events-none" : "pointer-events-auto touch-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`Capa do convite de ${EVENT.name} — ${EVENT.age} Anos`}
    >
      <motion.div
        initial={false}
        animate={{ x: isOpening ? "-102%" : "0%" }}
        transition={DOOR_OPEN_TRANSITION}
        style={{ willChange: isAnimatingDoors ? "transform" : "auto" }}
        className="bg-paper-fine absolute inset-y-0 left-0 z-20 w-1/2 overflow-hidden border-r border-[#B8C0CC]/80 shadow-[inset_-1px_0_0_rgba(255,255,255,0.92),inset_-12px_0_22px_-14px_rgba(7,23,57,0.16),8px_0_28px_-6px_rgba(7,23,57,0.28),2px_0_6px_-2px_rgba(7,23,57,0.15)]"
        aria-hidden
      >
        <CoverDoorFrame side="left" />

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

        <div className="pointer-events-none absolute inset-y-6 right-2.5 w-px bg-gradient-to-b from-transparent via-[#B8C0CC]/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#0A2463]/32 to-transparent" />
      </motion.div>

      <motion.div
        initial={false}
        animate={{ x: isOpening ? "102%" : "0%" }}
        transition={DOOR_OPEN_TRANSITION}
        style={{ willChange: isAnimatingDoors ? "transform" : "auto" }}
        className="bg-paper-fine absolute inset-y-0 right-0 z-10 w-1/2 overflow-hidden shadow-[inset_18px_0_30px_-12px_rgba(7,23,57,0.26),inset_3px_0_6px_-1px_rgba(7,23,57,0.14)]"
        aria-hidden
      >
        <CoverDoorFrame side="right" />

        <div className="pointer-events-none absolute right-7 bottom-7 sm:right-12 sm:bottom-11 flex items-center gap-1.5 font-serif text-[9px] sm:text-[10px] tracking-[0.24em] text-[#071739]/68 uppercase">
          <span className="text-[#0A2463]/70">✦</span>
          <span>{FORMATTED_EVENT_DATE.short}</span>
        </div>

        <div className="pointer-events-none absolute inset-y-6 left-2.5 w-px bg-gradient-to-b from-transparent via-[#B8C0CC]/80 to-transparent" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        <motion.div
          style={{ x: isIdle ? sealX : 0, y: isIdle ? sealY : 0 }}
          className="relative flex items-center justify-center"
        >
          {isAnimatingDoors && (
            <>
              <motion.span
                initial={{ scale: 0.65, opacity: 0.78 }}
                animate={{ scale: 3.1, opacity: 0 }}
                transition={{ duration: 1.45, ease: LUXURY_EASE }}
                className="pointer-events-none absolute size-36 sm:size-44 rounded-full border-2 border-[#60A5FA]/70"
                aria-hidden
              />
              <motion.span
                initial={{ scale: 0.55, opacity: 0.7 }}
                animate={{ scale: 3.6, opacity: 0 }}
                transition={{ duration: 1.7, delay: 0.14, ease: LUXURY_EASE }}
                className="pointer-events-none absolute size-36 sm:size-44 rounded-full border border-[#CBD5E1]/85"
                aria-hidden
              />

              {UNSEAL_SPARKS.map((spark, idx) => (
                <motion.svg
                  key={`spark-${idx}`}
                  width={spark.size}
                  height={spark.size}
                  viewBox="0 0 24 24"
                  initial={{ x: 0, y: 0, scale: 0.25, opacity: 0.95, rotate: 0 }}
                  animate={{
                    x: spark.x,
                    y: spark.y,
                    scale: [0.25, 1.28, 0.25],
                    opacity: [0, 1, 0],
                    rotate: spark.rot,
                  }}
                  transition={{
                    duration: 1.35,
                    delay: spark.delay,
                    ease: LUXURY_EASE,
                  }}
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

          <motion.button
            type="button"
            onClick={handleTriggerOpen}
            disabled={!isIdle}
            aria-label={`Abrir convite de ${EVENT.name} — ${EVENT.age} Anos`}
            initial={false}
            animate={
              isIdle
                ? { scale: 1, opacity: 1, rotate: 0 }
                : { scale: [1, 1.2, 0.88], opacity: [1, 1, 0], rotate: [0, -5, 7] }
            }
            whileHover={isIdle ? { scale: 1.04 } : undefined}
            whileTap={isIdle ? { scale: 0.92 } : undefined}
            transition={
              isIdle
                ? { type: "spring", stiffness: 420, damping: 24, mass: 0.6 }
                : { duration: 0.72, ease: LUXURY_EASE }
            }
            style={{ willChange: isAnimatingDoors ? "transform, opacity" : "auto" }}
            className="pointer-events-auto group relative z-20 cursor-pointer rounded-full p-4 sm:p-5 outline-none focus-visible:ring-4 focus-visible:ring-[#0A2463]/35"
          >
            <div className={isIdle ? "animate-crest-float relative" : "relative"}>
              <div className="relative aspect-[576/610] w-[clamp(150px,43vw,186px)] max-w-[30dvh] md:w-[206px]">
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
                  className="relative z-10 size-full object-contain [filter:drop-shadow(0_14px_22px_rgba(7,23,57,0.24))_drop-shadow(0_5px_9px_rgba(10,36,99,0.16))_drop-shadow(0_2px_3px_rgba(7,23,57,0.12))]"
                />

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

                <CurvedCrestCaption visible={isIdle} />
              </div>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
