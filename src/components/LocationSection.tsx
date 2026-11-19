"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Copy, MapPin, Navigation, Shirt } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { CornerFiligree } from "@/components/Ornaments";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";
import {
  copyToClipboard,
  googleMapsEmbedUrl,
  googleMapsUrl,
  wazeUrl,
} from "@/lib/utils";

const REVEAL_TRANSITION = {
  duration: 1.5,
  ease: [0.16, 1, 0.3, 1],
} as const;

const REVEAL_INITIAL = { opacity: 0, y: 42, scale: 0.94 } as const;
const REVEAL_VISIBLE = { opacity: 1, y: 0, scale: 1 } as const;
const REVEAL_REDUCED_INITIAL = { opacity: 0 } as const;
const REVEAL_REDUCED_VISIBLE = { opacity: 1 } as const;
const REVEAL_REDUCED_TRANSITION = { duration: 0.2 } as const;
const HEADING_VIEWPORT = { once: false, amount: 0.14 } as const;
const INTERACTIVE_VIEWPORT = { once: true, amount: 0.08 } as const;

const CARD_SURFACE_CLS =
  "border border-royal-deep/15 bg-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_-14px_rgba(7,23,57,0.16),0_4px_12px_-4px_rgba(10,36,99,0.08)]";

const FOCUS_RING_CLS =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal-deep/25";

interface LocationSectionProps {
  revealed: boolean;
  reducedMotion: boolean;
}

const LocationSection = memo(function LocationSection({
  revealed,
  reducedMotion,
}: LocationSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<number | null>(null);

  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!revealed || shouldLoadMap) return;
    const el = mapContainerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoadMap(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [revealed, shouldLoadMap]);

  const handleCopyAddress = useCallback(async () => {
    const ok = await copyToClipboard(EVENT.venue.address);
    setCopyStatus(ok ? "copied" : "failed");
    if (ok && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(10);
    }
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => {
      setCopyStatus("idle");
      copyTimerRef.current = null;
    }, 2600);
  }, []);

  const revealInitial = reducedMotion ? REVEAL_REDUCED_INITIAL : REVEAL_INITIAL;
  const revealVisible = reducedMotion ? REVEAL_REDUCED_VISIBLE : REVEAL_VISIBLE;
  const revealTransition = reducedMotion ? REVEAL_REDUCED_TRANSITION : REVEAL_TRANSITION;

  return (
    <section className="mt-14 sm:mt-16 flex w-full flex-col items-center" aria-label="Local da festa">
      <motion.div
        initial={revealInitial}
        whileInView={revealed ? revealVisible : revealInitial}
        viewport={HEADING_VIEWPORT}
        transition={revealTransition}
        className="w-full"
      >
        <div className="mx-auto flex w-full max-w-[380px] items-center gap-3 sm:gap-4">
          <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
          <h2 className="whitespace-nowrap font-serif text-[20px] sm:text-[26px] font-bold leading-none tracking-wide text-royal-navy">
            Local da Festa
          </h2>
          <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
        </div>
      </motion.div>

      <motion.div
        initial={revealInitial}
        whileInView={revealed ? revealVisible : revealInitial}
        viewport={INTERACTIVE_VIEWPORT}
        transition={reducedMotion ? REVEAL_REDUCED_TRANSITION : { ...REVEAL_TRANSITION, delay: 0.08 }}
        className={`relative mt-5 w-full rounded-2xl p-5 sm:p-7 text-center ${CARD_SURFACE_CLS}`}
      >
        <CornerFiligree
          position="tl"
          tone="slate"
          className="absolute top-2.5 left-2.5 size-9 sm:size-11 opacity-45"
        />
        <CornerFiligree
          position="tr"
          tone="slate"
          className="absolute top-2.5 right-2.5 size-9 sm:size-11 opacity-45"
        />

        <p className="font-serif text-[20px] sm:text-[24px] font-bold tracking-[0.06em] text-royal-navy">
          {EVENT.venue.name}
        </p>

        <p className="mt-2 font-sans text-[13.5px] sm:text-[14.5px] font-medium leading-relaxed text-royal-navy/80">
          {EVENT.venue.address}
        </p>

        {/* Faixa Horário & Traje no estilo do pôster */}
        <div className="mt-5 grid grid-cols-2 items-center rounded-xl border border-royal-deep/15 bg-[#F1F2F4]/85 py-3 px-2">
          <div className="flex flex-col items-center border-r border-royal-deep/15 px-2">
            <span className="flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-[0.16em] text-royal-deep uppercase">
              <Clock className="size-3.5" aria-hidden /> Horário
            </span>
            <span className="mt-1 font-serif text-[18px] sm:text-[20px] font-bold tabular-nums text-royal-navy">
              {FORMATTED_EVENT_DATE.time}
            </span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="flex items-center gap-1.5 font-sans text-[10px] font-bold tracking-[0.16em] text-royal-deep uppercase">
              <Shirt className="size-3.5" aria-hidden /> Traje
            </span>
            <span className="mt-1 font-serif text-[15px] sm:text-[17px] font-bold tracking-wide text-royal-navy">
              {EVENT.dressCode}
            </span>
          </div>
        </div>

        {EVENT.dressCodeNote && (
          <p className="mt-3.5 inline-flex items-center justify-center rounded-full border border-royal-deep/15 bg-royal-navy/[0.045] px-4 py-1.5 font-sans text-[11px] sm:text-[11.5px] font-semibold text-royal-navy">
            {EVENT.dressCodeNote}
          </p>
        )}

        {/* Mapa Embed com contenção estrita de layout/paint e carregamento lazy por proximidade */}
        <div
          ref={mapContainerRef}
          style={{ contain: "strict" }}
          className="relative mt-5 h-52 sm:h-60 overflow-hidden rounded-xl border border-royal-deep/15 bg-silver-100 shadow-sm"
        >
          {!mapLoaded && (
            <div
              className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 bg-silver-100 px-4 font-sans text-[12px] font-medium text-royal-navy/65"
              aria-hidden
            >
              <span>Carregando mapa do local…</span>
            </div>
          )}

          {shouldLoadMap && (
            <iframe
              title={`Mapa — ${EVENT.venue.name}`}
              src={googleMapsEmbedUrl(EVENT.venue.mapsQuery)}
              onLoad={() => setMapLoaded(true)}
              className={`block size-full transition-opacity duration-300 ${
                mapLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
        </div>

        {/* Botões funcionais: Google Maps, Waze e Copiar Endereço */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-[1fr_0.8fr_1.2fr]">
          <motion.a
            whileHover={reducedMotion ? undefined : { y: -1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            href={googleMapsUrl(EVENT.venue.mapsQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-royal-navy px-3 py-2.5 font-sans text-[12.5px] font-semibold text-white shadow-[0_10px_20px_-8px_rgba(7,23,57,0.6)] transition-colors hover:bg-royal-deep ${FOCUS_RING_CLS}`}
          >
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span>Google Maps</span>
          </motion.a>

          <motion.a
            whileHover={reducedMotion ? undefined : { y: -1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            href={wazeUrl(EVENT.venue.mapsQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-royal-deep px-3 py-2.5 font-sans text-[12.5px] font-semibold text-white shadow-[0_10px_20px_-8px_rgba(10,36,99,0.55)] transition-colors hover:bg-royal-800 ${FOCUS_RING_CLS}`}
          >
            <Navigation className="size-4 shrink-0" aria-hidden />
            <span>Waze</span>
          </motion.a>

          <motion.button
            type="button"
            whileHover={reducedMotion ? undefined : { y: -1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            onClick={handleCopyAddress}
            aria-live="polite"
            className={`col-span-2 sm:col-span-1 flex min-h-11 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl border px-3 py-2.5 font-sans text-[12.5px] font-semibold transition-colors ${FOCUS_RING_CLS} ${
              copyStatus === "copied"
                ? "border-royal-navy bg-royal-navy text-white shadow-[0_8px_18px_-8px_rgba(7,23,57,0.45)]"
                : "border-royal-deep/20 bg-white/95 text-royal-navy hover:border-royal-deep hover:bg-white"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copyStatus === "copied" ? (
                <motion.span
                  key="addr-copied"
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="inline-flex items-center gap-2"
                >
                  <Check className="size-4 shrink-0" aria-hidden />
                  <span>Copiado!</span>
                </motion.span>
              ) : copyStatus === "failed" ? (
                <motion.span
                  key="addr-failed"
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="inline-flex items-center gap-2"
                >
                  <Copy className="size-4 shrink-0 text-royal-deep" aria-hidden />
                  <span>Selecione e copie acima</span>
                </motion.span>
              ) : (
                <motion.span
                  key="addr-idle"
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="inline-flex items-center gap-2"
                >
                  <Copy className="size-4 shrink-0 text-royal-deep" aria-hidden />
                  <span>Copiar Endereço</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
});

export default LocationSection;
