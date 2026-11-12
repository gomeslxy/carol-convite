"use client";

import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Bow } from "@/components/BowDecoration";
import CarolHeroCollage from "@/components/CarolHeroCollage";
import CountdownTimer from "@/components/CountdownTimer";
import InteractiveActions from "@/components/InteractiveActions";
import { AmbientSparkles } from "@/components/LuxuryParticles";
import { DressCodeIcon, SilverDivider } from "@/components/Ornaments";
import { EVENT, getFormattedDate } from "@/config/event";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface InvitationContentProps {
  /** Começa a revelar o conteúdo (quando a carta extraída expande). */
  revealed: boolean;
  /** Scroll liberado (transição do envelope concluída). */
  interactive: boolean;
}

export default function InvitationContent({ revealed, interactive }: InvitationContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const date = getFormattedDate();

  // Estado inicial oculto antes da pintura para evitar qualquer sobreposição com o envelope fechado
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".card-surface", { autoAlpha: 0, y: 20, scale: 0.96 });
      gsap.set(".reveal-hero", { autoAlpha: 0, y: 16 });
      gsap.set("[data-reveal]", { autoAlpha: 0, y: 24 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Coreografia de entrada (continuidade natural da folha extraída do envelope 3D) + ScrollTrigger
  useEffect(() => {
    if (!revealed) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      gsap.to(".card-surface", {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: reduced ? 0.01 : 0.85,
        ease: "power3.out",
      });

      gsap.to(".reveal-hero", {
        autoAlpha: 1,
        y: 0,
        duration: reduced ? 0.01 : 0.85,
        ease: "power3.out",
        stagger: 0.09,
        delay: reduced ? 0 : 0.08,
      });

      gsap.from(".hero-collage", {
        scale: 0.9,
        duration: 1.05,
        ease: "power3.out",
        delay: 0.08,
      });

      ScrollTrigger.batch("[data-reveal]", {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: reduced ? 0.01 : 0.9,
            ease: "power3.out",
            stagger: 0.1,
            delay: reduced ? 0 : 0.1,
            overwrite: true,
          }),
      });

      if (!reduced) {
        gsap.utils.toArray<HTMLElement>(".draw-line").forEach((el) => {
          gsap.fromTo(
            el,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1.0,
              ease: "power2.inOut",
              delay: 0.3,
              scrollTrigger: { trigger: el, start: "top 95%" },
            },
          );
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [revealed]);

  useEffect(() => {
    if (interactive) ScrollTrigger.refresh();
  }, [interactive]);

  return (
    <div
      ref={rootRef}
      className={`relative mx-auto w-full md:max-w-2xl lg:max-w-[700px] md:rounded-[28px] md:bg-[linear-gradient(135deg,rgba(255,255,255,0.65)_0%,rgba(148,163,184,0.45)_50%,rgba(255,255,255,0.65)_100%)] md:p-[1.5px] transition-opacity duration-300 ${
        revealed ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="card-surface bg-royal-letter relative isolate min-h-dvh md:min-h-0 w-full overflow-hidden md:rounded-[26px] shadow-[0_32px_70px_-14px_rgba(15,23,42,0.52),0_14px_30px_-8px_rgba(30,64,175,0.35)] will-change-transform">
        {/* Reflexo acetinado animado no fundo Azul Royal Degradê */}
        <div className="satin-sheen pointer-events-none absolute inset-0 opacity-65" aria-hidden />
        <AmbientSparkles className="opacity-70" />

        {/* Moldura interna prateada fina (1px) */}
        <div
          className="pointer-events-none absolute inset-3 sm:inset-5 md:inset-6 rounded-[18px] border border-white/25 shadow-[inset_0_0_24px_rgba(147,197,253,0.08)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-[17px] sm:inset-[25px] md:inset-[29px] rounded-[14px] border border-white/10"
          aria-hidden
        />

        {/* ════════════════════════════════════════════════════════════════════════
            ADESIVOS & LAÇOS AZUL ROYAL ESPALHADOS COM ANIMAÇÕES (SEM FUNDO)
           ════════════════════════════════════════════════════════════════════════ */}
        {/* Canto Superior Esquerdo: Buquê de Balões Azul & Prata */}
        <motion.img
          src="/images/balloons.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -8, 0], rotate: [-8, -3, -8] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-3 left-1 sm:top-5 sm:left-4 z-[3] w-[66px] sm:w-[98px] md:w-[112px] drop-shadow-[0_12px_20px_rgba(9,13,22,0.45)]"
        />

        {/* Canto Superior Direito: Globo Espelhado + Laço Azul Royal */}
        <motion.img
          src="/images/disco-ball.png"
          alt=""
          aria-hidden
          animate={{ rotate: [0, 6, 0], y: [0, -4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-6 -right-6 sm:-top-8 sm:-right-8 z-[2] w-[96px] sm:w-[126px] opacity-90 drop-shadow-[0_12px_22px_rgba(9,13,22,0.45)]"
        />
        <motion.div
          animate={{ rotate: [-14, -8, -14], y: [0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-14 right-2 sm:top-16 sm:right-5 z-[4]"
        >
          <Bow variant="royal" className="w-[54px] sm:w-[70px]" />
        </motion.div>

        {/* Altura da Citação (Esquerda): Coração Azul Marinho Metalizado */}
        <motion.img
          src="/images/heart-navy.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -7, 0], rotate: [-10, -2, -10], scale: [1, 1.05, 1] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-[29%] left-1.5 sm:left-4 z-[3] w-[42px] sm:w-[62px] drop-shadow-[0_10px_18px_rgba(9,13,22,0.45)]"
        />

        {/* Altura da Citação (Direita): Estrela Glitter Prata */}
        <motion.img
          src="/images/silver-glitter-star.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -6, 0], rotate: [10, 20, 10] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="pointer-events-none absolute top-[31%] right-1.5 sm:right-4 z-[3] w-[44px] sm:w-[62px] drop-shadow-[0_10px_18px_rgba(9,13,22,0.4)]"
        />

        {/* Altura da Data (Esquerda): Cachorrinho de Balão Azul Metalizado */}
        <motion.img
          src="/images/balloon-dog.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -8, 0], rotate: [-8, 2, -8] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="pointer-events-none absolute top-[45%] left-1 sm:left-4 z-[3] w-[48px] sm:w-[70px] drop-shadow-[0_12px_20px_rgba(9,13,22,0.5)]"
        />

        {/* Altura da Data (Direita): Bolo Azul com Velinhas */}
        <motion.img
          src="/images/blue-cake.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -6, 0], rotate: [4, -3, 4] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="pointer-events-none absolute top-[44%] right-1 sm:right-3 z-[3] w-[54px] sm:w-[78px] drop-shadow-[0_12px_20px_rgba(9,13,22,0.45)]"
        />

        {/* Altura do Contador (Esquerda): Estrela Glitter Azul Royal */}
        <motion.img
          src="/images/blue-star.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -5, 0], rotate: [-14, -4, -14], scale: [1, 1.07, 1] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="pointer-events-none absolute top-[58%] left-2 sm:left-5 z-[3] w-[42px] sm:w-[60px] drop-shadow-[0_10px_18px_rgba(9,13,22,0.45)]"
        />

        {/* Altura do Contador (Direita): Coração Azul Claro Metalizado Grande */}
        <motion.img
          src="/images/heart-blue-lg.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -7, 0], rotate: [8, 16, 8], scale: [1, 1.05, 1] }}
          transition={{ duration: 4.9, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="pointer-events-none absolute top-[59%] right-1.5 sm:right-4 z-[3] w-[46px] sm:w-[68px] drop-shadow-[0_10px_18px_rgba(9,13,22,0.45)]"
        />

        {/* Altura das Ações (Esquerda): APENAS 1 Adesivo de Macaco Festeiro */}
        <motion.img
          src="/images/monkey-party.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -7, 0], rotate: [-8, 3, -8] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-[72%] left-1 sm:left-3 z-[3] w-[62px] sm:w-[88px] drop-shadow-[0_12px_20px_rgba(9,13,22,0.52)]"
        />

        {/* Altura das Ações (Direita): Ursinho com Velinha */}
        <motion.img
          src="/images/teddy-bear.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -6, 0], rotate: [5, -3, 5] }}
          transition={{ duration: 5.1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="pointer-events-none absolute top-[73%] right-1 sm:right-3 z-[3] w-[52px] sm:w-[76px] drop-shadow-[0_12px_20px_rgba(9,13,22,0.48)]"
        />

        {/* Cantos Inferiores: Estrelas Cromadas + Laço Azul Royal */}
        <motion.img
          src="/images/silver-star.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -5, 0], rotate: [-12, 0, -12] }}
          transition={{ duration: 4.7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute bottom-5 left-2 sm:bottom-7 sm:left-6 z-[3] w-[46px] sm:w-[62px] drop-shadow-[0_10px_18px_rgba(9,13,22,0.45)]"
        />
        <motion.img
          src="/images/silver-glitter-star.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -5, 0], rotate: [10, 22, 10] }}
          transition={{ duration: 5.3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="pointer-events-none absolute bottom-5 right-2 sm:bottom-7 sm:right-6 z-[3] w-[46px] sm:w-[62px] drop-shadow-[0_10px_18px_rgba(9,13,22,0.45)]"
        />

        {/* ════════════════════════════════════════════════════════════════════════
            CONTEÚDO PRINCIPAL DO CONVITE (Em Prata Metálico & Branco sobre Azul Royal)
           ════════════════════════════════════════════════════════════════════════ */}
        <main className="relative z-[5] mx-auto flex w-full max-w-[490px] flex-col items-center px-8 pt-12 pb-20 sm:px-14 sm:pt-14 sm:pb-24 text-center">
          {/* ───────── 1. TOPO: LAÇO AZUL ROYAL + "Carol" (Sem Corte!) + COLAGEM DA CAROL ───────── */}
          <header className="relative flex w-full flex-col items-center">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="reveal-hero mb-1"
            >
              <Bow variant="royal" className="w-[62px] sm:w-[74px]" />
            </motion.div>

            <p className="reveal-hero pl-[0.38em] font-serif text-[11px] sm:text-[12.5px] font-medium tracking-[0.38em] text-silver-200/90 uppercase">
              MEUS {EVENT.age} ANOS
            </p>

            {/* Nome "Carol" em Prata Metálico Luminoso com espaço amplo */}
            <h1 className="reveal-hero relative mt-1 w-full overflow-visible">
              <span className="text-silver-luxury inline-block px-6 py-2 font-script text-[clamp(64px,18vw,94px)] sm:text-[94px] leading-[1.32] animate-shimmer">
                {EVENT.name}
              </span>
              <span className="sr-only"> — {EVENT.age} anos</span>
            </h1>

            {/* Colagem Editorial da Carol Bebê sem fundo */}
            <div className="reveal-hero hero-collage -mt-2 w-full">
              <CarolHeroCollage />
            </div>
          </header>

          {/* ───────── 2. FRASE DE ABERTURA (Walt Disney) ───────── */}
          <section
            className="reveal-hero mt-5 sm:mt-6 max-w-[390px] px-3 text-center"
            aria-label="Mensagem de abertura"
          >
            <blockquote className="font-serif text-[12.5px] sm:text-[14px] font-normal italic leading-[1.85] tracking-[0.04em] text-silver-100/95">
              {EVENT.quoteText}{" "}
              <span className="not-italic font-semibold text-white">{EVENT.quoteAuthor}</span>
            </blockquote>

            <p className="mt-4 font-sans text-[11.5px] sm:text-[13px] font-medium leading-[1.8] tracking-[0.1em] text-silver-200 uppercase">
              {EVENT.openingText}
            </p>
          </section>

          {/* ───────── 3. BLOCO DA DATA (JULHO | SÁB · 17 · 20:30 | 2027) ───────── */}
          <section
            data-reveal
            className="mt-8 sm:mt-10 w-full max-w-[350px]"
            aria-label="Data e horário da festa"
          >
            <SilverDivider />

            <p className="mt-4 pl-[0.28em] font-serif text-[20px] sm:text-[23px] font-medium tracking-[0.28em] text-white uppercase">
              {date.month}
            </p>

            <div className="mt-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 sm:gap-5">
              <div className="relative py-2">
                <span className="draw-line absolute inset-x-0 top-0 h-px origin-right bg-white/40" />
                <span className="pl-[0.16em] font-serif text-[12.5px] sm:text-[15px] font-medium tracking-[0.16em] text-silver-100 uppercase">
                  {date.weekdayShort}
                </span>
                <span className="draw-line absolute inset-x-0 bottom-0 h-px origin-right bg-white/40" />
              </div>

              <span className="text-silver-luxury px-2 font-serif text-[clamp(62px,16vw,82px)] sm:text-[82px] leading-[1.05] font-normal">
                {date.day}
              </span>

              <div className="relative py-2">
                <span className="draw-line absolute inset-x-0 top-0 h-px origin-left bg-white/40" />
                <span className="pl-[0.12em] font-serif text-[12.5px] sm:text-[15px] font-medium tracking-[0.12em] text-silver-100">
                  {date.time}
                </span>
                <span className="draw-line absolute inset-x-0 bottom-0 h-px origin-left bg-white/40" />
              </div>
            </div>

            <p className="mt-1.5 pl-[0.26em] font-serif text-[18px] sm:text-[21px] font-medium tracking-[0.26em] text-white">
              {date.year}
            </p>

            <SilverDivider className="mt-4" />
          </section>

          {/* ───────── 4. CONTADOR REGRESSIVO EM TEMPO REAL ───────── */}
          <section data-reveal className="mt-8 sm:mt-10 w-full" aria-label="Contagem regressiva">
            <CountdownTimer />
          </section>

          {/* ───────── 5. INTERAÇÃO COM ÍCONES + SETA ANIMADA ───────── */}
          <section data-reveal className="mt-9 sm:mt-11 w-full" aria-label="Interações do convite">
            <InteractiveActions />
          </section>

          {/* ───────── 6. TRAJE E ENCERRAMENTO ───────── */}
          <section data-reveal className="mt-11 sm:mt-13 w-full text-center" aria-label="Traje e encerramento">
            <h2 className="text-silver-luxury inline-block px-5 py-1 font-script text-[clamp(40px,10vw,50px)] leading-[1.3]">
              Traje:
            </h2>

            <div className="mt-2 flex items-center justify-center gap-3">
              <DressCodeIcon className="h-8 w-10 shrink-0" />
              <span className="pl-[0.22em] font-serif text-[13.5px] sm:text-[15.5px] font-medium tracking-[0.22em] text-white uppercase">
                {EVENT.dressCode}
              </span>
            </div>

            <footer className="mt-9 sm:mt-11 flex flex-col items-center">
              <p className="text-silver-luxury inline-block max-w-[340px] px-5 py-1.5 font-script text-[clamp(38px,10vw,48px)] leading-[1.32]">
                {EVENT.closingText}
              </p>
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Bow variant="royal" className="mt-2 w-[54px]" />
              </motion.div>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}
