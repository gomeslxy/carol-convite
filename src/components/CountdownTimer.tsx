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
      className="relative inline-block h-[1.18em] w-[0.64em] overflow-hidden align-top"
      style={{ perspective: "420px" }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: "-78%", rotateX: 38, scale: 0.9, opacity: 0 }}
          animate={{ y: "0%", rotateX: 0, scale: 1, opacity: 1 }}
          exit={{ y: "78%", rotateX: -38, scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center text-white will-change-transform [text-shadow:0_2px_10px_rgba(15,23,42,0.5)]"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
});

const CrystalSeparator = memo(function CrystalSeparator() {
  return (
    <span
      className="pointer-events-none absolute top-[42%] -right-[6px] sm:-right-[10px] z-20 flex -translate-y-1/2 flex-col items-center gap-1.5 animate-pulse"
      aria-hidden
    >
      <span className="size-1 sm:size-1.5 rotate-45 rounded-[1px] bg-silver-200/85 shadow-[0_0_6px_rgba(255,255,255,0.65)]" />
      <span className="size-1 sm:size-1.5 rotate-45 rounded-[1px] bg-silver-200/85 shadow-[0_0_6px_rgba(255,255,255,0.65)]" />
    </span>
  );
});

const CountdownUnit = memo(function CountdownUnit({
  value,
  label,
  ready,
  showSeparator,
}: {
  value: number;
  label: string;
  ready: boolean;
  showSeparator: boolean;
}) {
  const digits = String(value).padStart(2, "0").split("");
  const isThreeDigits = digits.length >= 3;

  return (
    <div className="relative min-w-0">
      <div className="glass-royal-card interactive-sheen relative flex flex-col items-center justify-between overflow-hidden rounded-2xl px-1.5 pt-2.5 pb-2.5 sm:rounded-[20px] sm:px-2.5 sm:pt-3.5 sm:pb-3">
        {/* Filete especular superior da cápsula */}
        <span
          className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/75 to-transparent"
          aria-hidden
        />

        {/* Micro-estrela prateada no topo */}
        <span
          className="relative z-10 mb-1 text-[7px] sm:text-[8px] leading-none text-silver-200/70"
          aria-hidden
        >
          ✦
        </span>

        {/* Dígitos com rolagem 3D em GPU */}
        <span
          className={`relative z-10 flex items-center justify-center font-serif tabular-nums leading-none font-normal tracking-tight text-white transition-opacity duration-500 ${
            isThreeDigits
              ? "text-[clamp(21px,5.8vw,38px)] sm:text-[38px]"
              : "text-[clamp(24px,6.8vw,42px)] sm:text-[42px]"
          } ${ready ? "opacity-100" : "opacity-0"}`}
          aria-hidden
        >
          {ready ? (
            digits.map((d, i) => (
              <RollingDigit key={`${digits.length}-${i}`} digit={d} />
            ))
          ) : (
            <span className="inline-block h-[1.18em] w-[1.28em]" />
          )}
        </span>

        {/* Divisória sutil + rótulo */}
        <span className="hairline-silver relative z-10 mt-2 mb-1.5 h-px w-4/5 opacity-45" aria-hidden />

        <span className="relative z-10 pl-[0.12em] font-serif text-[7.5px] sm:text-[9.5px] font-semibold tracking-[0.12em] sm:tracking-[0.18em] text-silver-200/90 uppercase">
          {label}
        </span>
      </div>

      {showSeparator && <CrystalSeparator />}
    </div>
  );
});

export default function CountdownTimer({ active = true }: { active?: boolean }) {
  const time = useCountdown(EVENT_TIMESTAMP, active);
  const ready = time !== null;

  if (time?.done) {
    return (
      <div className="glass-royal-card mx-auto max-w-[360px] rounded-3xl px-6 py-5 text-center">
        <p className="text-silver-luxury px-4 font-script text-4xl sm:text-5xl">
          Chegou o grande dia!
        </p>
        <p className="mt-2 font-serif text-[11px] font-semibold tracking-[0.22em] text-silver-200 uppercase">
          TE ESPERO PARA CELEBRAR
        </p>
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
    <div className="w-full text-center">
      <h2 className="text-silver-luxury inline-block px-5 py-1 font-script text-[clamp(40px,10.5vw,52px)] leading-[1.3]">
        Faltam:
      </h2>

      <div
        className="mx-auto mt-3.5 grid w-full max-w-[432px] grid-cols-4 gap-2 sm:gap-3.5"
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
            showSeparator={idx < units.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
