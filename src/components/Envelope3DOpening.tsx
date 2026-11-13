"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { gsap } from "gsap";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type confettiType from "canvas-confetti";
import { Bow } from "@/components/BowDecoration";
import CarolHeroCollage from "@/components/CarolHeroCollage";
import { AmbientSparkles, fireLuxuryCelebration } from "@/components/LuxuryParticles";
import { Emblem18, SilverDivider } from "@/components/Ornaments";
import { useScrollLock } from "@/components/SmoothScrollProvider";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";

type ConfettiFn = typeof confettiType;

type OpeningPhase =
  | "idle"
  | "unsealing"
  | "flap-open"
  | "extracting"
  | "centering"
  | "expanding";

export interface Envelope3DOpeningProps {
  /** Disparado quando a folha extraída e centralizada se expande para o layout principal. */
  onOpenStart: () => void;
  /** Disparado quando a transição 3D conclui e o scroll (Lenis) é liberado. */
  onOpenComplete: () => void;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ENVELOPE 3D DE ALTA PAPELARIA (Gateway Minimalista Centralizado)
 *  - Máquina de estados determinística via GSAP Timeline + trava síncrona (useRef)
 *    contra cliques múltiplos ou disparo duplo teclado/ponteiro.
 *  - Planos translateZ explícitos em cada camada para eliminar z-fighting no WebKit.
 *  - Forro geométrico interno, oclusão de dobras, sombra da aba e selo magnético.
 *  - Propriedades 100% aceleradas por GPU (transform, opacity), sem blur animado.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function Envelope3DOpening({
  onOpenStart,
  onOpenComplete,
}: Envelope3DOpeningProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (suffix: string) => `env3d-${uid}-${suffix}`;

  const [phase, setPhase] = useState<OpeningPhase>("idle");
  const [flapBehindLetter, setFlapBehindLetter] = useState(false);

  const isOpeningRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const confettiRef = useRef<ConfettiFn | null>(null);
  const confettiCleanupRef = useRef<(() => void) | null>(null);
  const onOpenStartRef = useRef(onOpenStart);
  const onOpenCompleteRef = useRef(onOpenComplete);

  onOpenStartRef.current = onOpenStart;
  onOpenCompleteRef.current = onOpenComplete;

  // Bloqueia o scroll enquanto o envelope estiver montado
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

  // ───────── Paralaxe 3D, Reflexo Especular & Tração Magnética no Selo ─────────
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const sealRawX = useMotionValue(0);
  const sealRawY = useMotionValue(0);

  const smoothX = useSpring(pointerX, { stiffness: 150, damping: 20, mass: 0.65 });
  const smoothY = useSpring(pointerY, { stiffness: 150, damping: 20, mass: 0.65 });
  const sealX = useSpring(sealRawX, { stiffness: 220, damping: 18, mass: 0.45 });
  const sealY = useSpring(sealRawY, { stiffness: 220, damping: 18, mass: 0.45 });

  const tiltRotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);
  const tiltRotateY = useTransform(smoothX, [-0.5, 0.5], [-13, 13]);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (isOpeningRef.current || e.pointerType === "touch") return;
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5));
      const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5));
      pointerX.set(nx);
      pointerY.set(ny);

      // Atração magnética sutil do selo (máximo ±7px) em direção ao cursor
      sealRawX.set(Math.max(-7, Math.min(7, nx * 16)));
      sealRawY.set(Math.max(-7, Math.min(7, ny * 16)));
    },
    [pointerX, pointerY, sealRawX, sealRawY],
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
    sealRawX.set(0);
    sealRawY.set(0);
  }, [pointerX, pointerY, sealRawX, sealRawY]);

  // ───────── Coreografia Determinística de Abertura 3D (GSAP Timeline) ─────────
  const handleTriggerOpen = useCallback(() => {
    if (isOpeningRef.current) return;
    isOpeningRef.current = true;

    pointerX.set(0);
    pointerY.set(0);
    sealRawX.set(0);
    sealRawY.set(0);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(15);
    }

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      setPhase("expanding");
      onOpenStartRef.current();
      const tl = gsap.timeline();
      tl.call(() => onOpenCompleteRef.current(), undefined, 0.25);
      timelineRef.current = tl;
      return;
    }

    // 1. Quebra do selo "C · 18"
    setPhase("unsealing");

    const tl = gsap.timeline();
    timelineRef.current = tl;

    // 2. Abertura da aba superior em 3D (rotateX: 180deg)
    tl.call(() => setPhase("flap-open"), undefined, 0.18);

    // 3. Disparo de confetes e estrelas em prata e azul royal
    tl.call(
      () => {
        confettiCleanupRef.current = fireLuxuryCelebration(confettiRef.current);
      },
      undefined,
      0.44,
    );

    // 4. Quando a aba passa de 90° (~460ms), passa para trás da carta no eixo Z
    tl.call(() => setFlapBehindLetter(true), undefined, 0.46);

    // 5. Extração: carta desliza para cima saindo do bolso do envelope
    tl.call(() => setPhase("extracting"), undefined, 0.52);

    // 6. Centralização: envelope desce/some e a carta se centraliza na tela
    tl.call(() => setPhase("centering"), undefined, 1.12);

    // 7. Expansão contínua para o layout principal do convite
    tl.call(
      () => {
        setPhase("expanding");
        onOpenStartRef.current();
      },
      undefined,
      1.68,
    );

    // 8. Conclusão e liberação do scroll (Lenis)
    tl.call(() => onOpenCompleteRef.current(), undefined, 2.34);
  }, [pointerX, pointerY, sealRawX, sealRawY]);

  const isIdle = phase === "idle";
  const isFlapOpen =
    phase === "flap-open" ||
    phase === "extracting" ||
    phase === "centering" ||
    phase === "expanding";
  const isExtracting = phase === "extracting";
  const isCentering = phase === "centering";
  const isExpanding = phase === "expanding";
  const isCardForeground = isCentering || isExpanding;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExpanding ? 0 : 1 }}
      transition={{ duration: 0.62, delay: isExpanding ? 0.06 : 0, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-40 flex h-dvh w-screen flex-col items-center justify-center overflow-hidden select-none touch-none px-4"
      style={{ perspective: "1200px" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Envelope do convite de ${EVENT.name} — ${EVENT.age} Anos`}
    >
      {/* 1. Fundo Ambiental Perolado com Aura Azul Royal */}
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(60% 54% at 50% 48%, #FFFFFF 0%, #F8FAFC 52%, #E2E8F0 100%)",
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(40% 36% at 50% 48%, rgba(30, 64, 175, 0.13) 0%, transparent 72%)",
        }}
        aria-hidden
      />

      <AmbientSparkles className="-z-10 opacity-55" />

      {/* 2. Cena 3D Centralizada */}
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleTriggerOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTriggerOpen();
          }
        }}
        tabIndex={0}
        role="button"
        aria-disabled={!isIdle}
        aria-label="Abrir envelope do convite"
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        style={{
          rotateX: isIdle ? tiltRotateX : 0,
          rotateY: isIdle ? tiltRotateY : 0,
          transformStyle: "preserve-3d",
        }}
        className={`group relative flex items-center justify-center w-[min(90vw,376px)] h-[246px] sm:w-[460px] sm:h-[304px] md:w-[520px] md:h-[344px] ${
          isIdle ? "cursor-pointer" : "cursor-default"
        } outline-none focus-visible:ring-2 focus-visible:ring-royal-600/40 rounded-[14px]`}
      >
        {/* Sombra 3D Projetada no Piso */}
        <motion.div
          animate={
            isCardForeground
              ? { scaleX: 0.85, opacity: 0 }
              : isIdle
                ? { scaleX: 1, opacity: 0.34 }
                : { scaleX: 0.95, opacity: 0.26 }
          }
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ transform: "translateZ(-12px)" }}
          className="pointer-events-none absolute -bottom-8 inset-x-6 h-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.42)_0%,rgba(30,58,138,0.18)_48%,transparent_76%)]"
          aria-hidden
        />

        {/* CAMADA 1: Corpo Traseiro / Cavidade Interna com Forro Geométrico (translateZ: -2px) */}
        <motion.div
          animate={
            isCardForeground
              ? { opacity: 0, y: 72, scale: 0.9 }
              : isExtracting
                ? { opacity: 1, y: 28, scale: 0.98 }
                : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          style={{
            transform: "translateZ(-2px)",
            background: "linear-gradient(180deg, #0B1326 0%, #172554 55%, #1E3A8A 100%)",
          }}
          className="absolute inset-0 z-10 overflow-hidden rounded-[14px] border border-silver-300/40 shadow-[0_28px_58px_-12px_rgba(15,23,42,0.46),0_14px_28px_-8px_rgba(30,64,175,0.28)]"
        >
          {/* Forro de Luxo (Envelope Liner) geométrico prateado */}
          <svg
            viewBox="0 0 520 344"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
            aria-hidden
          >
            <defs>
              <pattern
                id={id("cavity-liner")}
                width="26"
                height="26"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M13 0 L26 13 L13 26 L0 13 Z"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="0.55"
                  strokeOpacity="0.22"
                />
                <circle cx="13" cy="13" r="1" fill="#F8FAFC" fillOpacity="0.28" />
              </pattern>
            </defs>
            <rect width="520" height="344" fill={`url(#${id("cavity-liner")})`} />
          </svg>

          {/* Filete prateado interno no topo da cavidade */}
          <div
            className="pointer-events-none absolute inset-x-3 top-2.5 h-px bg-gradient-to-r from-transparent via-silver-200/45 to-transparent"
            aria-hidden
          />
        </motion.div>

        {/* CAMADA 2: Folha Interna Azul Royal & Prata (translateZ: 2px -> 14px) */}
        {!isIdle && (
          <div
            style={{
              transform: `translateZ(${isCardForeground ? 14 : 2}px)`,
            }}
            className={`pointer-events-none absolute inset-x-0 bottom-0 -top-[140%] ${
              isCardForeground ? "z-45 overflow-visible" : "z-20 overflow-hidden"
            } rounded-b-[14px]`}
            aria-hidden
          >
            <motion.div
              initial={{ y: "18%", opacity: 0, scale: 0.93 }}
              animate={
                isExpanding
                  ? { y: "0%", opacity: 1, scale: 1.16 }
                  : isCentering
                    ? { y: "0%", opacity: 1, scale: 1.04 }
                    : isExtracting
                      ? { y: "-42%", opacity: 1, scale: 0.98 }
                      : isFlapOpen
                        ? { y: "4%", opacity: 1, scale: 0.95 }
                        : { y: "18%", opacity: 0, scale: 0.93 }
              }
              transition={{
                y: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.25, ease: "easeOut" },
              }}
              className="bg-royal-letter absolute inset-x-3 sm:inset-x-5 bottom-1.5 h-[234px] sm:h-[290px] md:h-[328px] rounded-[14px] border border-white/40 shadow-[0_24px_54px_-8px_rgba(9,13,22,0.58)] will-change-transform"
            >
              {/* Sombra extra de profundidade conforme a carta sai do envelope */}
              <motion.div
                animate={{ opacity: isExtracting || isCardForeground ? 1 : 0.25 }}
                transition={{ duration: 0.45 }}
                className="pointer-events-none absolute -inset-x-2 -bottom-3 top-6 -z-10 rounded-[18px] bg-[radial-gradient(75%_60%_at_50%_55%,rgba(9,13,22,0.52)_0%,transparent_75%)]"
                aria-hidden
              />

              {/* Filetes prateados duplos internos */}
              <div className="pointer-events-none absolute inset-2 sm:inset-2.5 rounded-[11px] border border-white/35" />
              <div className="pointer-events-none absolute inset-3 sm:inset-3.5 rounded-[8px] border border-white/15" />

              <div className="relative flex h-full w-full flex-col items-center justify-center px-4 py-2.5 text-center">
                <Bow variant="royal" className="w-[34px] sm:w-[40px]" />

                <p className="pl-[0.34em] font-serif text-[7px] sm:text-[8.5px] font-medium tracking-[0.34em] text-silver-200/85 uppercase">
                  MEUS {EVENT.age} ANOS
                </p>

                <p className="text-silver-luxury px-4 py-0.5 font-script text-[26px] sm:text-[34px] leading-[1.3]">
                  {EVENT.name}
                </p>

                <div className="-mt-2">
                  <CarolHeroCollage compact />
                </div>

                <div className="mt-0.5 w-full max-w-[190px]">
                  <SilverDivider />
                  <div className="mt-0.5 flex items-center justify-center gap-3 font-serif text-silver-100">
                    <span className="text-[7.5px] sm:text-[8.5px] tracking-[0.16em]">
                      {FORMATTED_EVENT_DATE.weekdayShort}
                    </span>
                    <span className="text-silver-luxury text-[17px] sm:text-[20px] font-normal leading-none">
                      {FORMATTED_EVENT_DATE.day}
                    </span>
                    <span className="text-[7.5px] sm:text-[8.5px] tracking-[0.14em]">
                      {FORMATTED_EVENT_DATE.time}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* CAMADA 3: Bolso Frontal do Envelope com Oclusão de Dobras (translateZ: 6px) */}
        <motion.div
          animate={
            isCardForeground
              ? { opacity: 0, y: 72, scale: 0.9 }
              : isExtracting
                ? { opacity: 1, y: 28, scale: 0.98 }
                : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          style={{ transform: "translateZ(6px)" }}
          className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[14px]"
        >
          <svg
            viewBox="0 0 520 344"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id={id("pocket-left")} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="52%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>

              <linearGradient id={id("pocket-right")} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="52%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>

              <linearGradient id={id("pocket-bottom")} x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="32%" stopColor="#1D4ED8" />
                <stop offset="76%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>

              {/* Oclusão de sombra sob as dobras */}
              <linearGradient id={id("fold-shadow")} x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#090D16" stopOpacity="0.48" />
                <stop offset="100%" stopColor="#090D16" stopOpacity="0" />
              </linearGradient>

              <linearGradient id={id("hairline-silver")} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.25" />
                <stop offset="28%" stopColor="#F8FAFC" stopOpacity="0.82" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
                <stop offset="72%" stopColor="#F8FAFC" stopOpacity="0.82" />
                <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.25" />
              </linearGradient>
            </defs>

            {/* Aba lateral esquerda */}
            <polygon points="0,0 260,182 0,344" fill={`url(#${id("pocket-left")})`} />
            {/* Vinco de oclusão esquerdo */}
            <polygon points="0,0 260,182 246,191 0,18" fill={`url(#${id("fold-shadow")})`} opacity="0.42" />
            <line
              x1="0"
              y1="0"
              x2="260"
              y2="182"
              stroke={`url(#${id("hairline-silver")})`}
              strokeWidth="1"
            />

            {/* Aba lateral direita */}
            <polygon points="520,0 260,182 520,344" fill={`url(#${id("pocket-right")})`} />
            {/* Vinco de oclusão direito */}
            <polygon points="520,0 260,182 274,191 520,18" fill={`url(#${id("fold-shadow")})`} opacity="0.42" />
            <line
              x1="520"
              y1="0"
              x2="260"
              y2="182"
              stroke={`url(#${id("hairline-silver")})`}
              strokeWidth="1"
            />

            {/* Sombra de oclusão projetada pelas laterais sob o bolso inferior */}
            <path
              d="M 0,344 L 236,154 Q 260,136 284,154 L 520,344 Z"
              fill="#090D16"
              opacity="0.32"
            />

            {/* Aba inferior principal */}
            <path
              d="M 0,344 L 236,162 Q 260,145 284,162 L 520,344 Z"
              fill={`url(#${id("pocket-bottom")})`}
            />
            {/* Filete prateado duplo no bolso inferior */}
            <path
              d="M 0,344 L 236,162 Q 260,145 284,162 L 520,344"
              fill="none"
              stroke={`url(#${id("hairline-silver")})`}
              strokeWidth="1.2"
            />
            <path
              d="M 10,344 L 238,169 Q 260,153 282,169 L 510,344"
              fill="none"
              stroke="#E2E8F0"
              strokeOpacity="0.28"
              strokeWidth="0.7"
            />
          </svg>

          {/* Sombra projetada da aba superior sobre o bolso quando fechada */}
          <motion.svg
            viewBox="0 0 520 344"
            preserveAspectRatio="none"
            animate={{ opacity: isFlapOpen ? 0 : 1 }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden
          >
            <path
              d="M 0,0 L 520,0 L 284,189 Q 260,206 236,189 Z"
              fill="rgba(6, 10, 20, 0.34)"
            />
          </motion.svg>

          {/* Reflexo especular diagonal leve */}
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "linear-gradient(125deg, rgba(255,255,255,0.18) 0%, rgba(147,197,253,0.06) 38%, transparent 68%)",
            }}
            aria-hidden
          />

          {/* Destinatário Caligráfico com filetes ornamentais prateados */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3.5 sm:bottom-5 flex flex-col items-center justify-center px-6 text-center">
            <span className="pl-[0.34em] font-serif text-[8.5px] sm:text-[9.5px] font-normal tracking-[0.34em] text-silver-200/85 uppercase">
              {EVENT.name} · {EVENT.age} Anos
            </span>

            <div className="mt-0.5 flex items-center justify-center gap-2.5">
              <span className="hidden sm:block h-px w-7 bg-gradient-to-r from-transparent to-silver-200/75" />
              <p className="px-2 py-0.5 font-script text-[clamp(26px,6.2vw,36px)] sm:text-[36px] leading-[1.32] text-silver-100 [text-shadow:0_2px_6px_rgba(15,23,42,0.45)]">
                Para alguém especial
              </p>
              <span className="hidden sm:block h-px w-7 bg-gradient-to-l from-transparent to-silver-200/75" />
            </div>
          </div>
        </motion.div>

        {/* CAMADA 4: Aba Superior Triangular 3D (translateZ: 8px fechada -> -1px aberta) */}
        <motion.div
          initial={{ rotateX: 0, y: 0, opacity: 1 }}
          animate={
            isCardForeground
              ? { rotateX: 180, y: 72, opacity: 0, scale: 0.9 }
              : isExtracting
                ? { rotateX: 180, y: 28, opacity: 1, scale: 0.98 }
                : { rotateX: isFlapOpen ? 180 : 0, y: 0, opacity: 1, scale: 1 }
          }
          transition={{
            rotateX: { duration: 0.68, ease: [0.33, 1, 0.68, 1] },
            y: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.55, ease: "easeOut" },
            scale: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
          }}
          style={{
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
            transform: `translateZ(${flapBehindLetter ? -1 : 8}px)`,
            zIndex: flapBehindLetter ? 15 : 40,
          }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[56%] w-full will-change-transform"
        >
          {/* Face Externa da Aba Superior */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            className="absolute inset-0 h-full w-full"
          >
            <svg
              viewBox="0 0 520 194"
              preserveAspectRatio="none"
              className="h-full w-full overflow-visible"
              aria-hidden
            >
              <defs>
                <linearGradient id={id("top-flap")} x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#1E3A8A" />
                  <stop offset="50%" stopColor="#1E40AF" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
                <linearGradient id={id("top-flap-line")} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.32" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.32" />
                </linearGradient>
              </defs>

              <path
                d="M 0,0 L 520,0 L 282,178 Q 260,194 238,178 Z"
                fill={`url(#${id("top-flap")})`}
              />
              {/* Filete externo prateado */}
              <path
                d="M 1,1 L 519,1 L 282,178 Q 260,194 238,178 Z"
                fill="none"
                stroke={`url(#${id("top-flap-line")})`}
                strokeWidth="1.2"
              />
              {/* Filete interno fino */}
              <path
                d="M 12,5 L 508,5 L 279,170 Q 260,183 241,170 Z"
                fill="none"
                stroke="#E2E8F0"
                strokeOpacity="0.26"
                strokeWidth="0.7"
              />
            </svg>
          </div>

          {/* Face Interna da Aba Superior com Forro Geométrico (Revelada ao abrir a 180°) */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateX(180deg)",
            }}
            className="absolute inset-0 h-full w-full"
          >
            <svg
              viewBox="0 0 520 194"
              preserveAspectRatio="none"
              className="h-full w-full overflow-visible"
              aria-hidden
            >
              <defs>
                <linearGradient id={id("top-flap-back")} x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#172554" />
                  <stop offset="100%" stopColor="#0B1326" />
                </linearGradient>
                <pattern
                  id={id("flap-liner")}
                  width="26"
                  height="26"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M13 0 L26 13 L13 26 L0 13 Z"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="0.55"
                    strokeOpacity="0.24"
                  />
                  <circle cx="13" cy="13" r="1" fill="#FFFFFF" fillOpacity="0.28" />
                </pattern>
              </defs>
              <path
                d="M 0,0 L 520,0 L 282,178 Q 260,194 238,178 Z"
                fill={`url(#${id("top-flap-back")})`}
              />
              <path
                d="M 8,3 L 512,3 L 280,173 Q 260,187 240,173 Z"
                fill={`url(#${id("flap-liner")})`}
                stroke="rgba(226, 232, 240, 0.35)"
                strokeWidth="0.9"
              />
            </svg>
          </div>
        </motion.div>

        {/* CAMADA 5: Selo de Joalheria "C · 18" + Lacinho Acetinado & Tração Magnética (translateZ: 18px) */}
        <div
          style={{ transform: "translateZ(18px)" }}
          className="pointer-events-none absolute top-[52%] left-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            style={{
              x: isIdle ? sealX : 0,
              y: isIdle ? sealY : 0,
            }}
            className="relative"
          >
            {/* Ondas de choque concêntricas na quebra do lacre */}
            {!isIdle && (
              <>
                <motion.span
                  initial={{ scale: 0.6, opacity: 0.92 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="pointer-events-none absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90 bg-white/30"
                  aria-hidden
                />
                <motion.span
                  initial={{ scale: 0.7, opacity: 0.8 }}
                  animate={{ scale: 1.85, opacity: 0 }}
                  transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
                  className="pointer-events-none absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-silver-200/80"
                  aria-hidden
                />
              </>
            )}

            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={
                isIdle
                  ? {
                      scale: [1, 1.045, 1],
                      opacity: 1,
                    }
                  : {
                      scale: [1, 1.2, 0.72],
                      rotate: [0, 12, 26],
                      opacity: [1, 0.88, 0],
                    }
              }
              transition={
                isIdle
                  ? { scale: { duration: 2.8, repeat: Infinity, ease: "easeInOut" } }
                  : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
              }
              className="relative flex size-[70px] sm:size-[78px] items-center justify-center rounded-full shadow-[0_14px_28px_rgba(9,13,22,0.56),0_0_22px_rgba(255,255,255,0.18)] will-change-transform"
            >
              {isIdle && (
                <span
                  className="absolute inset-0 rounded-full bg-white/25 animate-seal-ripple"
                  aria-hidden
                />
              )}

              {/* Lacinho de Fita Acetinada integrado ao fecho */}
              <div className="pointer-events-none absolute -top-3.5 left-1/2 z-20 -translate-x-1/2">
                <Bow variant="silver" className="w-[34px] sm:w-[38px]" />
              </div>

              <svg viewBox="0 0 200 200" className="size-full overflow-visible" aria-hidden>
                <defs>
                  <linearGradient id={id("medal-bevel")} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="28%" stopColor="#CBD5E1" />
                    <stop offset="52%" stopColor="#FFFFFF" />
                    <stop offset="76%" stopColor="#64748B" />
                    <stop offset="100%" stopColor="#F8FAFC" />
                  </linearGradient>
                  <linearGradient id={id("medal-rim")} x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="45%" stopColor="#E2E8F0" />
                    <stop offset="75%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </linearGradient>
                  <radialGradient id={id("medal-core")} cx="35%" cy="28%" r="75%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="32%" stopColor="#2563EB" />
                    <stop offset="68%" stopColor="#1E40AF" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </radialGradient>
                </defs>

                {/* Aro chanfrado externo estilo moeda/joia */}
                <circle
                  cx="100"
                  cy="100"
                  r="91"
                  fill={`url(#${id("medal-bevel")})`}
                />
                <circle
                  cx="100"
                  cy="100"
                  r="86"
                  fill={`url(#${id("medal-core")})`}
                  stroke={`url(#${id("medal-rim")})`}
                  strokeWidth="2.4"
                />

                {/* Sulco interno prateado */}
                <circle
                  cx="100"
                  cy="100"
                  r="77"
                  fill="none"
                  stroke={`url(#${id("medal-rim")})`}
                  strokeWidth="1.1"
                  opacity="0.78"
                />

                <Emblem18
                  strokeUrl={`url(#${id("medal-rim")})`}
                  fillUrl="#FFFFFF"
                  initial={EVENT.initial}
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Legenda refinada em pílula de vidro perolado */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isIdle ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
        transition={{ duration: 0.45, delay: isIdle ? 0.35 : 0, ease: "easeOut" }}
        className="glass-pearl-pill pointer-events-none mt-10 flex items-center gap-2 rounded-full px-5 py-2"
        aria-hidden
      >
        <span className="text-[11px] text-royal-700 animate-pulse">✦</span>
        <span className="pl-[0.24em] font-serif text-[9.5px] sm:text-[10.5px] font-semibold tracking-[0.24em] text-royal-900 uppercase">
          Toque no selo para abrir o convite
        </span>
        <span className="text-[11px] text-royal-700 animate-pulse">✦</span>
      </motion.div>
    </motion.div>
  );
}
