"use client";

import { AnimatePresence, m } from "framer-motion";
import { CalendarPlus, Check, ExternalLink } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { EVENT } from "@/config/event";
import { downloadIcs, googleCalendarUrl } from "@/lib/calendar";
import { isInAppBrowser, triggerHaptic } from "@/lib/utils";

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

const FOCUS_RING_CLS =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal-deep/25";

interface CalendarActionsProps {
  revealed: boolean;
  reducedMotion: boolean;
}

const CalendarActions = memo(function CalendarActions({
  revealed,
  reducedMotion,
}: CalendarActionsProps) {
  const [icsSaved, setIcsSaved] = useState(false);
  const [inApp, setInApp] = useState(false);
  const icsTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setInApp(isInAppBrowser());
    return () => {
      if (icsTimerRef.current !== null) window.clearTimeout(icsTimerRef.current);
    };
  }, []);

  const handleDownloadIcs = useCallback(() => {
    downloadIcs(EVENT);
    setIcsSaved(true);
    triggerHaptic(10);
    if (icsTimerRef.current !== null) window.clearTimeout(icsTimerRef.current);
    icsTimerRef.current = window.setTimeout(() => {
      setIcsSaved(false);
      icsTimerRef.current = null;
    }, 2500);
  }, []);

  const revealInitial = reducedMotion ? REVEAL_REDUCED_INITIAL : REVEAL_INITIAL;
  const revealVisible = reducedMotion ? REVEAL_REDUCED_VISIBLE : REVEAL_VISIBLE;

  return (
    <m.div
      initial={revealInitial}
      whileInView={revealed ? revealVisible : revealInitial}
      viewport={VIEWPORT_CONFIG}
      transition={
        reducedMotion
          ? REVEAL_REDUCED_TRANSITION
          : { ...REVEAL_TRANSITION, delay: 0.08 }
      }
      className="mt-5 grid w-full max-w-[360px] grid-cols-2 gap-2.5"
    >
      <m.a
        whileHover={reducedMotion ? undefined : { y: -1 }}
        whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        href={googleCalendarUrl(EVENT)}
        target={inApp ? undefined : "_blank"}
        rel={inApp ? undefined : "noopener noreferrer"}
        className={`flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-royal-deep/20 bg-white/85 px-3 py-2 font-sans text-[11.5px] sm:text-[12px] font-semibold text-royal-navy shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_-6px_rgba(7,23,57,0.18)] transition-colors hover:border-royal-deep hover:bg-white ${FOCUS_RING_CLS}`}
      >
        <ExternalLink className="size-3.5 shrink-0 text-royal-deep" aria-hidden />
        <span>Google Agenda</span>
      </m.a>

      <m.button
        type="button"
        whileHover={reducedMotion ? undefined : { y: -1 }}
        whileTap={reducedMotion ? undefined : { scale: 0.96 }}
        onClick={handleDownloadIcs}
        aria-live="polite"
        className={`flex min-h-11 cursor-pointer items-center justify-center whitespace-nowrap rounded-xl border px-3 py-2 font-sans text-[11.5px] sm:text-[12px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_12px_-6px_rgba(7,23,57,0.18)] transition-colors ${FOCUS_RING_CLS} ${
          icsSaved
            ? "border-royal-navy bg-royal-navy text-white"
            : "border-royal-deep/20 bg-white/85 text-royal-navy hover:border-royal-deep hover:bg-white"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {icsSaved ? (
            <m.span
              key="ics-saved"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="inline-flex items-center gap-1.5"
            >
              <Check className="size-3.5 shrink-0" aria-hidden />
              <span>Salvo na agenda!</span>
            </m.span>
          ) : (
            <m.span
              key="ics-idle"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="inline-flex items-center gap-1.5"
            >
              <CalendarPlus className="size-3.5 shrink-0 text-royal-deep" aria-hidden />
              <span>iPhone / Outlook</span>
            </m.span>
          )}
        </AnimatePresence>
      </m.button>
    </m.div>
  );
});

export default CalendarActions;
