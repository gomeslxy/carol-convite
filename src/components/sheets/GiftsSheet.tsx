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
import { useEffect, useId, useRef, useState } from "react";
import { Bow } from "@/components/BowDecoration";
import { fireMiniCelebration } from "@/components/LuxuryParticles";
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

function SilverBankChip() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `pix-chip-${uid}`;

  return (
    <svg viewBox="0 0 42 30" className="h-6 w-8.5 shrink-0 drop-shadow-sm" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E2E8F0" />
          <stop offset="68%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="40"
        height="28"
        rx="5"
        fill={`url(#${gradId})`}
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1"
      />
      <path
        d="M14 1 V29 M28 1 V29 M1 10 H14 M1 20 H14 M28 10 H41 M28 20 H41 M14 15 H28"
        stroke="#475569"
        strokeOpacity="0.45"
        strokeWidth="0.9"
        fill="none"
      />
    </svg>
  );
}

export default function GiftsSheet() {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  const { gifts } = EVENT;

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const copyPix = async () => {
    if (await copyToClipboard(gifts.pixKey)) {
      setCopied(true);
      fireMiniCelebration({ x: 0.5, y: 0.55 });
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
    <div className="space-y-6 pt-1">
      <p className="text-center font-sans text-[13px] leading-relaxed text-slate-600">
        {gifts.message}
      </p>

      {/* Cartão PIX Private Bank em Azul Royal & Prata */}
      <div className="bg-imperial relative overflow-hidden rounded-3xl p-5 text-white shadow-[0_18px_40px_-18px_rgba(23,37,84,0.85)] ring-1 ring-inset ring-white/25">
        <div className="pointer-events-none absolute -top-16 -right-16 size-44 rounded-full bg-white/12 blur-2xl" />
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-sheen" />
        <Bow variant="silver" className="absolute top-3 right-3 w-12 opacity-90" />

        <div className="flex items-center gap-3">
          <SilverBankChip />
          <span className="grid size-8 place-items-center rounded-xl bg-white/12 ring-1 ring-white/25">
            <QrCode className="size-4" />
          </span>
          <div>
            <p className="font-serif text-[13px] font-semibold tracking-[0.3em]">PIX</p>
            <p className="font-sans text-[11px] text-silver-200/85">Chave {gifts.pixKeyType}</p>
          </div>
        </div>

        <p className="mt-4 break-all font-sans text-[17px] font-semibold tracking-wide text-white">
          {gifts.pixKey}
        </p>
        <p className="mt-1 font-sans text-[11.5px] text-silver-200/80">
          {gifts.pixHolder} · {gifts.pixBank}
        </p>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={copyPix}
          aria-live="polite"
          className={`mt-4 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl font-sans text-[13px] font-semibold transition-all ${
            copied
              ? "bg-silver-100 text-royal-950 ring-2 ring-white shadow-[0_10px_24px_-8px_rgba(255,255,255,0.65)]"
              : "bg-white text-royal-900 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)] hover:bg-silver-50"
          }`}
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
              {copied ? <Check className="size-4 text-royal-800" /> : <Copy className="size-4" />}
              {copied ? "Chave Pix copiada!" : "Copiar chave Pix"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Sugestões */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <span className="hairline-silver h-px flex-1" />
          <span className="font-serif text-[11px] font-semibold tracking-[0.3em] text-silver-500">
            SUGESTÕES
          </span>
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
                whileHover={{ y: -2 }}
                transition={{ delay: 0.12 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-silver-200 bg-white/85 p-3.5 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.35)] transition-colors hover:border-royal-500/40"
              >
                <span className="bg-chrome grid size-9 place-items-center rounded-xl text-royal-800 ring-1 ring-inset ring-white">
                  <Icon className="size-[18px]" strokeWidth={1.7} />
                </span>
                <p className="mt-2.5 font-sans text-[12.5px] font-semibold leading-tight text-royal-900">
                  {s.title}
                </p>
                <p className="mt-1 font-sans text-[11px] leading-snug text-slate-500">
                  {s.description}
                </p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
