"use client";

import type confettiType from "canvas-confetti";
import { memo, type CSSProperties } from "react";

const ROYAL_AND_SILVER_PALETTE = [
  "#1E40AF", // Royal Blue nobre
  "#1D4ED8", // Royal Blue vibrante
  "#2563EB", // Royal acetinado
  "#60A5FA", // Reflexo azul celeste
  "#FFFFFF", // Prata espelhado
  "#F8FAFC", // Pérola
  "#E2E8F0", // Prata claro
  "#CBD5E1", // Prata cromado
];

function createLuxuryShapes(confetti: typeof confettiType): confettiType.Shape[] {
  const fourPointStar =
    typeof confetti.shapeFromPath === "function"
      ? confetti.shapeFromPath({
          path: "M12 0 C13.8 7.5 16.5 10.2 24 12 C16.5 13.8 13.8 16.5 12 24 C10.2 16.5 7.5 13.8 0 12 C7.5 10.2 10.2 7.5 12 0 Z",
        })
      : "circle";

  const diamondCrystal =
    typeof confetti.shapeFromPath === "function"
      ? confetti.shapeFromPath({
          path: "M10 0 L20 12 L10 24 L0 12 Z",
        })
      : "circle";

  return [fourPointStar, diamondCrystal, "circle", "square"] as confettiType.Shape[];
}

/**
 * Dispara uma celebração luxuosa de estrelas de 4 pontas (✦), cristais lapidados
 * e poeira estelar prateada e azul royal.
 * Retorna uma função de cleanup que cancela imediatamente timers e intervalos ativos.
 */
export function fireLuxuryCelebration(preloaded?: typeof confettiType | null): () => void {
  let cancelled = false;
  let arcTimeoutId: number | undefined;
  let stardustIntervalId: number | undefined;

  const cleanup = () => {
    cancelled = true;
    if (arcTimeoutId !== undefined) window.clearTimeout(arcTimeoutId);
    if (stardustIntervalId !== undefined) window.clearInterval(stardustIntervalId);
  };

  const run = async () => {
    const confetti = preloaded ?? (await import("canvas-confetti")).default;
    if (cancelled) return;

    const shapes = createLuxuryShapes(confetti);

    const base: confettiType.Options = {
      colors: ROYAL_AND_SILVER_PALETTE,
      shapes,
      zIndex: 60,
      disableForReducedMotion: true,
    };

    // 1. Explosão central sincronizada com a abertura da aba
    confetti({
      ...base,
      particleCount: 64,
      spread: 135,
      angle: 90,
      startVelocity: 32,
      decay: 0.92,
      gravity: 0.52,
      scalar: 0.95,
      ticks: 260,
      origin: { x: 0.5, y: 0.44 },
    });

    confetti({
      ...base,
      colors: ["#FFFFFF", "#E2E8F0", "#94A3B8", "#1E40AF", "#1D4ED8"],
      particleCount: 38,
      spread: 360,
      startVelocity: 22,
      decay: 0.91,
      gravity: 0.4,
      scalar: 0.82,
      ticks: 220,
      origin: { x: 0.5, y: 0.48 },
    });

    // 2. Arcos laterais sincronizados
    arcTimeoutId = window.setTimeout(() => {
      if (cancelled) return;
      confetti({
        ...base,
        particleCount: 34,
        angle: 62,
        spread: 52,
        startVelocity: 42,
        decay: 0.92,
        gravity: 0.62,
        scalar: 0.95,
        ticks: 260,
        origin: { x: 0.1, y: 0.68 },
      });
      confetti({
        ...base,
        particleCount: 34,
        angle: 118,
        spread: 52,
        startVelocity: 42,
        decay: 0.92,
        gravity: 0.62,
        scalar: 0.95,
        ticks: 260,
        origin: { x: 0.9, y: 0.68 },
      });
    }, 240);

    // 3. Poeira estelar prateada e azul royal flutuando suavemente do topo
    const end = Date.now() + 2300;
    stardustIntervalId = window.setInterval(() => {
      if (cancelled || Date.now() > end) {
        if (stardustIntervalId !== undefined) window.clearInterval(stardustIntervalId);
        return;
      }
      confetti({
        ...base,
        particleCount: 3,
        startVelocity: 0,
        ticks: 320,
        gravity: 0.35,
        drift: (Math.random() - 0.5) * 0.8,
        scalar: 0.65 + Math.random() * 0.45,
        origin: { x: 0.12 + Math.random() * 0.76, y: -0.04 },
      });
    }, 150);
  };

  void run();
  return cleanup;
}

/**
 * Disparo rápido e refinado de micro-estrelas e cristais em Azul Royal & Prata
 * para celebrar ações nos modais (cópia de chave Pix ou confirmação de presença).
 */
export function fireMiniCelebration(origin: { x: number; y: number } = { x: 0.5, y: 0.6 }): void {
  void import("canvas-confetti").then(({ default: confetti }) => {
    const shapes = createLuxuryShapes(confetti);
    confetti({
      colors: ["#FFFFFF", "#E2E8F0", "#CBD5E1", "#60A5FA", "#1D4ED8", "#1E40AF"],
      shapes,
      particleCount: 28,
      spread: 76,
      startVelocity: 26,
      decay: 0.9,
      gravity: 0.58,
      scalar: 0.78,
      ticks: 165,
      origin,
      zIndex: 90,
      disableForReducedMotion: true,
    });
  });
}

/* ───────── Partículas Ambientais Cintilantes & Poeira Estelar GPU ───────── */

type StardustStyle = CSSProperties & {
  "--stardust-duration"?: string;
  "--stardust-x"?: string;
  "--stardust-y"?: string;
};

const SPARKLE_POINTS = [
  { top: "8%", left: "14%", size: 14, delay: "0s", tone: "royal" },
  { top: "14%", left: "84%", size: 12, delay: "0.8s", tone: "silver" },
  { top: "28%", left: "8%", size: 11, delay: "1.6s", tone: "silver" },
  { top: "34%", left: "91%", size: 15, delay: "0.4s", tone: "royal" },
  { top: "52%", left: "6%", size: 13, delay: "2.1s", tone: "royal" },
  { top: "58%", left: "92%", size: 11, delay: "1.2s", tone: "silver" },
  { top: "74%", left: "10%", size: 14, delay: "0.6s", tone: "silver" },
  { top: "82%", left: "88%", size: 13, delay: "1.9s", tone: "royal" },
  { top: "91%", left: "18%", size: 12, delay: "1.1s", tone: "royal" },
] as const;

const STARDUST_MOTES = [
  { top: "18%", left: "22%", size: 3, delay: "0s", duration: "9.5s", dx: "10px", dy: "-48px", tone: "silver" },
  { top: "24%", left: "76%", size: 2.5, delay: "1.8s", duration: "11s", dx: "-12px", dy: "-54px", tone: "royal" },
  { top: "39%", left: "16%", size: 3.5, delay: "3.1s", duration: "10.5s", dx: "14px", dy: "-44px", tone: "silver" },
  { top: "46%", left: "83%", size: 2.5, delay: "0.7s", duration: "8.8s", dx: "-8px", dy: "-52px", tone: "royal" },
  { top: "63%", left: "24%", size: 3, delay: "2.4s", duration: "12s", dx: "11px", dy: "-60px", tone: "royal" },
  { top: "68%", left: "79%", size: 3.5, delay: "4.2s", duration: "9.2s", dx: "-14px", dy: "-46px", tone: "silver" },
  { top: "79%", left: "32%", size: 2.5, delay: "1.1s", duration: "10.8s", dx: "9px", dy: "-50px", tone: "silver" },
  { top: "86%", left: "71%", size: 3, delay: "2.9s", duration: "11.4s", dx: "-10px", dy: "-58px", tone: "royal" },
  { top: "12%", left: "58%", size: 2.5, delay: "3.6s", duration: "10.2s", dx: "8px", dy: "-42px", tone: "silver" },
  { top: "93%", left: "48%", size: 3, delay: "0.4s", duration: "9.8s", dx: "-9px", dy: "-48px", tone: "royal" },
] as const;

export const AmbientSparkles = memo(function AmbientSparkles({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {STARDUST_MOTES.map((mote, i) => (
        <span
          key={`mote-${i}`}
          style={
            {
              top: mote.top,
              left: mote.left,
              width: mote.size,
              height: mote.size,
              animationDelay: mote.delay,
              "--stardust-duration": mote.duration,
              "--stardust-x": mote.dx,
              "--stardust-y": mote.dy,
              background:
                mote.tone === "silver"
                  ? "radial-gradient(circle, #FFFFFF 0%, rgba(226,232,240,0.4) 70%, transparent 100%)"
                  : "radial-gradient(circle, #93C5FD 0%, rgba(59,130,246,0.35) 70%, transparent 100%)",
              boxShadow:
                mote.tone === "silver"
                  ? "0 0 6px rgba(255, 255, 255, 0.55)"
                  : "0 0 6px rgba(147, 197, 253, 0.5)",
            } as StardustStyle
          }
          className="animate-stardust absolute rounded-full"
        />
      ))}

      {SPARKLE_POINTS.map((sp, i) => (
        <svg
          key={`sp-${i}`}
          viewBox="0 0 24 24"
          style={{
            top: sp.top,
            left: sp.left,
            width: sp.size,
            height: sp.size,
            animationDelay: sp.delay,
          }}
          className="absolute animate-twinkle"
        >
          <path
            d="M12 0 C13.4 8 16 10.6 24 12 C16 13.4 13.4 16 12 24 C10.6 16 8 13.4 0 12 C8 10.6 10.6 8 12 0 Z"
            fill={sp.tone === "royal" ? "#93C5FD" : "#E2E8F0"}
            fillOpacity={sp.tone === "royal" ? "0.6" : "0.75"}
          />
          <circle cx="12" cy="12" r="1.6" fill="#FFFFFF" />
        </svg>
      ))}
    </div>
  );
});
