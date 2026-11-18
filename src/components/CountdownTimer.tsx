"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useState } from "react";
import { EVENT_TIMESTAMP } from "@/config/event";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function computeTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff === 0,
  };
}

function useCountdown(target: number, active: boolean): TimeLeft | null {
  // null no SSR e no primeiro render cliente -> zero Hydration Mismatch
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!active) return;
    let timeoutId: number;

    const tick = () => {
      setTime(computeTimeLeft(target));
      timeoutId = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 12);
    };

    tick();
    return () => window.clearTimeout(timeoutId);
  }, [target, active]);

  return time;
}

const RollingDigit = memo(function RollingDigit({ digit }: { digit: string }) {
  return (
    <span
      className="relative inline-block h-[1.15em] w-[0.64em] overflow-hidden align-top"
      style={{ perspective: "420px" }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: "-78%", rotateX: 38, scale: 0.9, opacity: 0 }}
          animate={{ y: "0%", rotateX: 0, scale: 1, opacity: 1 }}
          exit={{ y: "78%", rotateX: -38, scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center text-royal-navy"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
});

const CountdownUnit = memo(function CountdownUnit({
  value,
  label,
  ready,
  showDivider,
}: {
  value: number;
  label: string;
  ready: boolean;
  showDivider: boolean;
}) {
  const digits = String(value).padStart(2, "0").split("");
  const isThreeDigits = digits.length >= 3;

  return (
    <div className="relative flex min-w-0 flex-col items-center justify-center px-1 py-1 sm:px-2">
      <span
        className={`flex items-center justify-center font-serif font-bold tabular-nums leading-none tracking-tight text-royal-navy transition-opacity duration-500 ${
          isThreeDigits
            ? "text-[clamp(24px,6.4vw,42px)] sm:text-[42px]"
            : "text-[clamp(28px,7.4vw,46px)] sm:text-[46px]"
        } ${ready ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      >
        {ready ? (
          digits.map((d, i) => <RollingDigit key={`${digits.length}-${i}`} digit={d} />)
        ) : (
          <span className="inline-block h-[1.15em] w-[1.28em]" />
        )}
      </span>

      <span className="mt-2.5 inline-flex items-center justify-center rounded-full border border-white/15 bg-royal-navy px-2.5 py-0.5 sm:px-3.5 sm:py-1 font-sans text-[8px] sm:text-[10px] font-bold tracking-[0.1em] sm:tracking-[0.16em] text-white uppercase shadow-[0_4px_10px_rgba(7,23,57,0.24)]">
        {label}
      </span>

      {showDivider && (
        <span
          className="pointer-events-none absolute top-2 right-0 bottom-2 w-px bg-gradient-to-b from-transparent via-royal-deep/25 to-transparent"
          aria-hidden
        />
      )}
    </div>
  );
});

export default function CountdownTimer({ active = true }: { active?: boolean }) {
  const time = useCountdown(EVENT_TIMESTAMP, active);
  const ready = time !== null;

  if (time?.done) {
    return (
      <div className="mx-auto w-full max-w-[380px] rounded-2xl border border-royal-deep/15 bg-white/80 px-6 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_-14px_rgba(7,23,57,0.16)]">
        <p className="font-serif text-2xl sm:text-3xl font-bold text-royal-navy">
          Chegou o grande dia!
        </p>
        <span className="mt-3 inline-block rounded-full bg-royal-navy px-5 py-1.5 font-sans text-[11px] font-bold tracking-[0.2em] text-white uppercase">
          TE ESPERO PARA CELEBRAR
        </span>
      </div>
    );
  }

  const days = time?.days ?? 0;
  const hours = time?.hours ?? 0;
  const minutes = time?.minutes ?? 0;
  const seconds = time?.seconds ?? 0;

  const units = [
    { label: "DIAS", value: days },
    { label: "HORAS", value: hours },
    { label: "MINUTOS", value: minutes },
    { label: "SEGUNDOS", value: seconds },
  ];

  return (
    <div className="w-full max-w-[440px] text-center">
      {/* Título no mesmo padrão do bloco de data do pôster */}
      <div className="mx-auto flex w-full max-w-[360px] items-center gap-3 sm:gap-4">
        <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
        <h2 className="font-serif text-[20px] sm:text-[26px] font-bold leading-none tracking-wide text-royal-navy">
          Contagem Regressiva
        </h2>
        <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
      </div>

      {/* Cápsula translúcida com borda 1px, brilho interno e divisórias sutis */}
      <div
        className="mx-auto mt-4 grid w-full grid-cols-4 rounded-2xl border border-royal-deep/15 bg-white/75 px-1.5 py-4 sm:px-3 sm:py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_-14px_rgba(7,23,57,0.16),0_4px_12px_-4px_rgba(10,36,99,0.08)]"
        role="timer"
        aria-live="off"
        aria-label={
          ready
            ? `Faltam ${days} dias, ${hours} horas, ${minutes} minutos e ${seconds} segundos`
            : "Carregando contagem regressiva"
        }
      >
        {units.map((u, idx) => (
          <CountdownUnit
            key={u.label}
            value={u.value}
            label={u.label}
            ready={ready}
            showDivider={idx < units.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
