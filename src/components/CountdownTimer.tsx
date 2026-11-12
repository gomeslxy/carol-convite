"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useEffect, useState } from "react";
import { getEventTimestamp } from "@/config/event";

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

function useCountdown(target: number): TimeLeft | null {
  // null no SSR → evita divergência de hidratação
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    let timeout: number;
    const tick = () => {
      setTime(computeTimeLeft(target));
      timeout = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
    };
    tick();
    return () => window.clearTimeout(timeout);
  }, [target]);

  return time;
}

function RollingDigit({ digit }: { digit: string }) {
  return (
    <span className="relative inline-block h-[1.15em] w-[0.68em] overflow-hidden align-top">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: "-78%", opacity: 0, filter: "blur(2.5px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "78%", opacity: 0, filter: "blur(2.5px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_2px_10px_rgba(15,23,42,0.45)]"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function CountdownUnit({
  value,
  label,
  ready,
}: {
  value: number;
  label: string;
  ready: boolean;
}) {
  const digits = String(value).padStart(2, "0").split("");

  return (
    <div className="flex flex-col items-center justify-start">
      <span
        className={`flex items-center justify-center font-serif text-[clamp(32px,8.8vw,48px)] sm:text-[50px] leading-none font-normal tracking-tight text-white transition-opacity duration-500 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        {digits.map((d, i) => (
          <RollingDigit key={`${digits.length}-${i}`} digit={d} />
        ))}
      </span>

      <span className="mt-2.5 pl-[0.18em] font-serif text-[9.5px] sm:text-[11px] font-semibold tracking-[0.18em] text-silver-200/85 uppercase">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const time = useCountdown(getEventTimestamp());
  const ready = time !== null;
  const t = time ?? { days: 0, hours: 0, minutes: 0, seconds: 0, done: false };

  if (t.done) {
    return (
      <div className="py-4 text-center">
        <p className="text-silver-luxury px-4 font-script text-4xl sm:text-5xl">Chegou o grande dia!</p>
        <p className="mt-2 font-serif text-[11px] font-semibold tracking-[0.22em] text-silver-200 uppercase">
          TE ESPERO PARA CELEBRAR
        </p>
      </div>
    );
  }

  const units = [
    { label: "DIAS", value: t.days },
    { label: "HORAS", value: t.hours },
    { label: "MINUTOS", value: t.minutes },
    { label: "SEGUNDOS", value: t.seconds },
  ];

  return (
    <div className="w-full text-center">
      {/* Palavra em caligrafia script: "Faltam:" */}
      <h2 className="text-silver-luxury inline-block px-5 py-1 font-script text-[clamp(40px,10.5vw,52px)] leading-[1.3]">
        Faltam:
      </h2>

      {/* Display no padrão DIAS : HORAS : MINUTOS : SEGUNDOS em Prata & Branco Luminoso */}
      <div
        className="mt-3 flex items-start justify-center gap-1.5 sm:gap-3.5"
        role="timer"
        aria-live="off"
        aria-label={
          ready
            ? `Faltam ${t.days} dias, ${t.hours} horas, ${t.minutes} minutos e ${t.seconds} segundos`
            : "Carregando contagem regressiva"
        }
      >
        {units.map((u, idx) => (
          <Fragment key={u.label}>
            <CountdownUnit value={u.value} label={u.label} ready={ready} />
            {idx < units.length - 1 && (
              <span
                className="select-none pt-0.5 font-serif text-[clamp(26px,7vw,40px)] sm:text-[42px] leading-none font-normal text-silver-300/80 animate-pulse"
                aria-hidden
              >
                :
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
