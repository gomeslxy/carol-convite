"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Copy,
  Gem,
  Headphones,
  Plane,
  QrCode,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Bow } from "@/components/BowDecoration";
import { EVENT, type GiftSuggestionIcon } from "@/config/event";
import { copyToClipboard } from "@/lib/utils";

const ICONS: Record<GiftSuggestionIcon, LucideIcon> = {
  perfume: Sparkles,
  jewelry: Gem,
  travel: Plane,
  books: BookOpen,
  music: Headphones,
  shopping: ShoppingBag,
};

export default function GiftsSheet() {
  const [copied, setCopied] = useState(false);
  const { gifts } = EVENT;

  const copyPix = async () => {
    if (await copyToClipboard(gifts.pixKey)) {
      setCopied(true);
      if ("vibrate" in navigator) navigator.vibrate?.(10);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="space-y-6 pt-1">
      <p className="text-center font-sans text-[13px] leading-relaxed text-slate-600">{gifts.message}</p>

      {/* Cartão PIX */}
      <div className="bg-imperial relative overflow-hidden rounded-3xl p-5 text-white shadow-[0_18px_40px_-18px_rgba(23,37,84,0.85)] ring-1 ring-inset ring-white/15">
        <div className="pointer-events-none absolute -top-16 -right-16 size-44 rounded-full bg-white/10 blur-2xl" />
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-sheen" />
        <Bow variant="silver" className="absolute top-3 right-3 w-12 opacity-90" />

        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-white/12 ring-1 ring-white/25">
            <QrCode className="size-[18px]" />
          </span>
          <div>
            <p className="font-serif text-[13px] font-semibold tracking-[0.3em]">PIX</p>
            <p className="font-sans text-[11px] text-blue-100/80">Chave {gifts.pixKeyType}</p>
          </div>
        </div>

        <p className="mt-4 break-all font-sans text-[17px] font-semibold tracking-wide">{gifts.pixKey}</p>
        <p className="mt-1 font-sans text-[11.5px] text-blue-100/75">
          {gifts.pixHolder} · {gifts.pixBank}
        </p>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={copyPix}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white font-sans text-[13px] font-semibold text-royal-900 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? "ok" : "copy"}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Chave copiada!" : "Copiar chave Pix"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Sugestões */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <span className="hairline-silver h-px flex-1" />
          <span className="font-serif text-[11px] font-semibold tracking-[0.3em] text-silver-500">SUGESTÕES</span>
          <span className="hairline-silver h-px flex-1" />
        </div>
        <ul className="grid grid-cols-2 gap-3">
          {gifts.suggestions.map((s, i) => {
            const Icon = ICONS[s.icon];
            return (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-silver-200 bg-white/85 p-3.5 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.35)]"
              >
                <span className="bg-chrome grid size-9 place-items-center rounded-xl text-royal-800 ring-1 ring-inset ring-white">
                  <Icon className="size-[18px]" strokeWidth={1.7} />
                </span>
                <p className="mt-2.5 font-sans text-[12.5px] font-semibold leading-tight text-royal-900">{s.title}</p>
                <p className="mt-1 font-sans text-[11px] leading-snug text-slate-500">{s.description}</p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

