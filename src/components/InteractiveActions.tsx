"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useId, useState, type ComponentType, type CSSProperties } from "react";
import LocationSheet from "@/components/sheets/LocationSheet";
import RsvpSheet from "@/components/sheets/RsvpSheet";
import Sheet from "@/components/ui/Sheet";

type ActionKey = "location" | "rsvp";

interface ActionItem {
  key: ActionKey;
  line1: string;
  line2: string;
  subtitle: string;
  align: "left" | "right";
  Icon: ComponentType<{ className?: string }>;
}

/* ───────── Seta Prateada Curva Animada (GPU CSS) ───────── */

function AnimatedCurvedArrow({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      style={
        {
          "--float-duration": "1.7s",
          "--ty": "4px",
          "--r-start": "0deg",
          "--r-mid": "0deg",
        } as CSSProperties
      }
      className={`animate-sticker-float ${className}`}
      aria-hidden
    >
      <path
        d="M 18 5 C 18 13, 18 20, 18 28"
        stroke="#E2E8F0"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M 11 22 L 18 29 L 25 22"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ───────── Ícones Vetoriais Azul Royal dentro dos Medalhões ───────── */

function HollowMapPinIcon({ className = "size-9" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `pin-royal-${uid}`;
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <path
        d="M 24 6 C 15.7 6 9 12.6 9 20.8 C 9 31.4 24 42 24 42 C 24 42 39 31.4 39 20.8 C 39 12.6 32.3 6 24 6 Z"
        stroke={`url(#${gradId})`}
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="20.5" r="5.5" stroke={`url(#${gradId})`} strokeWidth="2.1" />
    </svg>
  );
}

function HollowRsvpIcon({ className = "size-9" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `rsvp-royal-${uid}`;
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      <circle cx="21" cy="15.5" r="6.2" stroke={`url(#${gradId})`} strokeWidth="2" />
      <path
        d="M 9.5 36.5 C 9.5 29.8 14.6 25 21 25 C 23.3 25 25.4 25.6 27.2 26.7"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="33" cy="32.5" r="7.5" stroke={`url(#${gradId})`} strokeWidth="2" />
      <path
        d="M 29.6 32.5 L 32 34.9 L 36.6 30.2"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ACTIONS: ActionItem[] = [
  {
    key: "location",
    line1: "LOCAL",
    line2: "DA FESTA",
    subtitle: "Mapa, endereço e rotas",
    align: "left",
    Icon: HollowMapPinIcon,
  },
  {
    key: "rsvp",
    line1: "CONFIRMAR",
    line2: "PRESENÇA",
    subtitle: "Confirmação rápida via WhatsApp",
    align: "right",
    Icon: HollowRsvpIcon,
  },
];

const SHEETS: Record<ActionKey, { title: string; subtitle: string; Content: ComponentType }> = {
  location: {
    title: "LOCAL DA FESTA",
    subtitle: "Rotas diretas pelo Waze e Google Maps",
    Content: LocationSheet,
  },
  rsvp: {
    title: "CONFIRMAR PRESENÇA",
    subtitle: "Confirmação rápida pelo WhatsApp",
    Content: RsvpSheet,
  },
};

function MedallionButton({
  item,
  onSelect,
}: {
  item: ActionItem;
  onSelect: () => void;
}) {
  const { Icon, align, line1, line2, subtitle } = item;
  const isRight = align === "right";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.025, y: -3 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
      className={`group relative flex w-full max-w-[328px] sm:max-w-[376px] cursor-pointer items-center outline-none focus-visible:ring-4 focus-visible:ring-white/45 rounded-full ${
        isRight ? "flex-row-reverse self-end" : "flex-row self-start"
      }`}
    >
      {/* Placa translúcida frosted-glass azul & prata com reflexo interativo */}
      <span
        className={`glass-royal-card interactive-sheen pointer-events-none absolute inset-y-1.5 overflow-hidden ${
          isRight ? "right-9 left-1.5" : "left-9 right-1.5"
        } rounded-2xl transition-all duration-300 group-hover:border-white/50`}
        aria-hidden
      >
        {/* Varredura luminosa discreta ao passar o mouse */}
        <span
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-sheen"
          aria-hidden
        />
      </span>

      {/* Medalhão Redondo com Aro Duplo Cromado e Ponto Especular */}
      <span
        className="relative z-10 grid size-[76px] sm:size-[86px] shrink-0 place-items-center rounded-full p-[4px] shadow-[0_14px_30px_-6px_rgba(9,13,22,0.65),0_0_24px_rgba(255,255,255,0.24)] transition-transform duration-300 group-hover:scale-105"
        style={{
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 38%, #FFFFFF 64%, #94A3B8 100%)",
        }}
      >
        {/* Ponto de luz especular no aro */}
        <span
          className="pointer-events-none absolute top-1.5 left-3.5 size-2 rounded-full bg-white/95 blur-[0.5px]"
          aria-hidden
        />

        <span
          className="grid size-full place-items-center rounded-full border border-royal-700/25 bg-[linear-gradient(145deg,#FFFFFF_0%,#F1F5F9_55%,#E2E8F0_100%)] p-[3px] shadow-[inset_0_1px_3px_rgba(255,255,255,0.95)]"
          aria-hidden
        >
          <span className="grid size-full place-items-center rounded-full border border-silver-300/60">
            <Icon className="size-8 sm:size-9 transition-transform duration-300 group-hover:scale-105" />
          </span>
        </span>
      </span>

      {/* Rótulo Tipográfico + Subtítulo + Indicador de Ação */}
      <span
        className={`relative z-10 flex min-w-0 flex-1 items-center justify-between gap-2 py-2.5 ${
          isRight ? "flex-row-reverse pl-4 pr-3 sm:pl-5 sm:pr-4" : "flex-row pl-3 pr-4 sm:pl-4 sm:pr-5"
        }`}
      >
        <span
          className={`flex min-w-0 flex-col ${
            isRight ? "items-end text-right" : "items-start text-left"
          }`}
        >
          <span className="font-serif text-[12.5px] sm:text-[14.5px] font-semibold leading-[1.28] tracking-[0.14em] text-white group-hover:text-silver-50">
            {line1}
          </span>
          <span className="font-serif text-[12.5px] sm:text-[14.5px] font-medium leading-[1.28] tracking-[0.14em] text-silver-200 group-hover:text-white">
            {line2}
          </span>
          <span className="mt-1 truncate max-w-full font-sans text-[10px] sm:text-[11px] font-normal tracking-wide text-silver-200/80">
            {subtitle}
          </span>
        </span>

        {/* Micro-indicador de ação deslizante no hover */}
        <span
          className={`grid size-6 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-silver-100 transition-transform duration-300 ${
            isRight ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"
          }`}
          aria-hidden
        >
          {isRight ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </span>
      </span>
    </motion.button>
  );
}

export default function InteractiveActions() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ActionKey>("location");
  const close = useCallback(() => setOpen(false), []);
  const select = useCallback((key: ActionKey) => {
    setCurrent(key);
    setOpen(true);
  }, []);
  const sheet = SHEETS[current];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-3.5 flex flex-col items-center gap-1">
        <span className="font-serif text-[10px] sm:text-[11px] font-medium tracking-[0.24em] text-silver-200/90 uppercase">
          Toque para interagir
        </span>
        <AnimatedCurvedArrow className="size-6" />
      </div>

      {/* Lista de Botões Interativos: Local da Festa e Confirmar Presença */}
      <div className="flex w-full max-w-[356px] sm:max-w-[400px] flex-col gap-4 sm:gap-5">
        {ACTIONS.map((item) => (
          <MedallionButton key={item.key} item={item} onSelect={() => select(item.key)} />
        ))}
      </div>

      <Sheet open={open} onClose={close} title={sheet.title} subtitle={sheet.subtitle}>
        <sheet.Content />
      </Sheet>
    </div>
  );
}
