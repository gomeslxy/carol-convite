"use client";

import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarDays, CalendarPlus, Check, ExternalLink } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Bow } from "@/components/BowDecoration";
import CarolHeroCollage from "@/components/CarolHeroCollage";
import CountdownTimer from "@/components/CountdownTimer";
import InteractiveActions from "@/components/InteractiveActions";
import { AmbientSparkles } from "@/components/LuxuryParticles";
import { CornerFiligree, DressCodeIcon, SilverDivider } from "@/components/Ornaments";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";
import { downloadIcs, googleCalendarUrl } from "@/lib/utils";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type StickerStyle = CSSProperties & {
  "--float-duration"?: string;
  "--ty"?: string;
  "--r-start"?: string;
  "--r-mid"?: string;
  "--s-start"?: string;
  "--s-mid"?: string;
};

export interface InvitationContentProps {
  /** Começa a revelar o conteúdo (quando a carta extraída expande). */
  revealed: boolean;
  /** Scroll liberado (transição do envelope concluída). */
  interactive: boolean;
}

export default function InvitationContent({ revealed, interactive }: InvitationContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sheenRafRef = useRef<number | null>(null);
  const pendingSheenRef = useRef<{ x: string; y: string } | null>(null);

  const [agendaOpen, setAgendaOpen] = useState(false);
  const [icsSaved, setIcsSaved] = useState(false);
  const icsTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (icsTimerRef.current !== null) window.clearTimeout(icsTimerRef.current);
      if (sheenRafRef.current !== null) window.cancelAnimationFrame(sheenRafRef.current);
    };
  }, []);

  // Atualização de reflexo especular (--sheen-x / --sheen-y) via rAF sem re-renders React
  const scheduleSheenUpdate = useCallback((x: string, y: string) => {
    pendingSheenRef.current = { x, y };
    if (sheenRafRef.current !== null) return;
    sheenRafRef.current = window.requestAnimationFrame(() => {
      sheenRafRef.current = null;
      const el = rootRef.current;
      const target = pendingSheenRef.current;
      if (!el || !target) return;
      el.style.setProperty("--sheen-x", target.x);
      el.style.setProperty("--sheen-y", target.y);
    });
  }, []);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!revealed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
      const py = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
      scheduleSheenUpdate(`${px.toFixed(1)}%`, `${py.toFixed(1)}%`);
    },
    [revealed, scheduleSheenUpdate],
  );

  // Reflexo sutil durante o scroll no mobile (onde não há ponteiro contínuo)
  useEffect(() => {
    if (!interactive) return;
    const onScroll = () => {
      const progress = Math.sin(window.scrollY * 0.0045);
      const sx = 50 + progress * 28;
      const sy = 25 + Math.cos(window.scrollY * 0.004) * 18;
      scheduleSheenUpdate(`${sx.toFixed(1)}%`, `${sy.toFixed(1)}%`);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [interactive, scheduleSheenUpdate]);

  const handleDownloadIcs = useCallback(() => {
    downloadIcs(EVENT);
    setIcsSaved(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(10);
    }
    if (icsTimerRef.current !== null) window.clearTimeout(icsTimerRef.current);
    icsTimerRef.current = window.setTimeout(() => {
      setIcsSaved(false);
      icsTimerRef.current = null;
    }, 2500);
  }, []);

  // Estado inicial oculto antes da pintura para evitar flash antes da abertura do envelope
  useIsoLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".card-surface", { autoAlpha: 0, y: 20, scale: 0.96 });
      gsap.set(".reveal-hero", { autoAlpha: 0, y: 16 });
      gsap.set(".hero-collage", { scale: 0.92 });
      gsap.set("[data-reveal]", { autoAlpha: 0, y: 24 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Coreografia de entrada + ScrollTrigger sem tweens concorrentes no mesmo elemento
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

      gsap.to(".hero-collage", {
        scale: 1,
        duration: reduced ? 0.01 : 1.0,
        ease: "power3.out",
        delay: reduced ? 0 : 0.08,
      });

      ScrollTrigger.batch("[data-reveal]", {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: reduced ? 0.01 : 0.85,
            ease: "power3.out",
            stagger: 0.1,
            delay: reduced ? 0 : 0.08,
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
              duration: 0.95,
              ease: "power2.inOut",
              delay: 0.25,
              scrollTrigger: { trigger: el, start: "top 95%", once: true },
            },
          );
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [revealed]);

  useEffect(() => {
    if (interactive) {
      ScrollTrigger.refresh();
    }
  }, [interactive]);

  useEffect(() => {
    if (!interactive) return;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 260);
    return () => window.clearTimeout(id);
  }, [agendaOpen, interactive]);

  return (
    <div
      ref={rootRef}
      data-active={revealed ? "true" : "false"}
      onPointerMove={handlePointerMove}
      className={`relative mx-auto w-full md:max-w-2xl lg:max-w-[700px] md:rounded-[28px] md:bg-[linear-gradient(135deg,rgba(255,255,255,0.72)_0%,rgba(148,163,184,0.48)_50%,rgba(255,255,255,0.72)_100%)] md:p-[1.5px] transition-opacity duration-300 ${
        revealed ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="card-surface bg-royal-letter relative isolate min-h-dvh md:min-h-0 w-full overflow-hidden md:rounded-[26px] shadow-[0_32px_70px_-14px_rgba(15,23,42,0.52),0_14px_30px_-8px_rgba(30,64,175,0.35)] will-change-transform">
        {/* Reflexo acetinado animado + poeira estelar no fundo Azul Royal */}
        <div className="satin-sheen pointer-events-none absolute inset-0 opacity-65" aria-hidden />
        <AmbientSparkles className="opacity-75" />

        {/* Moldura interna prateada dupla + 4 cantoneiras geométricas */}
        <div
          className="pointer-events-none absolute inset-3 sm:inset-5 md:inset-6 rounded-[18px] border border-white/25 shadow-[inset_0_0_28px_rgba(147,197,253,0.1)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-[17px] sm:inset-[25px] md:inset-[29px] rounded-[14px] border border-white/12"
          aria-hidden
        />

        <CornerFiligree
          position="tl"
          className="absolute top-3.5 left-3.5 sm:top-5.5 sm:left-5.5 md:top-6.5 md:left-6.5 z-[2] size-10 sm:size-13 opacity-75"
        />
        <CornerFiligree
          position="tr"
          className="absolute top-3.5 right-3.5 sm:top-5.5 sm:right-5.5 md:top-6.5 md:right-6.5 z-[2] size-10 sm:size-13 opacity-75"
        />
        <CornerFiligree
          position="bl"
          className="absolute bottom-3.5 left-3.5 sm:bottom-5.5 sm:left-5.5 md:bottom-6.5 md:left-6.5 z-[2] size-10 sm:size-13 opacity-75"
        />
        <CornerFiligree
          position="br"
          className="absolute bottom-3.5 right-3.5 sm:bottom-5.5 sm:right-5.5 md:bottom-6.5 md:right-6.5 z-[2] size-10 sm:size-13 opacity-75"
        />

        {/* ════════════════════════════════════════════════════════════════════════
            ADESIVOS & LAÇOS AZUL ROYAL (Animações CSS GPU-Accelerated)
           ════════════════════════════════════════════════════════════════════════ */}
        {/* Canto Superior Esquerdo: Buquê de Balões Azul & Prata */}
        <img
          src="/images/balloons.png"
          alt=""
          width={112}
          height={140}
          decoding="async"
          aria-hidden
          style={
            {
              "--float-duration": "5.5s",
              "--ty": "-8px",
              "--r-start": "-8deg",
              "--r-mid": "-3deg",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute top-3 left-1 sm:top-5 sm:left-4 z-[3] w-[66px] sm:w-[98px] md:w-[112px] h-auto drop-shadow-[0_12px_20px_rgba(9,13,22,0.45)]"
        />

        {/* Canto Superior Direito: Globo Espelhado + Laço Azul Royal */}
        <img
          src="/images/disco-ball.png"
          alt=""
          width={126}
          height={126}
          decoding="async"
          aria-hidden
          style={
            {
              "--float-duration": "7s",
              "--ty": "-4px",
              "--r-start": "0deg",
              "--r-mid": "6deg",
            } as StickerStyle
          }
          className="animate-sticker-sway pointer-events-none absolute -top-6 -right-6 sm:-top-8 sm:-right-8 z-[2] w-[96px] sm:w-[126px] h-auto opacity-90 drop-shadow-[0_12px_22px_rgba(9,13,22,0.45)]"
        />
        <div
          style={
            {
              "--float-duration": "5s",
              "--ty": "-4px",
              "--r-start": "-14deg",
              "--r-mid": "-8deg",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute top-14 right-2 sm:top-16 sm:right-5 z-[4]"
        >
          <Bow variant="royal" className="w-[54px] sm:w-[70px]" />
        </div>

        {/* Altura da Citação (Esquerda): Coração Azul Marinho Metalizado */}
        <img
          src="/images/heart-navy.png"
          alt=""
          width={62}
          height={62}
          decoding="async"
          aria-hidden
          style={
            {
              "--float-duration": "4.8s",
              "--ty": "-7px",
              "--r-start": "-10deg",
              "--r-mid": "-2deg",
              "--s-start": "1",
              "--s-mid": "1.05",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute top-[29%] left-1.5 sm:left-4 z-[3] w-[42px] sm:w-[62px] h-auto drop-shadow-[0_10px_18px_rgba(9,13,22,0.45)]"
        />

        {/* Altura da Citação (Direita): Estrela Glitter Prata */}
        <img
          src="/images/silver-glitter-star.png"
          alt=""
          width={62}
          height={62}
          decoding="async"
          aria-hidden
          style={
            {
              animationDelay: "0.4s",
              "--float-duration": "5.2s",
              "--ty": "-6px",
              "--r-start": "10deg",
              "--r-mid": "20deg",
            } as StickerStyle
          }
          className="animate-sticker-float-alt pointer-events-none absolute top-[31%] right-1.5 sm:right-4 z-[3] w-[44px] sm:w-[62px] h-auto drop-shadow-[0_10px_18px_rgba(9,13,22,0.4)]"
        />

        {/* Altura da Data (Esquerda): Cachorrinho de Balão Azul Metalizado */}
        <img
          src="/images/balloon-dog.png"
          alt=""
          width={70}
          height={70}
          decoding="async"
          aria-hidden
          style={
            {
              animationDelay: "0.2s",
              "--float-duration": "5.4s",
              "--ty": "-8px",
              "--r-start": "-8deg",
              "--r-mid": "2deg",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute top-[45%] left-1 sm:left-4 z-[3] w-[48px] sm:w-[70px] h-auto drop-shadow-[0_12px_20px_rgba(9,13,22,0.5)]"
        />

        {/* Altura da Data (Direita): Bolo Azul com Velinhas */}
        <img
          src="/images/blue-cake.png"
          alt=""
          width={78}
          height={78}
          decoding="async"
          aria-hidden
          style={
            {
              animationDelay: "0.6s",
              "--float-duration": "5.8s",
              "--ty": "-6px",
              "--r-start": "4deg",
              "--r-mid": "-3deg",
            } as StickerStyle
          }
          className="animate-sticker-float-alt pointer-events-none absolute top-[44%] right-1 sm:right-3 z-[3] w-[54px] sm:w-[78px] h-auto drop-shadow-[0_12px_20px_rgba(9,13,22,0.45)]"
        />

        {/* Altura do Contador (Esquerda): Estrela Glitter Azul Royal */}
        <img
          src="/images/blue-star.png"
          alt=""
          width={60}
          height={60}
          decoding="async"
          aria-hidden
          style={
            {
              animationDelay: "0.5s",
              "--float-duration": "4.4s",
              "--ty": "-5px",
              "--r-start": "-14deg",
              "--r-mid": "-4deg",
              "--s-start": "1",
              "--s-mid": "1.07",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute top-[58%] left-2 sm:left-5 z-[3] w-[42px] sm:w-[60px] h-auto drop-shadow-[0_10px_18px_rgba(9,13,22,0.45)]"
        />

        {/* Altura do Contador (Direita): Coração Azul Claro Metalizado Grande */}
        <img
          src="/images/heart-blue-lg.png"
          alt=""
          width={68}
          height={68}
          decoding="async"
          aria-hidden
          style={
            {
              animationDelay: "0.3s",
              "--float-duration": "4.9s",
              "--ty": "-7px",
              "--r-start": "8deg",
              "--r-mid": "16deg",
              "--s-start": "1",
              "--s-mid": "1.05",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute top-[59%] right-1.5 sm:right-4 z-[3] w-[46px] sm:w-[68px] h-auto drop-shadow-[0_10px_18px_rgba(9,13,22,0.45)]"
        />

        {/* Altura das Ações (Esquerda): Macaco Festeiro */}
        <img
          src="/images/monkey-party.png"
          alt=""
          width={88}
          height={88}
          decoding="async"
          aria-hidden
          style={
            {
              "--float-duration": "4.6s",
              "--ty": "-7px",
              "--r-start": "-8deg",
              "--r-mid": "3deg",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute top-[72%] left-1 sm:left-3 z-[3] w-[62px] sm:w-[88px] h-auto drop-shadow-[0_12px_20px_rgba(9,13,22,0.52)]"
        />

        {/* Altura das Ações (Direita): Ursinho com Velinha */}
        <img
          src="/images/teddy-bear.png"
          alt=""
          width={76}
          height={76}
          decoding="async"
          aria-hidden
          style={
            {
              animationDelay: "0.4s",
              "--float-duration": "5.1s",
              "--ty": "-6px",
              "--r-start": "5deg",
              "--r-mid": "-3deg",
            } as StickerStyle
          }
          className="animate-sticker-float-alt pointer-events-none absolute top-[73%] right-1 sm:right-3 z-[3] w-[52px] sm:w-[76px] h-auto drop-shadow-[0_12px_20px_rgba(9,13,22,0.48)]"
        />

        {/* Cantos Inferiores: Estrelas Cromadas */}
        <img
          src="/images/silver-star.png"
          alt=""
          width={62}
          height={62}
          decoding="async"
          aria-hidden
          style={
            {
              "--float-duration": "4.7s",
              "--ty": "-5px",
              "--r-start": "-12deg",
              "--r-mid": "0deg",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute bottom-5 left-2 sm:bottom-7 sm:left-6 z-[3] w-[46px] sm:w-[62px] h-auto drop-shadow-[0_10px_18px_rgba(9,13,22,0.45)]"
        />
        <img
          src="/images/silver-glitter-star.png"
          alt=""
          width={62}
          height={62}
          decoding="async"
          aria-hidden
          style={
            {
              animationDelay: "0.3s",
              "--float-duration": "5.3s",
              "--ty": "-5px",
              "--r-start": "10deg",
              "--r-mid": "22deg",
            } as StickerStyle
          }
          className="animate-sticker-float-alt pointer-events-none absolute bottom-5 right-2 sm:bottom-7 sm:right-6 z-[3] w-[46px] sm:w-[62px] h-auto drop-shadow-[0_10px_18px_rgba(9,13,22,0.45)]"
        />

        {/* ════════════════════════════════════════════════════════════════════════
            CONTEÚDO PRINCIPAL DO CONVITE
           ════════════════════════════════════════════════════════════════════════ */}
        <main className="relative z-[5] mx-auto flex w-full max-w-[500px] flex-col items-center px-8 pt-12 pb-20 sm:px-14 sm:pt-14 sm:pb-24 text-center">
          {/* 1. Topo: Laço Azul Royal + Monograma + Nome + Colagem */}
          <header className="relative flex w-full flex-col items-center">
            <div
              style={
                {
                  "--float-duration": "4.5s",
                  "--ty": "-3px",
                  "--r-start": "0deg",
                  "--r-mid": "0deg",
                } as StickerStyle
              }
              className="reveal-hero animate-sticker-float mb-1"
            >
              <Bow variant="royal" className="w-[66px] sm:w-[78px]" />
            </div>

            <p className="reveal-hero pl-[0.38em] font-serif text-[11px] sm:text-[12.5px] font-medium tracking-[0.38em] text-silver-200/95 uppercase">
              MEUS {EVENT.age} ANOS
            </p>

            <h1 className="reveal-hero relative mt-1 w-full overflow-visible">
              <span className="text-silver-luxury inline-block px-6 py-2 font-script text-[clamp(66px,18.5vw,98px)] sm:text-[98px] leading-[1.32] animate-shimmer">
                {EVENT.name}
              </span>
              <span className="sr-only"> — {EVENT.age} anos</span>
            </h1>

            <div className="reveal-hero -mt-2 w-full">
              <div className="hero-collage w-full will-change-transform">
                <CarolHeroCollage />
              </div>
            </div>
          </header>

          {/* 2. Frase de Abertura (Emolduramento Editorial Walt Disney) */}
          <section
            className="reveal-hero mt-6 sm:mt-7 w-full max-w-[420px] px-1 text-center"
            aria-label="Mensagem de abertura"
          >
            <div className="glass-royal-card interactive-sheen relative overflow-hidden rounded-[24px] px-5 pt-6 pb-5 sm:px-7 sm:pt-7 sm:pb-6">
              <span
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
                aria-hidden
              />

              {/* Aspas ornamentais prateadas */}
              <span
                className="text-silver-luxury pointer-events-none block font-serif text-[32px] leading-none opacity-85"
                aria-hidden
              >
                “
              </span>

              <blockquote className="relative z-10 -mt-1 font-serif text-[12.5px] sm:text-[14px] font-normal italic leading-[1.9] tracking-[0.03em] text-silver-100">
                {EVENT.quoteText}
              </blockquote>

              <div className="relative z-10 mt-3.5 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-silver-200/70" />
                <cite className="pl-[0.18em] font-serif text-[10.5px] sm:text-[11.5px] font-semibold not-italic tracking-[0.18em] text-white uppercase">
                  {EVENT.quoteAuthor}
                </cite>
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-silver-200/70" />
              </div>
            </div>

            <p className="mx-auto mt-5 max-w-[360px] font-sans text-[11.5px] sm:text-[13px] font-medium leading-[1.85] tracking-[0.12em] text-silver-100/95 uppercase">
              {EVENT.openingText}
            </p>
          </section>

          {/* 3. Altar da Data (17/07) + Botão Integrado "Salvar na Agenda" */}
          <section
            data-reveal
            className="mt-9 sm:mt-11 w-full max-w-[380px]"
            aria-label="Data e horário da festa"
          >
            <SilverDivider />

            <div className="relative mt-5 flex flex-col items-center">
              {/* Halo luminoso suave atrás do número 17 */}
              <div
                className="pointer-events-none absolute top-1/2 left-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22)_0%,rgba(96,165,250,0.12)_48%,transparent_74%)]"
                aria-hidden
              />

              <p className="relative z-10 pl-[0.3em] font-serif text-[20px] sm:text-[23px] font-medium tracking-[0.3em] text-white uppercase">
                {FORMATTED_EVENT_DATE.month}
              </p>

              <div className="relative z-10 mt-1.5 grid w-full max-w-[340px] grid-cols-[1fr_auto_1fr] items-center gap-2.5 sm:gap-5">
                <div className="relative py-2">
                  <span className="draw-line absolute inset-x-0 top-0 h-px origin-right bg-gradient-to-r from-transparent via-white/55 to-white/75" />
                  <span className="pl-[0.16em] font-serif text-[12.5px] sm:text-[15px] font-medium tracking-[0.16em] text-silver-100 uppercase">
                    {FORMATTED_EVENT_DATE.weekdayShort}
                  </span>
                  <span className="draw-line absolute inset-x-0 bottom-0 h-px origin-right bg-gradient-to-r from-transparent via-white/55 to-white/75" />
                </div>

                <span className="text-silver-luxury animate-shimmer px-2 font-serif text-[clamp(64px,16.5vw,86px)] sm:text-[86px] leading-[1.05] font-normal">
                  {FORMATTED_EVENT_DATE.day}
                </span>

                <div className="relative py-2">
                  <span className="draw-line absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-l from-transparent via-white/55 to-white/75" />
                  <span className="pl-[0.12em] font-serif text-[12.5px] sm:text-[15px] font-medium tracking-[0.12em] text-silver-100">
                    {FORMATTED_EVENT_DATE.time}
                  </span>
                  <span className="draw-line absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-l from-transparent via-white/55 to-white/75" />
                </div>
              </div>

              <p className="relative z-10 mt-1.5 pl-[0.26em] font-serif text-[18px] sm:text-[21px] font-medium tracking-[0.26em] text-white">
                {FORMATTED_EVENT_DATE.year}
              </p>

              {/* Botão / Seletor Integrado "Salvar na Agenda" */}
              <div className="relative z-10 mt-5 flex w-full flex-col items-center">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setAgendaOpen((prev) => !prev)}
                  aria-expanded={agendaOpen}
                  className="glass-royal-card interactive-sheen inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-5 py-2 font-serif text-[11px] font-semibold tracking-[0.2em] text-white uppercase outline-none transition hover:border-white/55 focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <CalendarPlus className="relative z-10 size-4 text-silver-100" strokeWidth={1.8} />
                  <span className="relative z-10">Salvar na Agenda</span>
                </motion.button>

                <AnimatePresence initial={false}>
                  {agendaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-3 grid w-full max-w-[330px] grid-cols-2 gap-2.5"
                    >
                      <motion.a
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        href={googleCalendarUrl(EVENT)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-royal-card interactive-sheen flex min-h-11 items-center justify-center gap-1.5 rounded-2xl px-3 py-2 font-sans text-[11.5px] font-semibold text-white transition hover:border-white/55"
                      >
                        <ExternalLink className="relative z-10 size-3.5 shrink-0 text-silver-200" />
                        <span className="relative z-10">Google Agenda</span>
                      </motion.a>

                      <motion.button
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleDownloadIcs}
                        aria-live="polite"
                        className={`flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-2xl px-3 py-2 font-sans text-[11.5px] font-semibold transition ${
                          icsSaved
                            ? "bg-silver-100 text-royal-950 shadow-[0_8px_20px_-6px_rgba(255,255,255,0.45)] ring-1 ring-white"
                            : "glass-royal-card interactive-sheen text-white hover:border-white/55"
                        }`}
                      >
                        {icsSaved ? (
                          <>
                            <Check className="relative z-10 size-3.5 shrink-0 text-royal-800" />
                            <span className="relative z-10">Salvo na agenda!</span>
                          </>
                        ) : (
                          <>
                            <CalendarDays className="relative z-10 size-3.5 shrink-0 text-silver-200" />
                            <span className="relative z-10">iPhone / Outlook</span>
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <SilverDivider className="mt-5" />
          </section>

          {/* 4. Contador Regressivo em Cápsulas de Cristal */}
          <section data-reveal className="mt-8 sm:mt-10 w-full" aria-label="Contagem regressiva">
            <CountdownTimer />
          </section>

          {/* 5. Interação com Medalhões */}
          <section data-reveal className="mt-9 sm:mt-11 w-full" aria-label="Interações do convite">
            <InteractiveActions />
          </section>

          {/* 6. Card de Traje (Alta-Costura) e Encerramento */}
          <section
            data-reveal
            className="mt-11 sm:mt-13 flex w-full flex-col items-center text-center"
            aria-label="Traje e encerramento"
          >
            <div className="glass-royal-card interactive-sheen relative w-full max-w-[360px] overflow-hidden rounded-[26px] px-6 pt-6 pb-5">
              <span
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
                aria-hidden
              />

              <Bow variant="silver" className="mx-auto w-[46px]" />

              <h2 className="text-silver-luxury relative z-10 mt-1 inline-block px-5 py-0.5 font-script text-[clamp(38px,10vw,48px)] leading-[1.28]">
                Traje:
              </h2>

              <div className="relative z-10 mt-2 flex items-center justify-center gap-3">
                <DressCodeIcon className="h-8 w-10 shrink-0" />
                <span className="pl-[0.22em] font-serif text-[14px] sm:text-[16px] font-semibold tracking-[0.22em] text-white uppercase">
                  {EVENT.dressCode}
                </span>
              </div>

              {EVENT.dressCodeNote && (
                <div className="relative z-10 mx-auto mt-3.5 inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                  <p className="font-sans text-[11px] font-medium leading-snug text-silver-100">
                    {EVENT.dressCodeNote}
                  </p>
                </div>
              )}
            </div>

            <footer className="mt-9 sm:mt-11 flex flex-col items-center">
              <p className="text-silver-luxury inline-block max-w-[340px] px-5 py-1.5 font-script text-[clamp(38px,10vw,48px)] leading-[1.32]">
                {EVENT.closingText}
              </p>
              <div
                style={
                  {
                    "--float-duration": "4.5s",
                    "--ty": "-3px",
                    "--r-start": "0deg",
                    "--r-mid": "0deg",
                  } as StickerStyle
                }
                className="animate-sticker-float"
              >
                <Bow variant="royal" className="mt-2 w-[56px]" />
              </div>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}
