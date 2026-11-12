"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, Check, Copy, MapPin, Navigation, CalendarDays } from "lucide-react";
import { useState } from "react";
import SheetButton from "@/components/sheets/SheetButton";
import { EVENT, getFormattedDate } from "@/config/event";
import { copyToClipboard, downloadIcs, googleCalendarUrl, googleMapsEmbedUrl, googleMapsUrl, wazeUrl } from "@/lib/utils";

export default function LocationSheet() {
  const [copied, setCopied] = useState(false);
  const date = getFormattedDate();
  const { venue } = EVENT;

  const copyAddress = async () => {
    if (await copyToClipboard(venue.address)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5 pt-1">
      <div className="text-center">
        <p className="font-serif text-lg font-semibold tracking-[0.12em] text-royal-900">{venue.name}</p>
        <div className="mt-2 flex items-start justify-center gap-2">
          <p className="font-sans text-[13px] leading-relaxed text-slate-600">{venue.address}</p>
          <button
            type="button"
            onClick={copyAddress}
            aria-label="Copiar endereço"
            className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-silver-300 bg-white text-silver-500 transition active:scale-90"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "ok" : "copy"}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {copied ? <Check className="size-3.5 text-royal-700" /> : <Copy className="size-3.5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
        <p className="mt-2 inline-flex items-center gap-1.5 font-sans text-[11px] font-medium tracking-[0.18em] text-silver-500">
          <CalendarDays className="size-3.5" /> {date.weekday} · {date.short} · {date.time}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl p-[1.5px] bg-chrome shadow-[0_14px_30px_-16px_rgba(15,23,42,0.45)]">
        <div className="overflow-hidden rounded-[22px] bg-silver-100">
          <iframe
            title={`Mapa — ${venue.name}`}
            src={googleMapsEmbedUrl(venue.mapsQuery)}
            className="block h-52 w-full grayscale-[35%]"
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

