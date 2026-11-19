"use client";

import { AnimatePresence, m, useInView } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import { EVENT_TIMESTAMP } from "@/config/event";
import { useSafeReducedMotion } from "@/hooks/useSafeReducedMotion";

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

function useCountdown(target: number, active: boolean, isInView: boolean): TimeLeft | null {
  // null no SSR e no primeiro render cliente -> zero Hydration Mismatch
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!active) return;
    let timeoutId: number | undefined;

    const clearTimer = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const tick = () => {
      const next = computeTimeLeft(target);
      setTime(next);
      // Pausa ticks contínuos quando concluído, aba oculta ou fora da viewport
      if (next.done || document.hidden || !isInView) {
        timeoutId = undefined;
        return;
      }
      timeoutId = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 12);
    };

    const handleVisibilityChange = () => {
      clearTimer();
      if (!document.hidden) {
        tick();
      }
    };

    tick();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [target, active, isInView]);

  return time;
}

const RollingDigit = memo(function RollingDigit({
  digit,
  reducedMotion,
}: {
  digit: string;
  reducedMotion: boolean;
}) {
  if (reducedMotion) {
    return (
      <span className="inline-flex h-[1.15em] w-[0.64em] items-center justify-center text-royal-navy">
        {digit}
      </span>
    );
  }

  return (
    <span
      className="relative inline-block h-[1.15em] w-[0.64em] overflow-hidden align-top"
      style={{ perspective: "420px" }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <m.span
          key={digit}
          initial={{ y: "-78%", rotateX: 38, scale: 0.9, opacity: 0 }}
          animate={{ y: "0%", rotateX: 0, scale: 1, opacity: 1 }}
          exit={{ y: "78%", rotateX: -38, scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center text-royal-navy"
        >
          {digit}
        </m.span>
      </AnimatePresence>
    </span>
  );
});

const CountdownUnit = memo(function CountdownUnit({
  value,
  label,
  ready,
  reducedMotion,
  showDivider,
}: {
  value: number;
  label: string;
  ready: boolean;
  reducedMotion: boolean;
  showDivider: boolean;
}) {
  const digits = String(value).padStart(2, "0").split("");
  const isThreeDigits = digits.length >= 3;

  return (
    <div className="relative flex min-w-0 flex-col items-center justify-center px-1 py-1 sm:px-2">
      <span
        className={`flex h-[34px] sm:h-[52px] items-center justify-center font-serif font-bold tabular-nums leading-none tracking-tight text-royal-navy transition-opacity duration-500 ${
          isThreeDigits
            ? "text-[clamp(24px,6.4vw,42px)] sm:text-[42px]"
            : "text-[clamp(28px,7.4vw,46px)] sm:text-[46px]"
        } ${ready ? "opacity-100" : "opacity-0"}`}
        aria-hidden
      >
        {ready ? (
          digits.map((d, i) => (
            <RollingDigit key={`${digits.length}-${i}`} digit={d} reducedMotion={reducedMotion} />
          ))
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

const CountdownHeading = memo(function CountdownHeading() {
  return (
    <div className="mx-auto flex w-full max-w-[360px] items-center gap-3 sm:gap-4">
      <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
      <h2 className="whitespace-nowrap font-serif text-[19px] sm:text-[26px] font-bold leading-none tracking-wide text-royal-navy">
        Contagem Regressiva
      </h2>
      <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
    </div>
  );
});

/** Subcomponente folha que isola o tick de 1 segundo do restante da árvore React. */
const CountdownClock = memo(function CountdownClock({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const clockRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(clockRef, { margin: "200px 0px 200px 0px" });
  const time = useCountdown(EVENT_TIMESTAMP, active, isInView);
  const ready = time !== null;

  if (time?.done) {
    return (
      <div ref={clockRef} className="w-full max-w-[440px] text-center">
        <div className="mx-auto w-full max-w-[380px] rounded-2xl border border-royal-deep/15 bg-white/80 px-6 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_16px_36px_-14px_rgba(7,23,57,0.16)]">
          <p className="font-serif text-2xl sm:text-3xl font-bold text-royal-navy">
            Chegou o grande dia!
          </p>
          <span className="mt-3 inline-block rounded-full bg-royal-navy px-5 py-1.5 font-sans text-[11px] font-bold tracking-[0.2em] text-white uppercase">
            TE ESPERO PARA CELEBRAR
          </span>
        </div>
      </div>
    );
  }

  const days = time?.days ?? 0;
  const hours = time?.hours ?? 0;
  const minutes = time?.minutes ?? 0;
  const seconds = time?.seconds ?? 0;

  return (
    <div ref={clockRef} className="w-full max-w-[440px] text-center">
      <CountdownHeading />

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
        <CountdownUnit
          value={days}
          label="DIAS"
          ready={ready}
          reducedMotion={reducedMotion}
          showDivider
        />
        <CountdownUnit
          value={hours}
          label="HORAS"
          ready={ready}
          reducedMotion={reducedMotion}
          showDivider
        />
        <CountdownUnit
          value={minutes}
          label="MINUTOS"
          ready={ready}
          reducedMotion={reducedMotion}
          showDivider
        />
        <CountdownUnit
          value={seconds}
          label="SEGUNDOS"
          ready={ready}
          reducedMotion={reducedMotion}
          showDivider={false}
        />
      </div>
    </div>
  );
});

const CountdownTimer = memo(function CountdownTimer({ active = true }: { active?: boolean }) {
  const reducedMotion = useSafeReducedMotion();
  return <CountdownClock active={active} reducedMotion={reducedMotion} />;
});

export default CountdownTimer;
