"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Heart, HeartCrack, MessageCircle, Minus, Plus } from "lucide-react";
import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { fireMiniCelebration } from "@/components/LuxuryParticles";
import SheetButton from "@/components/sheets/SheetButton";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";
import { whatsappUrl } from "@/lib/utils";

type Attendance = "yes" | "no";

export default function RsvpSheet() {
  const ids = { name: useId(), nameError: useId(), guests: useId(), message: useId() };
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("yes");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const whatsappHref = useMemo(() => {
    const trimmedName = name.trim();
    const trimmedMsg = message.trim();
    const dateLabel = FORMATTED_EVENT_DATE.short.replace(/\s·\s/g, "/");

    const lines =
      attendance === "yes"
        ? [
          `Olá, ${EVENT.name}! 💙 Quero confirmar minha presença na sua festa de ${EVENT.age} anos no dia ${dateLabel}!`,
          "",
          `👤 Nome: ${trimmedName}`,
          `👥 Total de pessoas: ${guests}`,
        ]
        : [
          `Olá, ${EVENT.name}! Infelizmente não poderei comparecer à sua festa de ${EVENT.age} anos. 🤍`,
          "",
          `👤 Nome: ${trimmedName}`,
        ];

    if (trimmedMsg) {
      lines.push(`💌 Recado: ${trimmedMsg}`);
    }

    return whatsappUrl(EVENT.rsvp.whatsapp, lines.join("\n"));
  }, [name, attendance, guests, message]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Por favor, informe seu nome para confirmar.");
      nameInputRef.current?.focus();
      return;
    }

    setError(null);
    if (attendance === "yes") {
      fireMiniCelebration({ x: 0.5, y: 0.75 });
    }
    window.open(whatsappHref, "_blank", "noopener,noreferrer");
  };

  const inputCls =
    "w-full rounded-2xl border border-silver-300 bg-white/95 px-4 py-3 font-sans text-[15px] text-slate-800 placeholder:text-silver-400 outline-none transition focus:border-royal-700 focus:ring-4 focus:ring-royal-700/10";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1" noValidate>
      <p className="text-center font-sans text-[12px] leading-relaxed text-slate-600">
        Por gentileza, confirme sua presença até{" "}
        <strong className="font-semibold text-royal-800">{EVENT.rsvp.deadline}</strong>.
      </p>

      {/* Seletor de Presença */}
      <div
        className="grid grid-cols-2 gap-2 rounded-2xl bg-silver-100 p-1.5 ring-1 ring-inset ring-silver-200"
        role="radiogroup"
        aria-label="Presença"
      >
        {(
          [
            { value: "yes", label: "Estarei lá!", Icon: Heart },
            { value: "no", label: "Não poderei", Icon: HeartCrack },
          ] as const
        ).map(({ value, label, Icon }) => {
          const active = attendance === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setAttendance(value)}
              className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-3 font-sans text-[13px] font-semibold transition-colors ${active ? "text-white" : "text-slate-500"
                }`}
            >
              {active && (
                <motion.span
                  layoutId="rsvp-pill"
                  className="bg-imperial absolute inset-0 rounded-xl shadow-[0_8px_18px_-8px_rgba(23,37,84,0.7)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon
                className="relative size-4"
                fill={active && value === "yes" ? "currentColor" : "none"}
              />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Nome Completo */}
      <div>
        <label
          htmlFor={ids.name}
          className="mb-1.5 block font-sans text-[11px] font-semibold tracking-[0.18em] text-silver-500 uppercase"
        >
          SEU NOME
        </label>
        <input
          ref={nameInputRef}
          id={ids.name}
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Digite seu nome e sobrenome"
          autoComplete="name"
          enterKeyHint="done"
          aria-invalid={!!error}
          aria-describedby={error ? ids.nameError : undefined}
          className={`${inputCls} ${error ? "border-royal-800 ring-4 ring-royal-800/15" : ""}`}
        />
        <AnimatePresence>
          {error && (
            <motion.div
              id={ids.nameError}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-silver-300/60 bg-royal-900 px-3 py-1.5 font-sans text-[12px] font-medium text-white shadow-sm"
              role="alert"
            >
              <AlertCircle className="size-3.5 shrink-0 text-silver-200" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quantidade de Pessoas (transição GPU-only sem animar height: auto) */}
      <AnimatePresence initial={false} mode="wait">
        {attendance === "yes" && (
          <motion.div
            key="guests-picker"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              id={ids.guests}
              className="mb-1.5 block font-sans text-[11px] font-semibold tracking-[0.18em] text-silver-500 uppercase"
            >
              TOTAL DE PESSOAS (INCLUINDO VOCÊ)
            </span>
            <div
              className="flex items-center justify-between rounded-2xl border border-silver-300 bg-white/95 p-1.5"
              aria-labelledby={ids.guests}
            >
              <button
                type="button"
                aria-label="Diminuir quantidade de pessoas"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                className="grid size-11 cursor-pointer place-items-center rounded-xl bg-silver-100 text-royal-800 transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <span
                className="relative h-8 w-12 overflow-hidden text-center font-serif text-2xl tabular-nums text-royal-900"
                aria-live="polite"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={guests}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {guests}
                  </motion.span>
                </AnimatePresence>
              </span>
              <button
                type="button"
                aria-label="Aumentar quantidade de pessoas"
                onClick={() => setGuests((g) => Math.min(EVENT.rsvp.maxGuests, g + 1))}
                disabled={guests >= EVENT.rsvp.maxGuests}
                className="grid size-11 cursor-pointer place-items-center rounded-xl bg-silver-100 text-royal-800 transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recado Opcional */}
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label
            htmlFor={ids.message}
            className="block font-sans text-[11px] font-semibold tracking-[0.18em] text-silver-500 uppercase"
          >
            RECADO PARA A {EVENT.name.toUpperCase()}{" "}
            <span className="font-normal tracking-normal lowercase">(opcional)</span>
          </label>
          <span className="font-sans text-[10.5px] tabular-nums text-silver-400">
            {message.length}/280
          </span>
        </div>
        <textarea
          id={ids.message}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          maxLength={280}
          placeholder="Deixe uma mensagem carinhosa…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Botão Submit real para executar validação antes de abrir o WhatsApp */}
      <SheetButton
        type="submit"
        icon={MessageCircle}
        tone="royal"
        className="min-h-13 cursor-pointer text-[13.5px]"
      >
        Confirmar pelo WhatsApp
      </SheetButton>
    </form>
  );
}
