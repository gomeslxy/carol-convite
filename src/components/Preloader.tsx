"use client";

import { m } from "framer-motion";
import { useId } from "react";
import { EVENT } from "@/config/event";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Tela de carregamento inicial minimalista e harmônica com a capa (`bg-paper-fine`).
 * Renderizada desde o primeiro frame (SSR + hidratação) com `initial={false}`
 * para eliminar qualquer flash ou pop-in antes da desmontagem via `AnimatePresence`.
 */
export default function Preloader() {
  const prefersReducedMotion = useSafeReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const arcGradId = `preloader-arc-${uid}`;

  return (
    <m.div
      initial={false}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: {
          duration: prefersReducedMotion ? 0.15 : 0.4,
          ease: LUXURY_EASE,
        },
      }}
      className="bg-paper-fine pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden touch-none select-none"
      role="status"
      aria-live="polite"
      aria-label={`Carregando convite de ${EVENT.name}`}
    >
      <span className="sr-only">Carregando convite...</span>

      <div className="relative flex size-24 sm:size-28 items-center justify-center">
        {/* Trilha circular fixa em prata sutil */}
        <svg
          width={112}
          height={112}
          viewBox="0 0 112 112"
          className="pointer-events-none absolute inset-0 size-full"
          aria-hidden
        >
          <circle
            cx="56"
            cy="56"
            r="48"
            fill="none"
            stroke="#B8C0CC"
            strokeOpacity="0.38"
            strokeWidth="1"
          />
          <circle
            cx="56"
            cy="56"
            r="41"
            fill="none"
            stroke="#CBD5E1"
            strokeOpacity="0.45"
            strokeWidth="0.75"
          />
        </svg>

        {/* Anel fino orbital em Royal Blue & Prata (100% GPU via transform; <defs> local para iOS Safari) */}
        <svg
          width={112}
          height={112}
          viewBox="0 0 112 112"
          className={`pointer-events-none absolute inset-0 size-full ${prefersReducedMotion ? "" : "animate-preloader-orbit"
            }`}
          aria-hidden
        >
          <defs>
            <linearGradient id={arcGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0" />
              <stop offset="38%" stopColor="#94A3B8" stopOpacity="0.8" />
              <stop offset="78%" stopColor="#0A2463" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#071739" stopOpacity="1" />
            </linearGradient>
          </defs>

          <circle
            cx="56"
            cy="56"
            r="48"
            fill="none"
            stroke={`url(#${arcGradId})`}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="175 130"
          />
        </svg>

        {/* Inicial serifada elegante no centro */}
        <span
          className="relative font-serif text-[32px] sm:text-[36px] font-semibold leading-none tracking-tight text-[#0A2463]"
          aria-hidden
        >
          {EVENT.initial}
        </span>
      </div>
    </m.div>
  );
}
