"use client";

import { m, useMotionValue, useSpring } from "framer-motion";
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
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";
import { triggerHaptic } from "@/lib/utils";
import crestImage from "../../public/images/brasao-barroco-c.webp";
import backdropImage from "../../public/images/cover-ornament-backdrop-right.webp";

type GatePhase = "idle" | "unsealing" | "opening";

export interface CoverGateProps {
  /** Libera a coreografia de entrada da capa no instante em que o Preloader inicia seu fade-out. */
  ready?: boolean;
  /** Disparado quando as duas portas já abriram o suficiente para revelar a coreografia do pôster. */
  onOpenStart: () => void;
  /** Disparado quando a abertura bipartida conclui e o scroll (Lenis) é liberado. */
  onOpenComplete: () => void;
}

const CREST_WIDTH = 576;
const CREST_HEIGHT = 610;

const BACKDROP_WIDTH = 370;
const BACKDROP_HEIGHT = 1404;

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

const DOOR_OPEN_TRANSITION = {
  duration: 1.95,
  ease: LUXURY_EASE,
} as const;

const CREST_DROP_SHADOW =
  "drop-shadow(0 14px 22px rgba(7,23,57,0.24)) drop-shadow(0 5px 9px rgba(10,36,99,0.16)) drop-shadow(0 2px 3px rgba(7,23,57,0.12))";

const GPU_LAYER_STYLE = {
  transform: "translate3d(0, 0, 0)",
  backfaceVisibility: "hidden" as const,
  WebkitBackfaceVisibility: "hidden" as const,
};

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
function CoverDoorFrame({
  side,
  ready,
  reducedMotion,
  backdropError,
  onBackdropError,
}: {
  side: "left" | "right";
  ready: boolean;
  reducedMotion: boolean;
  backdropError: boolean;
  onBackdropError: () => void;
}) {
  const isLeft = side === "left";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Vinheta sutil nas bordas externas do papel */}
      <div
        className="absolute inset-0"
        style={{
          background: isLeft
            ? "linear-gradient(90deg, rgba(7,23,57,0.055) 0%, transparent 24%), linear-gradient(180deg, rgba(7,23,57,0.04) 0%, transparent 18%, transparent 82%, rgba(7,23,57,0.05) 100%)"
            : "linear-gradient(270deg, rgba(7,23,57,0.055) 0%, transparent 24%), linear-gradient(180deg, rgba(7,23,57,0.04) 0%, transparent 18%, transparent 82%, rgba(7,23,57,0.05) 100%)",
        }}
      />

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{
          duration: reducedMotion ? 0.15 : 0.6,
          delay: ready ? 0.05 : 0,
          ease: LUXURY_EASE,
        }}
        className="pointer-events-none absolute inset-0"
      >
        <div
          className={`absolute top-[max(0.875rem,env(safe-area-inset-top))] bottom-[max(0.875rem,env(safe-area-inset-bottom))] sm:top-[max(1.5rem,env(safe-area-inset-top))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] border-[#B8C0CC]/75 ${isLeft
            ? "left-[max(0.875rem,env(safe-area-inset-left))] sm:left-[max(1.5rem,env(safe-area-inset-left))] right-2.5 border-y border-l"
            : "right-[max(0.875rem,env(safe-area-inset-right))] sm:right-[max(1.5rem,env(safe-area-inset-right))] left-2.5 border-y border-r"
            }`}
        />
        <div
          className={`absolute top-[max(1.25rem,calc(0.375rem+env(safe-area-inset-top)))] bottom-[max(1.25rem,calc(0.375rem+env(safe-area-inset-bottom)))] sm:top-[max(2rem,calc(0.5rem+env(safe-area-inset-top)))] sm:bottom-[max(2rem,calc(0.5rem+env(safe-area-inset-bottom)))] border-[#0A2463]/16 ${isLeft
            ? "left-[max(1.25rem,calc(0.375rem+env(safe-area-inset-left)))] sm:left-[max(2rem,calc(0.5rem+env(safe-area-inset-left)))] right-4 border-y border-l"
            : "right-[max(1.25rem,calc(0.375rem+env(safe-area-inset-right)))] sm:right-[max(2rem,calc(0.5rem+env(safe-area-inset-right)))] left-4 border-y border-r"
            }`}
        />

        <EditorialCornerBracket
          position={isLeft ? "tl" : "tr"}
          className={`absolute top-[max(0.875rem,env(safe-area-inset-top))] sm:top-[max(1.5rem,env(safe-area-inset-top))] size-9 sm:size-12 ${isLeft
            ? "left-[max(0.875rem,env(safe-area-inset-left))] sm:left-[max(1.5rem,env(safe-area-inset-left))]"
            : "right-[max(0.875rem,env(safe-area-inset-right))] sm:right-[max(1.5rem,env(safe-area-inset-right))]"
            }`}
        />
        <EditorialCornerBracket
          position={isLeft ? "bl" : "br"}
          className={`absolute bottom-[max(0.875rem,env(safe-area-inset-bottom))] sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] size-9 sm:size-12 ${isLeft
            ? "left-[max(0.875rem,env(safe-area-inset-left))] sm:left-[max(1.5rem,env(safe-area-inset-left))]"
            : "right-[max(0.875rem,env(safe-area-inset-right))] sm:right-[max(1.5rem,env(safe-area-inset-right))]"
            }`}
        />
      </m.div>

      {/* Metade direita cortada colada na divisória central vertical da porta direita (left-0) */}
      {!isLeft && !backdropError && (
        <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 aspect-[370/1404] w-[96%] max-w-[205px] md:w-[225px] select-none">
          <m.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
            transition={{
              duration: reducedMotion ? 0.15 : 0.65,
              delay: ready ? 0.06 : 0,
              ease: LUXURY_EASE,
            }}
            className="size-full"
          >
            <Image
              src={backdropImage}
              alt=""
              width={BACKDROP_WIDTH}
              height={BACKDROP_HEIGHT}
              unoptimized
              fetchPriority="high"
              loading="eager"
              decoding="sync"
              data-critical-asset="backdrop"
              sizes="(max-width: 767px) 205px, 225px"
              draggable={false}
              onError={onBackdropError}
              style={GPU_LAYER_STYLE}
              className="size-full object-contain object-left"
            />
          </m.div>
        </div>
      )}
    </div>
  );
}

/**
 * Texto curvo "TOQUE PARA ABRIR" contornando suavemente a lateral direita do broche
 * em área limpa sobre o papel claro.
 */
function CurvedCrestCaption({
  visible,
  isIdle,
  reducedMotion,
}: {
  visible: boolean;
  isIdle: boolean;
  reducedMotion: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const arcId = `crest-right-arc-${uid}`;

  return (
    <m.svg
      width={CREST_WIDTH}
      height={CREST_HEIGHT}
      viewBox={`0 0 ${CREST_WIDTH} ${CREST_HEIGHT}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={
        visible
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: isIdle ? 0.95 : 1.06 }
      }
      transition={{
        duration: reducedMotion ? 0.15 : visible ? 0.55 : 0.35,
        delay: visible && !reducedMotion ? 0.28 : 0,
        ease: LUXURY_EASE,
      }}
      className="pointer-events-none absolute inset-0 size-full overflow-visible select-none"
      aria-hidden
    >
      <defs>
        {/* Arco direito concêntrico ao selo (centro 288, 305 | raio 324 | -48° a +34°) */}
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
        textRendering="geometricPrecision"
        className={`${visible && !reducedMotion ? "animate-breathe-soft " : ""}font-serif uppercase`}
        style={{ letterSpacing: "0.17em", paintOrder: "stroke fill" }}
      >
        <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
          TOQUE PARA ABRIR
        </textPath>
      </text>
    </m.svg>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CAPA DE ABERTURA BIPARTIDA (CoverGate)
 *  - Portas bipartidas 50% / 50% em papel artesanal (#F4F5F7); porta direita
 *    acopla a metade direita cortada da ilustração colada à divisória central.
 *  - Broche central puro em Madrepérola/Prata & "C" Azul Royal (zero fundo).
 *  - Chamada "TOQUE PARA ABRIR" contornando suavemente a lateral direita do selo.
 *  - Abertura fluida por GPU transform e liberação imediata do Lenis.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function CoverGate({
  ready = true,
  onOpenStart,
  onOpenComplete,
}: CoverGateProps) {
  const [phase, setPhase] = useState<GatePhase>("idle");
  const [backdropError, setBackdropError] = useState(false);
  const [crestError, setCrestError] = useState(false);
  const reducedMotion = useSafeReducedMotion();

  const isOpeningRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const onOpenStartRef = useRef(onOpenStart);
  const onOpenCompleteRef = useRef(onOpenComplete);

  onOpenStartRef.current = onOpenStart;
  onOpenCompleteRef.current = onOpenComplete;

  // Destrava o scroll assim que as portas começam a abrir
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

  // Tração magnética sutil apenas para ponteiros não-touch no desktop (sem getBoundingClientRect)
  const sealRawX = useMotionValue(0);
  const sealRawY = useMotionValue(0);
  const sealX = useSpring(sealRawX, { stiffness: 220, damping: 24, mass: 0.5 });
  const sealY = useSpring(sealRawY, { stiffness: 220, damping: 24, mass: 0.5 });

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!ready || isOpeningRef.current || e.pointerType === "touch") return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width === 0 || height === 0) return;
      const nx = Math.max(-0.5, Math.min(0.5, e.clientX / width - 0.5));
      const ny = Math.max(-0.5, Math.min(0.5, e.clientY / height - 0.5));
      sealRawX.set(nx * 8);
      sealRawY.set(ny * 8);
    },
    [ready, sealRawX, sealRawY],
  );

  const handlePointerLeave = useCallback(() => {
    sealRawX.set(0);
    sealRawY.set(0);
  }, [sealRawX, sealRawY]);

  const handleTriggerOpen = useCallback(() => {
    if (!ready || isOpeningRef.current) return;
    isOpeningRef.current = true;
    clearTimers();

    sealRawX.set(0);
    sealRawY.set(0);

    triggerHaptic(16);

    const isReduced =
      reducedMotion ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (isReduced) {
      setPhase("opening");
      onOpenStartRef.current();
      scheduleTimer(() => onOpenCompleteRef.current(), 250);
      return;
    }

    // 1. Dissolução limpa do broche (sem ondas de choque nem partículas)
    setPhase("unsealing");

    // 2. Abertura fluida das portas (e liberação imediata do scroll)
    scheduleTimer(() => {
      setPhase("opening");
    }, 180);

    // 3. Disparo do HeroPoster em plena visibilidade
    scheduleTimer(() => {
      onOpenStartRef.current();
    }, 550);

    // 4. Desmontagem do overlay após as portas deixarem a tela
    scheduleTimer(() => {
      onOpenCompleteRef.current();
    }, 2250);
  }, [clearTimers, ready, reducedMotion, scheduleTimer, sealRawX, sealRawY]);

  const handleBackdropError = useCallback(() => setBackdropError(true), []);

  const isIdle = phase === "idle";
  const isUnsealing = phase === "unsealing";
  const isOpening = phase === "opening";
  const isAnimatingDoors = isUnsealing || isOpening;

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`fixed inset-0 z-40 overflow-hidden select-none ${isOpening ? "pointer-events-none" : "pointer-events-auto touch-none"
        }`}
      role={isOpening ? undefined : "dialog"}
      aria-modal={isOpening ? undefined : true}
      aria-hidden={isOpening || undefined}
      inert={isOpening}
      aria-label={isOpening ? undefined : `Capa do convite de ${EVENT.name} — ${EVENT.age} Anos`}
    >
      {/* Porta Esquerda */}
      <m.div
        initial={false}
        animate={{ x: isOpening ? "-102%" : "0%" }}
        transition={DOOR_OPEN_TRANSITION}
        style={{ willChange: isAnimatingDoors ? "transform" : "auto" }}
        className="bg-paper-fine absolute inset-y-0 left-0 z-20 w-1/2 overflow-hidden border-r border-[#B8C0CC]/80 shadow-[inset_-1px_0_0_rgba(255,255,255,0.92),inset_-12px_0_22px_-14px_rgba(7,23,57,0.16),8px_0_28px_-6px_rgba(7,23,57,0.28),2px_0_6px_-2px_rgba(7,23,57,0.15)]"
        aria-hidden
      >
        <CoverDoorFrame
          side="left"
          ready={ready}
          reducedMotion={reducedMotion}
          backdropError={backdropError}
          onBackdropError={handleBackdropError}
        />

        <m.div
          initial={{ opacity: 0, y: -6 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
          transition={{
            duration: reducedMotion ? 0.15 : 0.6,
            delay: ready ? 0.1 : 0,
            ease: LUXURY_EASE,
          }}
          className="pointer-events-none absolute top-[max(1.75rem,calc(0.875rem+env(safe-area-inset-top)))] left-[max(1.75rem,calc(0.875rem+env(safe-area-inset-left)))] sm:top-[max(2.75rem,calc(1.25rem+env(safe-area-inset-top)))] sm:left-[max(3rem,calc(1.5rem+env(safe-area-inset-left)))] flex flex-col items-start"
        >
          <span className="font-script text-[26px] sm:text-[34px] leading-none text-[#071739]/85">
            {EVENT.name}
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-px w-4 bg-[#0A2463]/45" />
            <span className="font-serif text-[9px] sm:text-[10.5px] font-semibold tracking-[0.26em] text-[#0A2463]/80 uppercase">
              {EVENT.age} ANOS
            </span>
          </div>
        </m.div>

        {/* Filetes paralelos prata/azul-marinho na junção central */}
        <div className="pointer-events-none absolute inset-y-6 right-2.5 w-px bg-gradient-to-b from-transparent via-[#B8C0CC]/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#0A2463]/32 to-transparent" />
      </m.div>

      {/* Porta Direita */}
      <m.div
        initial={false}
        animate={{ x: isOpening ? "102%" : "0%" }}
        transition={DOOR_OPEN_TRANSITION}
        style={{ willChange: isAnimatingDoors ? "transform" : "auto" }}
        className="bg-paper-fine absolute inset-y-0 right-0 z-10 w-1/2 overflow-hidden shadow-[inset_18px_0_30px_-12px_rgba(7,23,57,0.26),inset_3px_0_6px_-1px_rgba(7,23,57,0.14)]"
        aria-hidden
      >
        <CoverDoorFrame
          side="right"
          ready={ready}
          reducedMotion={reducedMotion}
          backdropError={backdropError}
          onBackdropError={handleBackdropError}
        />

        <m.div
          initial={{ opacity: 0, y: 6 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={{
            duration: reducedMotion ? 0.15 : 0.6,
            delay: ready ? 0.14 : 0,
            ease: LUXURY_EASE,
          }}
          className="pointer-events-none absolute right-[max(1.75rem,calc(0.875rem+env(safe-area-inset-right)))] bottom-[max(1.75rem,calc(0.875rem+env(safe-area-inset-bottom)))] sm:right-[max(3rem,calc(1.5rem+env(safe-area-inset-right)))] sm:bottom-[max(2.75rem,calc(1.25rem+env(safe-area-inset-bottom)))] flex items-center gap-1.5 font-serif text-[9px] sm:text-[10px] tracking-[0.24em] text-[#071739]/68 uppercase"
        >
          <span className="text-[#0A2463]/70">✦</span>
          <span>{FORMATTED_EVENT_DATE.short}</span>
        </m.div>

        {/* Filete paralelo delicado próximo à junção central */}
        <div className="pointer-events-none absolute inset-y-6 left-2.5 w-px bg-gradient-to-b from-transparent via-[#B8C0CC]/80 to-transparent" />
      </m.div>

      {/* ════════════════════════════════════════════════════════════════════════
          BROCHE BARROCO PURO CENTRAL (ZERO FUNDO) + TEXTO CURVO À DIREITA
         ════════════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
        <m.div
          style={{ x: ready && isIdle ? sealX : 0, y: ready && isIdle ? sealY : 0 }}
          className="relative flex items-center justify-center"
        >
          {/* Animação de entrada (opacity, scale, y) exclusivamente no container pai */}
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={ready ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 10 }}
            transition={{
              duration: reducedMotion ? 0.15 : 0.68,
              delay: ready && !reducedMotion ? 0.08 : 0,
              ease: LUXURY_EASE,
            }}
          >
            <m.button
              type="button"
              onClick={handleTriggerOpen}
              disabled={!ready || !isIdle}
              aria-label={`Abrir convite de ${EVENT.name} — ${EVENT.age} Anos`}
              initial={false}
              animate={
                isIdle
                  ? { scale: 1, opacity: 1, rotate: 0 }
                  : { scale: [1, 1.2, 0.88], opacity: [1, 1, 0], rotate: [0, -5, 7] }
              }
              whileHover={ready && isIdle && !reducedMotion ? { scale: 1.04 } : undefined}
              whileTap={ready && isIdle && !reducedMotion ? { scale: 0.92 } : undefined}
              transition={
                isIdle
                  ? { type: "spring", stiffness: 420, damping: 24, mass: 0.6 }
                  : { duration: 0.72, ease: LUXURY_EASE }
              }
              style={{ willChange: isAnimatingDoors ? "transform, opacity" : "auto" }}
              className="pointer-events-auto group relative z-20 cursor-pointer rounded-full p-4 sm:p-5 outline-none focus-visible:ring-4 focus-visible:ring-[#0A2463]/35"
            >
              {/* Área de toque expandida sem alterar a geometria visual (cobre também o texto curvo à direita) */}
              <span aria-hidden className="absolute -inset-6 sm:-inset-8 rounded-full" />

              <div
                className={
                  ready && isIdle && !reducedMotion ? "animate-crest-float relative" : "relative"
                }
              >
                <div className="relative aspect-[576/610] w-[clamp(150px,43vw,186px)] max-w-[30dvh] md:w-[206px]">
                  {/* <img> 100% estática com camada GPU própria para drop-shadow recortada sem caixa */}
                  <Image
                    src={crestImage}
                    alt={`Brasão monograma ${EVENT.initial} de ${EVENT.name} — ${EVENT.age} anos`}
                    width={CREST_WIDTH}
                    height={CREST_HEIGHT}
                    unoptimized
                    fetchPriority="high"
                    loading="eager"
                    decoding="sync"
                    data-critical-asset="crest"
                    sizes="(max-width: 767px) 186px, 206px"
                    draggable={false}
                    onError={() => setCrestError(true)}
                    style={{
                      ...GPU_LAYER_STYLE,
                      filter: CREST_DROP_SHADOW,
                    }}
                    className={`relative z-10 size-full object-contain ${crestError ? "opacity-0" : ""
                      }`}
                  />

                  {crestError && (
                    <div
                      className="absolute inset-[14%] z-10 flex items-center justify-center rounded-full border-2 border-[#CBD5E1] bg-[radial-gradient(circle_at_35%_30%,#1E3A8A_0%,#0A2463_58%,#071739_100%)] shadow-[0_14px_24px_rgba(7,23,57,0.28),inset_0_2px_6px_rgba(255,255,255,0.45)]"
                      aria-hidden
                    >
                      <span className="font-serif text-5xl sm:text-6xl font-bold text-white">
                        {EVENT.initial}
                      </span>
                    </div>
                  )}

                  {ready && isIdle && !reducedMotion && !crestError && (
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

                  <CurvedCrestCaption
                    visible={ready && isIdle}
                    isIdle={isIdle}
                    reducedMotion={reducedMotion}
                  />
                </div>
              </div>
            </m.button>
          </m.div>
        </m.div>
      </div>
    </div>
  );
}
