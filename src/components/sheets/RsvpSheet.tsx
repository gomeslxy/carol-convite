"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, HeartCrack, MessageCircle, Minus, Plus } from "lucide-react";
import { useId, useMemo, useState, type FormEvent } from "react";
import SheetButton from "@/components/sheets/SheetButton";
import { EVENT } from "@/config/event";
import { whatsappUrl } from "@/lib/utils";

type Attendance = "yes" | "no";

export default function RsvpSheet() {
  const ids = { name: useId(), guests: useId(), message: useId() };
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("yes");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Monta a mensagem do WhatsApp em tempo real com os dados preenchidos
  const whatsappHref = useMemo(() => {
    const trimmedName = name.trim();
    const trimmedMsg = message.trim();

    if (!trimmedName && !trimmedMsg && attendance === "yes" && guests === 1) {
      return whatsappUrl(EVENT.rsvp.whatsapp, EVENT.rsvp.defaultMessage);
    }

    const lines =
      attendance === "yes"
        ? [
            `Olá, ${EVENT.name}! 💙 Quero confirmar minha presença na sua festa de ${EVENT.age} anos no dia 17/07/2027!`,
            "",
            ...(trimmedName ? [`👤 Nome: ${trimmedName}`] : []),
            `👥 Total de pessoas: ${guests}`,
          ]
        : [
            `Olá, ${EVENT.name}! Infelizmente não poderei comparecer à sua festa de ${EVENT.age} anos. 🤍`,
            ...(trimmedName ? ["", `👤 Nome: ${trimmedName}`] : []),
          ];

    if (trimmedMsg) {
      lines.push(`💌 Recado: ${trimmedMsg}`);
    }

    return whatsappUrl(EVENT.rsvp.whatsapp, lines.join("\n"));
  }, [name, attendance, guests, message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0 && name.trim().length < 2) {
      setError("Informe seu nome para confirmar.");
      return;
    }
    setError(null);
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
              className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-3 font-sans text-[13px] font-semibold transition-colors ${
                active ? "text-white" : "text-slate-500"
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
          id={ids.name}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Digite seu nome e sobrenome"
          autoComplete="name"
          enterKeyHint="done"
          aria-invalid={!!error}
          className={inputCls}
        />
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1.5 font-sans text-[12px] text-red-600"
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Quantidade de Pessoas */}
      <AnimatePresence initial={false}>
        {attendance === "yes" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
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
                aria-label="Diminuir"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                disabled={guests <= 1}
                className="grid size-11 cursor-pointer place-items-center rounded-xl bg-silver-100 text-royal-800 transition active:scale-90 disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>
              <span
                className="relative h-8 w-12 overflow-hidden text-center font-serif text-2xl text-royal-900"
                aria-live="polite"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={guests}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="absolute inset-0"
                  >
                    {guests}
                  </motion.span>
                </AnimatePresence>
              </span>
              <button
                type="button"
                aria-label="Aumentar"
                onClick={() => setGuests((g) => Math.min(EVENT.rsvp.maxGuests, g + 1))}
                disabled={guests >= EVENT.rsvp.maxGuests}
                className="grid size-11 cursor-pointer place-items-center rounded-xl bg-silver-100 text-royal-800 transition active:scale-90 disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recado Opcional */}
      <div>
        <label
          htmlFor={ids.message}
          className="mb-1.5 block font-sans text-[11px] font-semibold tracking-[0.18em] text-silver-500 uppercase"
        >
          RECADO PARA A {EVENT.name.toUpperCase()}{" "}
          <span className="font-normal tracking-normal lowercase">(opcional)</span>
        </label>
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

      {/* Botão Único Direto para o WhatsApp (+55 19 97134-5909) */}
      <SheetButton
        href={whatsappHref}
        icon={MessageCircle}
        tone="royal"
        className="min-h-13 text-[13.5px]"
      >
        Confirmar pelo WhatsApp
      </SheetButton>
    </form>
  );
}
