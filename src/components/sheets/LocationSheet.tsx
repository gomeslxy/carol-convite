"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, CalendarPlus, Check, Copy, MapPin, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SheetButton from "@/components/sheets/SheetButton";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";
import {
  copyToClipboard,
  downloadIcs,
  googleCalendarUrl,
  googleMapsEmbedUrl,
  googleMapsUrl,
  wazeUrl,
} from "@/lib/utils";

export default function LocationSheet() {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  const { venue } = EVENT;

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const copyAddress = async () => {
    if (await copyToClipboard(venue.address)) {
      setCopied(true);
      if ("vibrate" in navigator) navigator.vibrate?.(10);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2200);
    }
  };

  return (
    <div className="space-y-5 pt-1">
      <div className="rounded-2xl border border-silver-200 bg-white/85 p-4 text-center shadow-[0_10px_26px_-16px_rgba(15,23,42,0.3)]">
        <p className="font-serif text-lg font-semibold tracking-[0.12em] text-royal-900">
          {venue.name}
        </p>

        <div className="mt-2 flex items-center justify-center gap-2">
          <p className="font-sans text-[13px] leading-relaxed text-slate-600">{venue.address}</p>
          <button
            type="button"
            onClick={copyAddress}
            aria-label={copied ? "Endereço copiado" : "Copiar endereço"}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border border-silver-300 bg-white text-silver-500 transition hover:border-royal-700 hover:text-royal-800 active:scale-90"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "ok" : "copy"}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {copied ? (
                  <Check className="size-3.5 text-royal-700" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        <div className="mt-3 flex min-h-6 items-center justify-center" aria-live="polite">
          {copied ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-royal-700/25 bg-silver-100 px-3 py-1 font-sans text-[11px] font-semibold text-royal-800">
              <Check className="size-3" /> Endereço copiado!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-silver-200 bg-silver-50 px-3 py-1 font-sans text-[10.5px] font-medium tracking-[0.15em] text-slate-600">
              <CalendarDays className="size-3.5 text-royal-700" /> {FORMATTED_EVENT_DATE.weekday} ·{" "}
              {FORMATTED_EVENT_DATE.short} · {FORMATTED_EVENT_DATE.time}
            </span>
          )}
        </div>
      </div>

      <div className="bg-chrome relative overflow-hidden rounded-3xl p-[1.5px] shadow-[0_14px_30px_-16px_rgba(15,23,42,0.45)]">
        <div className="overflow-hidden rounded-[22px] bg-silver-100">
          <iframe
            title={`Mapa — ${venue.name}`}
            src={googleMapsEmbedUrl(venue.mapsQuery)}
            className="block h-52 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SheetButton href={googleMapsUrl(venue.mapsQuery)} icon={MapPin} tone="royal">
          Google Maps
        </SheetButton>
        <SheetButton href={wazeUrl(venue.mapsQuery)} icon={Navigation} tone="royal">
          Waze
        </SheetButton>
        <SheetButton href={googleCalendarUrl(EVENT)} icon={CalendarPlus}>
          Google Agenda
        </SheetButton>
        <SheetButton onClick={() => downloadIcs(EVENT)} icon={CalendarDays}>
          iPhone / Outlook
        </SheetButton>
      </div>
    </div>
  );
}
