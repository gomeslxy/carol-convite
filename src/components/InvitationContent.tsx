"use client";

import { m } from "framer-motion";
import dynamic from "next/dynamic";
import { memo } from "react";
import HeroPoster, {
  GlitterBlueStar,
  MetallicSilverStar,
} from "@/components/HeroPoster";
import { CornerFiligree } from "@/components/Ornaments";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

const CountdownTimer = dynamic(() => import("@/components/CountdownTimer"), {
  loading: () => <div className="h-[154px] sm:h-[196px] w-full max-w-[440px]" aria-hidden />,
});

const CalendarActions = dynamic(() => import("@/components/CalendarActions"), {
  loading: () => <div className="mt-5 h-11 w-full max-w-[360px]" aria-hidden />,
});

const LocationSection = dynamic(() => import("@/components/LocationSection"), {
  loading: () => <div className="mt-14 sm:mt-16 h-[560px] sm:h-[580px] w-full" aria-hidden />,
});

const RsvpSection = dynamic(() => import("@/components/RsvpSection"), {
  loading: () => <div className="mt-14 sm:mt-16 h-[560px] w-full" aria-hidden />,
});

export interface InvitationContentProps {
  /** Começa a animar a entrada do pôster e conteúdo (quando as portas da capa abrem). */
  revealed: boolean;
}

const REVEAL_TRANSITION = {
  duration: 1.5,
  ease: [0.16, 1, 0.3, 1],
} as const;

const REVEAL_INITIAL = { opacity: 0, y: 42, scale: 0.94 } as const;
const REVEAL_VISIBLE = { opacity: 1, y: 0, scale: 1 } as const;
const REVEAL_REDUCED_INITIAL = { opacity: 0 } as const;
const REVEAL_REDUCED_VISIBLE = { opacity: 1 } as const;
const REVEAL_REDUCED_TRANSITION = { duration: 0.2 } as const;
const VIEWPORT_CONFIG = { once: false, amount: 0.14 } as const;

const CARD_SURFACE_CLS =
  "border border-royal-deep/15 bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_-14px_rgba(7,23,57,0.16),0_4px_12px_-4px_rgba(10,36,99,0.08)]";

const InvitationContent = memo(function InvitationContent({
  revealed,
}: InvitationContentProps) {
  const reducedMotion = useSafeReducedMotion();

  const revealInitial = reducedMotion ? REVEAL_REDUCED_INITIAL : REVEAL_INITIAL;
  const revealVisible = reducedMotion ? REVEAL_REDUCED_VISIBLE : REVEAL_VISIBLE;
  const revealTransition = reducedMotion ? REVEAL_REDUCED_TRANSITION : REVEAL_TRANSITION;

  return (
    <div
      data-active={revealed ? "true" : "false"}
      inert={!revealed}
      className={`relative mx-auto w-full md:max-w-2xl lg:max-w-[700px] md:rounded-[28px] md:bg-[linear-gradient(135deg,rgba(255,255,255,0.9)_0%,rgba(148,163,184,0.48)_50%,rgba(255,255,255,0.9)_100%)] md:p-[1.5px] ${
        revealed ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Fundo único contínuo em papel texturizado claro (#F1F2F4) do topo do pôster até o rodapé */}
      <div className="bg-poster-paper relative isolate min-h-svh md:min-h-0 w-full overflow-x-clip md:rounded-[26px] shadow-[0_32px_70px_-14px_rgba(7,23,57,0.30),0_14px_30px_-8px_rgba(10,36,99,0.14)]">
        {/* Camada sutil de brilho atmosférico em GPU (zero filtros SVG pesados) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-70"
          style={{
            background:
              "radial-gradient(90% 42% at 50% 0%, rgba(255,255,255,0.62) 0%, transparent 72%), radial-gradient(75% 45% at 50% 100%, rgba(203,213,225,0.22) 0%, transparent 74%)",
          }}
          aria-hidden
        />

        {/* ════════════════════════════════════════════════════════════════════════
            SEÇÃO 1: PÔSTER PRINCIPAL ANIMADO (Sem corte reto na base)
           ════════════════════════════════════════════════════════════════════════ */}
        <HeroPoster revealed={revealed} />

        {/* ════════════════════════════════════════════════════════════════════════
            CONTINUAÇÃO CONTÍNUA NO MESMO PAPEL TEXTURIZADO (Ritmo Editorial)
           ════════════════════════════════════════════════════════════════════════ */}
        <div className="relative z-[5] pt-8 pb-[calc(4rem+env(safe-area-inset-bottom))] sm:pt-12 sm:pb-[calc(5rem+env(safe-area-inset-bottom))]">
          {/* Estrelas laterais estáticas nas margens externas (zero repaints no scroll) */}
          <GlitterBlueStar
            animClass=""
            className="absolute top-10 -left-2 sm:top-12 sm:left-4 z-[2] w-[30px] sm:w-[50px] -rotate-12 opacity-85 sm:opacity-95"
          />
          <MetallicSilverStar
            animClass=""
            className="absolute top-28 -right-2 sm:top-32 sm:right-4 z-[2] w-[28px] sm:w-[46px] rotate-12 opacity-85 sm:opacity-95"
          />

          <MetallicSilverStar
            animClass=""
            className="absolute top-[37%] -left-2 sm:left-4 z-[2] w-[28px] sm:w-[48px] -rotate-6 opacity-80 sm:opacity-90"
          />
          <GlitterBlueStar
            animClass=""
            className="absolute top-[42%] -right-2 sm:right-4 z-[2] w-[32px] sm:w-[54px] rotate-12 opacity-85 sm:opacity-95"
          />

          <GlitterBlueStar
            animClass=""
            className="absolute bottom-44 -left-2 sm:bottom-52 sm:left-4 z-[2] w-[32px] sm:w-[52px] -rotate-12 opacity-85 sm:opacity-95"
          />
          <MetallicSilverStar
            animClass=""
            className="absolute bottom-24 -right-2 sm:bottom-28 sm:right-4 z-[2] w-[28px] sm:w-[46px] rotate-6 opacity-85 sm:opacity-95"
          />

          <main className="relative z-[5] mx-auto flex w-full max-w-[540px] flex-col items-center px-5 sm:px-10 text-center">
            {/* ──────────────────────────────────────────────────────────────────────
                2. APRESENTAÇÃO & CONTAGEM REGRESSIVA
               ────────────────────────────────────────────────────────────────────── */}
            <section
              className="flex w-full flex-col items-center"
              aria-label="Apresentação e contagem regressiva"
            >
              {/* Pílula Azul-Marinho CAROL • 18 ANOS ladeada por linhas */}
              <m.div
                initial={revealInitial}
                whileInView={revealed ? revealVisible : revealInitial}
                viewport={VIEWPORT_CONFIG}
                transition={revealTransition}
                className="flex w-full max-w-[360px] items-center gap-3 sm:gap-4"
              >
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
                <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-royal-navy px-5 py-1.5 sm:px-7 font-sans text-[11.5px] sm:text-[13px] font-bold tracking-[0.22em] text-white uppercase shadow-[0_6px_14px_rgba(7,23,57,0.24)]">
                  {EVENT.name.toUpperCase()} • {EVENT.age} ANOS
                </span>
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
              </m.div>

              {/* Citação de Walt Disney em cartão editorial com cantoneiras e filete interno */}
              <m.div
                initial={revealInitial}
                whileInView={revealed ? revealVisible : revealInitial}
                viewport={VIEWPORT_CONFIG}
                transition={revealTransition}
                className={`relative mt-7 w-full max-w-[460px] rounded-2xl px-6 py-7 sm:px-9 sm:py-8 ${CARD_SURFACE_CLS}`}
              >
                <div
                  className="pointer-events-none absolute inset-2.5 rounded-xl border border-royal-deep/10"
                  aria-hidden
                />
                <CornerFiligree
                  position="tl"
                  tone="slate"
                  className="absolute top-2.5 left-2.5 size-8 sm:size-10 opacity-45"
                />
                <CornerFiligree
                  position="tr"
                  tone="slate"
                  className="absolute top-2.5 right-2.5 size-8 sm:size-10 opacity-45"
                />

                <div
                  className="relative mb-3.5 flex items-center justify-center gap-2.5 text-royal-deep/50"
                  aria-hidden
                >
                  <span className="h-px w-8 bg-royal-deep/25" />
                  <span className="text-[11px] leading-none">✦</span>
                  <span className="h-px w-8 bg-royal-deep/25" />
                </div>

                <blockquote className="relative font-sans text-[14.5px] sm:text-[16px] font-normal italic leading-[1.8] tracking-[0.01em] text-royal-navy/90">
                  {EVENT.quoteText}
                </blockquote>

                <div className="relative mt-4 flex items-center justify-center gap-3">
                  <span className="h-px w-7 bg-royal-deep/30" />
                  <cite className="font-serif text-[10.5px] sm:text-[11.5px] font-bold not-italic tracking-[0.2em] text-royal-deep uppercase">
                    {EVENT.quoteAuthor}
                  </cite>
                  <span className="h-px w-7 bg-royal-deep/30" />
                </div>
              </m.div>

              {/* Mensagem pessoal de convite destacada fora da citação */}
              <m.div
                initial={revealInitial}
                whileInView={revealed ? revealVisible : revealInitial}
                viewport={VIEWPORT_CONFIG}
                transition={
                  reducedMotion
                    ? REVEAL_REDUCED_TRANSITION
                    : { ...REVEAL_TRANSITION, delay: 0.1 }
                }
                className="mt-6 w-full max-w-[410px] px-2"
              >
                <p className="font-sans text-[14px] sm:text-[15.5px] font-semibold leading-[1.7] text-royal-navy">
                  {EVENT.openingText}
                </p>
                <span
                  className="mx-auto mt-4 block h-[1.5px] w-16 bg-gradient-to-r from-transparent via-royal-deep/45 to-transparent"
                  aria-hidden
                />
              </m.div>

              {/* Contador ao vivo no estilo do pôster (carregamento dinâmico abaixo da dobra) */}
              <m.div
                initial={revealInitial}
                whileInView={revealed ? revealVisible : revealInitial}
                viewport={VIEWPORT_CONFIG}
                transition={revealTransition}
                className="mt-9 flex w-full justify-center"
              >
                <CountdownTimer active={revealed} />
              </m.div>

              {/* Ações rápidas de Calendário (carregamento dinâmico abaixo da dobra) */}
              <CalendarActions revealed={revealed} reducedMotion={reducedMotion} />
            </section>

            {/* ──────────────────────────────────────────────────────────────────────
                3. LOCAL DA FESTA (Dynamic + Componente Memoizado Isolado)
               ────────────────────────────────────────────────────────────────────── */}
            <LocationSection revealed={revealed} reducedMotion={reducedMotion} />

            {/* ──────────────────────────────────────────────────────────────────────
                4. CONFIRMAÇÃO DE PRESENÇA / RSVP (Dynamic + Componente Memoizado Isolado)
               ────────────────────────────────────────────────────────────────────── */}
            <RsvpSection revealed={revealed} reducedMotion={reducedMotion} />

            {/* ──────────────────────────────────────────────────────────────────────
                5. RODAPÉ EDITORIAL
               ────────────────────────────────────────────────────────────────────── */}
            <footer className="mt-14 sm:mt-16 flex w-full flex-col items-center">
              <m.p
                initial={revealInitial}
                whileInView={revealed ? revealVisible : revealInitial}
                viewport={VIEWPORT_CONFIG}
                transition={revealTransition}
                className="font-serif text-[22px] sm:text-[26px] font-bold tracking-wide text-royal-navy"
              >
                {EVENT.closingText}
              </m.p>

              <m.div
                initial={revealInitial}
                whileInView={revealed ? revealVisible : revealInitial}
                viewport={VIEWPORT_CONFIG}
                transition={
                  reducedMotion
                    ? REVEAL_REDUCED_TRANSITION
                    : { ...REVEAL_TRANSITION, delay: 0.1 }
                }
                className="mt-4 flex w-full max-w-[300px] items-center gap-3 sm:gap-4"
              >
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
                <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-royal-navy px-5 py-1 font-sans text-[12px] sm:text-[13px] font-bold tracking-[0.2em] text-white shadow-[0_4px_10px_rgba(7,23,57,0.24)]">
                  {FORMATTED_EVENT_DATE.short}
                </span>
                <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
              </m.div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
});

export default InvitationContent;
