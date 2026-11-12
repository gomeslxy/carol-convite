"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
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
import { EVENT, getFormattedDate } from "@/config/event";

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
 *  ENVELOPE / CARTA EM 3D REAL (Gateway Minimalista Centralizado)
 *  - Sem texto/ícone "Toque para abrir" (foco 100% no envelope 3D centralizado).
 *  - Efeito 3D aprimorado com iluminação especular dinâmica, paralaxe suave,
 *    dobras realistas em Azul Royal & Prata e medalhão central "18".
 *  - Coreografia de extração em 3 etapas:
 *    1) Aba superior abre a 180° em perspectiva 3D
 *    2) A carta desliza para fora do bolso (extracting)
 *    3) A carta se posiciona e centraliza exatamente no meio da tela (centering)
 *       enquanto o envelope faz fade-out, expandindo-se no convite principal.
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
  const confettiRef = useRef<ConfettiFn | null>(null);
  const timersRef = useRef<number[]>([]);

  // Bloqueia o scroll enquanto o envelope estiver ativo
  useScrollLock(true);

  const date = getFormattedDate();

  useEffect(() => {
    let alive = true;
    import("canvas-confetti").then((mod) => {
      if (alive) confettiRef.current = mod.default;
    });
    return () => {
      alive = false;
      timersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // ───────── Paralaxe 3D e Reflexo Especular Dinâmico ─────────
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const smoothX = useSpring(pointerX, { stiffness: 150, damping: 20, mass: 0.65 });
  const smoothY = useSpring(pointerY, { stiffness: 150, damping: 20, mass: 0.65 });

  const tiltRotateX = useTransform(smoothY, [-0.5, 0.5], [11, -11]);
  const tiltRotateY = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const glareX = useTransform(smoothX, [-0.5, 0.5], ["18%", "82%"]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], ["18%", "82%"]);

  // Suporte a giroscópio no mobile
  useEffect(() => {
    if (typeof window === "undefined" || phase !== "idle") return;
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      const nx = Math.max(-0.5, Math.min(0.5, event.gamma / 42));
      const ny = Math.max(-0.5, Math.min(0.5, (event.beta - 42) / 42));
      pointerX.set(nx);
      pointerY.set(ny);
    };
    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [phase, pointerX, pointerY]);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (phase !== "idle") return;
      const rect = e.currentTarget.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      pointerX.set(Math.max(-0.5, Math.min(0.5, nx)));
      pointerY.set(Math.max(-0.5, Math.min(0.5, ny)));
    },
    [phase, pointerX, pointerY],
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  // ───────── Coreografia de Abertura 3D e Centralização da Carta ─────────
  const handleTriggerOpen = useCallback(() => {
    if (phase !== "idle") return;

    pointerX.set(0);
    pointerY.set(0);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(15);
    }

    // 1. Quebra do selo "18"
    setPhase("unsealing");

    // 2. Abertura da aba superior em 3D (rotateX: 180deg)
    const tFlap = window.setTimeout(() => {
      setPhase("flap-open");
    }, 180);

    // Quando a aba passa de 90° (~460ms), passa para trás da carta
    const tFlapZ = window.setTimeout(() => {
      setFlapBehindLetter(true);
    }, 460);

    // 3. Disparo de confetes e estrelas em prata e azul royal
    const tConfetti = window.setTimeout(() => {
      void fireLuxuryCelebration(confettiRef.current);
    }, 440);

    // 4. Extração: carta desliza para cima saindo do bolso do envelope
    const tExtract = window.setTimeout(() => {
      setPhase("extracting");
    }, 520);

    // 5. Centralização: envelope desce/some e a carta se posiciona exatamente no centro da tela
    const tCenter = window.setTimeout(() => {
      setPhase("centering");
    }, 1120);

    // 6. Expansão contínua para o layout principal do convite
    const tExpand = window.setTimeout(() => {
      setPhase("expanding");
      onOpenStart();
    }, 1680);

    // 7. Conclusão e liberação do scroll (Lenis)
    const tComplete = window.setTimeout(() => {
      onOpenComplete();
    }, 2320);

    timersRef.current.push(tFlap, tFlapZ, tConfetti, tExtract, tCenter, tExpand, tComplete);
  }, [phase, pointerX, pointerY, onOpenStart, onOpenComplete]);

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
      className="fixed inset-0 z-40 grid h-dvh w-screen place-items-center overflow-hidden select-none touch-none px-4"
      style={{ perspective: "1100px" }}
      role="dialog"
      aria-modal="true"
      aria-label={`Envelope do convite de ${EVENT.name} — ${EVENT.age} Anos`}
    >
      {/* ════════════════════════════════════════════════════════════════════════
          1. FUNDO DO AMBIENTE (Degradê Off-White/Gelo com Iluminação Central)
         ════════════════════════════════════════════════════════════════════════ */}
      <div
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background:
            "radial-gradient(58% 52% at 50% 50%, #FFFFFF 0%, #F8FAFC 52%, #E2E8F0 100%)",
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(38% 34% at 50% 50%, rgba(30, 64, 175, 0.11) 0%, transparent 72%)",
        }}
        aria-hidden
      />

      <AmbientSparkles className="-z-10 opacity-50" />

      {/* ════════════════════════════════════════════════════════════════════════
          2. CENA 3D CENTRALIZADA NO MEIO DA TELA
         ════════════════════════════════════════════════════════════════════════ */}
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
        aria-label="Abrir envelope do convite"
        initial={{ opacity: 0, y: 18, scale: 0.94, rotateX: 8 }}
        animate={
          isIdle
            ? {
                opacity: 1,
                y: [0, -10, 0],
                scale: 1,
              }
            : {
                opacity: 1,
                y: 0,
                scale: 1,
              }
        }
        transition={
          isIdle
            ? {
                opacity: { duration: 0.65, ease: "easeOut" },
                scale: { duration: 0.65, ease: "easeOut" },
                y: { duration: 4.4, repeat: Infinity, ease: "easeInOut" },
              }
            : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
        }
        style={{
          rotateX: isIdle ? tiltRotateX : 0,
          rotateY: isIdle ? tiltRotateY : 0,
          transformStyle: "preserve-3d",
        }}
        className="group relative flex items-center justify-center w-[min(90vw,376px)] h-[246px] sm:w-[460px] sm:h-[304px] md:w-[520px] md:h-[344px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-royal-600/40 rounded-[14px]"
      >
        {/* Sombra 3D Projetada no Piso */}
        <motion.div
          animate={
            isIdle
              ? { scaleX: [1, 0.92, 1], opacity: [0.36, 0.22, 0.36] }
              : isCardForeground
                ? { scaleX: 0.85, opacity: 0 }
                : { scaleX: 0.95, opacity: 0.28 }
          }
          transition={
            isIdle
              ? { duration: 4.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.5, ease: "easeOut" }
          }
          className="pointer-events-none absolute -bottom-8 inset-x-6 h-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.48)_0%,rgba(30,58,138,0.2)_55%,transparent_80%)] blur-xl"
          aria-hidden
        />

        {/* ════════════════════════════════════════════════════════════════════
            CAMADA 1 (z-10): CORPO TRASEIRO / CAVIDADE INTERNA DO ENVELOPE
           ════════════════════════════════════════════════════════════════════ */}
        <motion.div
          animate={
            isCardForeground
              ? { opacity: 0, y: 72, scale: 0.9 }
              : isExtracting
                ? { opacity: 1, y: 28, scale: 0.98 }
                : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-10 overflow-hidden rounded-[14px] border border-silver-300/35 shadow-[0_26px_54px_-12px_rgba(15,23,42,0.42),0_12px_26px_-8px_rgba(30,64,175,0.26)]"
          style={{
            background: "linear-gradient(180deg, #0F172A 0%, #172554 58%, #1E3A8A 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-35"
            style={{ backgroundImage: "var(--satin-noise)" }}
            aria-hidden
          />
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════════
            CAMADA 2 (z-20 na extração -> z-45 na centralização):
            A FOLHA INTERNA BRANCA PEROLADA
            - Desliza para cima saindo do bolso e depois se centraliza exatamente
              no meio da tela (y: 0) antes de se expandir no convite!
           ════════════════════════════════════════════════════════════════════ */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 -top-[140%] ${
            isCardForeground ? "z-45 overflow-visible" : "z-20 overflow-hidden"
          } rounded-b-[14px]`}
          aria-hidden
        >
          <motion.div
            initial={{ y: "18%", opacity: 0, scale: 0.93 }}
            animate={
              isExpanding
                ? {
                    y: "0%",
                    opacity: 1,
                    scale: 1.16,
                  }
                : isCentering
                  ? {
                      y: "0%",
                      opacity: 1,
                      scale: 1.04,
                    }
                  : isExtracting
                    ? {
                        y: "-42%",
                        opacity: 1,
                        scale: 0.98,
                      }
                    : isFlapOpen
                      ? {
                          y: "4%",
                          opacity: 1,
                          scale: 0.95,
                        }
                      : {
                          y: "18%",
                          opacity: 0,
                          scale: 0.93,
                        }
            }
            transition={{
              y: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.25, ease: "easeOut" },
            }}
            className="bg-royal-letter absolute inset-x-3 sm:inset-x-5 bottom-1.5 h-[234px] sm:h-[290px] md:h-[328px] rounded-[14px] border border-white/30 shadow-[0_20px_48px_-8px_rgba(15,23,42,0.5)]"
          >
            {/* Moldura interna prateada fina na folha */}
            <div className="pointer-events-none absolute inset-2.5 sm:inset-3 rounded-[10px] border border-white/25" />

            {/* Conteúdo da folha Azul Royal Degradê centralizada (Laço + Carol + Foto + Data) */}
            <div className="relative flex h-full w-full flex-col items-center justify-center px-4 py-2.5 text-center">
              <Bow variant="royal" className="w-[34px] sm:w-[40px]" />

              <p className="pl-[0.34em] font-serif text-[7px] sm:text-[8.5px] font-medium tracking-[0.34em] text-silver-200/85 uppercase">
                MEUS {EVENT.age} ANOS
              </p>

              <p className="text-silver-luxury px-4 py-0.5 font-script text-[26px] sm:text-[34px] leading-[1.3]">
                {EVENT.name}
              </p>

              {/* Prévia compacta da Colagem da Carol sem fundo + Globo Espelhado + Balão 18 */}
              <div className="-mt-2">
                <CarolHeroCollage compact />
              </div>

              <div className="mt-0.5 w-full max-w-[190px]">
                <SilverDivider />
                <div className="mt-0.5 flex items-center justify-center gap-3 font-serif text-silver-100">
                  <span className="text-[7.5px] sm:text-[8.5px] tracking-[0.16em]">
                    {date.weekdayShort}
                  </span>
                  <span className="text-silver-luxury text-[17px] sm:text-[20px] font-normal leading-none">
                    {date.day}
                  </span>
                  <span className="text-[7.5px] sm:text-[8.5px] tracking-[0.14em]">{date.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            CAMADA 3 (z-30): BOLSO FRONTAL DO ENVELOPE (AZUL ROYAL & PRATA)
           ════════════════════════════════════════════════════════════════════ */}
        <motion.div
          animate={
            isCardForeground
              ? { opacity: 0, y: 72, scale: 0.9 }
              : isExtracting
                ? { opacity: 1, y: 28, scale: 0.98 }
                : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
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
                <stop offset="55%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>

              <linearGradient id={id("pocket-right")} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="55%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>

              <linearGradient id={id("pocket-bottom")} x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="38%" stopColor="#1D4ED8" />
                <stop offset="78%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>

              <linearGradient id={id("hairline-silver")} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.68" />
                <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.25" />
              </linearGradient>

              <filter id={id("pocket-shadow")} x="-10%" y="-15%" width="120%" height="130%">
                <feDropShadow dx="0" dy="-4" stdDeviation="5" floodColor="#090D16" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Aba lateral esquerda */}
            <polygon points="0,0 260,182 0,344" fill={`url(#${id("pocket-left")})`} />
            <line
              x1="0"
              y1="0"
              x2="260"
              y2="182"
              stroke={`url(#${id("hairline-silver")})`}
              strokeWidth="0.9"
            />

            {/* Aba lateral direita */}
            <polygon points="520,0 260,182 520,344" fill={`url(#${id("pocket-right")})`} />
            <line
              x1="520"
              y1="0"
              x2="260"
              y2="182"
              stroke={`url(#${id("hairline-silver")})`}
              strokeWidth="0.9"
            />

            {/* Aba inferior principal */}
            <path
              d="M 0,344 L 236,162 Q 260,145 284,162 L 520,344 Z"
              fill={`url(#${id("pocket-bottom")})`}
              filter={`url(#${id("pocket-shadow")})`}
            />
            <path
              d="M 0,344 L 236,162 Q 260,145 284,162 L 520,344"
              fill="none"
              stroke={`url(#${id("hairline-silver")})`}
              strokeWidth="1"
            />
          </svg>

          {/* Reflexo especular dinâmico que acompanha o movimento 3D */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background: useTransform(
                [glareX, glareY],
                ([gx, gy]) =>
                  `radial-gradient(52% 48% at ${gx} ${gy}, rgba(255,255,255,0.22) 0%, rgba(147,197,253,0.08) 45%, transparent 75%)`,
              ),
            }}
            aria-hidden
          />

          {/* Destinatário Caligráfico Minimalista na Frente do Envelope (Sem Cortes) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3.5 sm:bottom-5 flex flex-col items-center justify-center px-6 text-center">
            <span className="pl-[0.34em] font-serif text-[8.5px] sm:text-[9.5px] font-normal tracking-[0.34em] text-silver-200/80 uppercase">
              {EVENT.name} · {EVENT.age} Anos
            </span>

            <p className="px-4 py-1 font-script text-[clamp(26px,6.2vw,36px)] sm:text-[36px] leading-[1.32] text-silver-100/95 drop-shadow-[0_2px_4px_rgba(15,23,42,0.38)]">
              Para alguém especial
            </p>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════════
            CAMADA 4 (z-40 fechada / z-15 aberta): ABA SUPERIOR TRIANGULAR 3D
           ════════════════════════════════════════════════════════════════════ */}
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
              className="h-full w-full overflow-visible drop-shadow-[0_12px_20px_rgba(9,13,22,0.45)]"
              aria-hidden
            >
              <defs>
                <linearGradient id={id("top-flap")} x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#1E3A8A" />
                  <stop offset="52%" stopColor="#1E40AF" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
                <linearGradient id={id("top-flap-line")} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.32" />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.78" />
                  <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.32" />
                </linearGradient>
              </defs>

              <path
                d="M 0,0 L 520,0 L 282,178 Q 260,194 238,178 Z"
                fill={`url(#${id("top-flap")})`}
              />
              <path
                d="M 1,1 L 519,1 L 282,178 Q 260,194 238,178 Z"
                fill="none"
                stroke={`url(#${id("top-flap-line")})`}
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Face Interna da Aba Superior (Revelada ao abrir a 180°) */}
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
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
              </defs>
              <path
                d="M 0,0 L 520,0 L 282,178 Q 260,194 238,178 Z"
                fill={`url(#${id("top-flap-back")})`}
                stroke="rgba(203, 213, 225, 0.35)"
                strokeWidth="0.9"
              />
            </svg>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════════
            CAMADA 5 (z-50): MEDALHÃO CENTRAL "18" EM 3D (FECHO DA ABA)
           ════════════════════════════════════════════════════════════════════ */}
        <div
          style={{ transform: "translateZ(18px)" }}
          className="pointer-events-none absolute top-[52%] left-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
        >
          {!isIdle && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 2.3, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="pointer-events-none absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/85 bg-white/35 blur-[1px]"
              aria-hidden
            />
          )}

          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={
              isIdle
                ? {
                    scale: [1, 1.04, 1],
                    opacity: 1,
                  }
                : {
                    scale: [1, 1.18, 0.72],
                    rotate: [0, 10, 22],
                    opacity: [1, 0.85, 0],
                    filter: ["blur(0px)", "blur(1px)", "blur(6px)"],
                  }
            }
            transition={
              isIdle
                ? { scale: { duration: 2.8, repeat: Infinity, ease: "easeInOut" } }
                : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
            }
            className="relative flex size-[64px] sm:size-[72px] items-center justify-center rounded-full shadow-[0_12px_26px_rgba(9,13,22,0.52)]"
          >
            {/* Halo pulsante discreto convidando ao clique */}
            {isIdle && (
              <span
                className="absolute inset-0 rounded-full bg-white/20 animate-seal-ripple"
                aria-hidden
              />
            )}

            <svg viewBox="0 0 200 200" className="size-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id={id("medal-rim")} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="45%" stopColor="#E2E8F0" />
                  <stop offset="75%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
                <radialGradient id={id("medal-core")} cx="35%" cy="28%" r="75%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="55%" stopColor="#1E40AF" />
                  <stop offset="100%" stopColor="#172554" />
                </radialGradient>
              </defs>

              <circle
                cx="100"
                cy="100"
                r="88"
                fill={`url(#${id("medal-core")})`}
                stroke={`url(#${id("medal-rim")})`}
                strokeWidth="3"
              />

              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke={`url(#${id("medal-rim")})`}
                strokeWidth="1"
                opacity="0.7"
              />

              <Emblem18 strokeUrl={`url(#${id("medal-rim")})`} fillUrl="#FFFFFF" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
