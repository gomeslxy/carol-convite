"use client";

import { motion } from "framer-motion";
import { useCallback, useId, useState, type ComponentType } from "react";
import Sheet from "@/components/ui/Sheet";
import LocationSheet from "@/components/sheets/LocationSheet";
import RsvpSheet from "@/components/sheets/RsvpSheet";

type ActionKey = "location" | "rsvp";

interface ActionItem {
  key: ActionKey;
  line1: string;
  line2: string;
  align: "left" | "right";
  Icon: ComponentType<{ className?: string }>;
}

/* ───────── Seta Prateada Curva Animada (Sinalização Elegante) ───────── */

function AnimatedCurvedArrow({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 36 36"
      fill="none"
      className={className}
      animate={{ y: [0, 4, 0] }}
      transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
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
    </motion.svg>
  );
}

/* ───────── Ícones Vetoriais Azul Royal / Prata dentro dos Medalhões ───────── */

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
      <circle
        cx="24"
        cy="20.5"
        r="5.5"
        stroke={`url(#${gradId})`}
        strokeWidth="2.1"
      />
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
      <circle
        cx="21"
        cy="15.5"
        r="6.2"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
      />
      <path
        d="M 9.5 36.5 C 9.5 29.8 14.6 25 21 25 C 23.3 25 25.4 25.6 27.2 26.7"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="33"
        cy="32.5"
        r="7.5"
        stroke={`url(#${gradId})`}
        strokeWidth="2"
      />
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
    align: "left",
    Icon: HollowMapPinIcon,
  },
  {
    key: "rsvp",
    line1: "CONFIRMAR",
    line2: "PRESENÇA",
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
  const { Icon, align, line1, line2 } = item;
  const isRight = align === "right";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
      className={`group relative flex w-full max-w-[310px] sm:max-w-[350px] cursor-pointer items-center outline-none focus-visible:ring-4 focus-visible:ring-white/45 rounded-full ${
        isRight ? "flex-row-reverse self-end" : "flex-row self-start"
      }`}
    >
      {/* Placa translúcida frosted-glass azul & prata sobre o fundo Azul Royal */}
      <span
        className={`pointer-events-none absolute inset-y-2 ${
          isRight ? "right-9 left-2" : "left-9 right-2"
        } rounded-2xl bg-white/12 border border-white/25 shadow-[0_12px_28px_-10px_rgba(9,13,22,0.5)] backdrop-blur-md transition-all duration-300 group-hover:bg-white/18 group-hover:border-white/45`}
        aria-hidden
      />

      {/* Medalhão Redondo em Prata Acetinado Brilhante com Ícone Azul Royal */}
      <span
        className="relative z-10 grid size-[78px] sm:size-[86px] shrink-0 place-items-center rounded-full p-[5px] shadow-[0_12px_28px_-6px_rgba(9,13,22,0.6),0_0_20px_rgba(255,255,255,0.22)] transition-transform duration-300 group-hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 48%, #CBD5E1 100%)",
        }}
      >
        <span
          className="grid size-full place-items-center rounded-full border border-royal-700/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]"
          aria-hidden
        >
          <Icon className="size-9 sm:size-10 transition-transform duration-300 group-hover:scale-105" />
        </span>
      </span>

      {/* Rótulo Tipográfico em Branco/Prata */}
      <span
        className={`relative z-10 flex flex-col justify-center px-4 sm:px-5 py-2.5 ${
          isRight ? "items-end text-right" : "items-start text-left"
        }`}
      >
        <span className="font-serif text-[13.5px] sm:text-[15px] font-medium leading-[1.35] tracking-[0.14em] text-white group-hover:text-silver-100">
          {line1}
        </span>
        <span className="font-serif text-[13.5px] sm:text-[15px] font-medium leading-[1.35] tracking-[0.14em] text-silver-200 group-hover:text-white">
          {line2}
        </span>
      </span>
    </motion.button>
  );
}

export default function InteractiveActions() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ActionKey>("location");
  const close = useCallback(() => setOpen(false), []);
  const select = (key: ActionKey) => {
    setCurrent(key);
    setOpen(true);
  };
  const sheet = SHEETS[current];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Seta animada discreta convidando a clicar nos botões */}
      <div className="mb-3 flex flex-col items-center gap-1">
        <span className="font-serif text-[10px] sm:text-[11px] font-medium tracking-[0.24em] text-silver-200/85 uppercase">
          Toque para interagir
        </span>
        <AnimatedCurvedArrow className="size-6" />
      </div>

      {/* Lista de Botões Interativos (Local da Festa & Confirmar Presença) */}
      <div className="flex w-full max-w-[340px] sm:max-w-[380px] flex-col gap-4 sm:gap-5">
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
