"use client";

import type confettiType from "canvas-confetti";

const ROYAL_AND_SILVER_PALETTE = [
  "#0A2463", // Royal Blue profundo
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
 * e poeira estelar prateada e azul royal (otimizada para 60fps no mobile).
 * Retorna uma função de cleanup que cancela imediatamente timers ativos.
 */
export function fireLuxuryCelebration(preloaded?: typeof confettiType | null): () => void {
  let cancelled = false;
  let arcTimeoutId: number | undefined;

  const cleanup = () => {
    cancelled = true;
    if (arcTimeoutId !== undefined) window.clearTimeout(arcTimeoutId);
  };

  const run = async () => {
    const confetti = preloaded ?? (await import("canvas-confetti")).default;
    if (cancelled) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const shapes = createLuxuryShapes(confetti);
    const ticks = isMobile ? 190 : 240;

    const base: confettiType.Options = {
      colors: ROYAL_AND_SILVER_PALETTE,
      shapes,
      zIndex: 60,
      disableForReducedMotion: true,
    };

    // 1. Explosão central sincronizada com a abertura das portas
    confetti({
      ...base,
      particleCount: isMobile ? 34 : 56,
      spread: 130,
      angle: 90,
      startVelocity: 32,
      decay: 0.92,
      gravity: 0.55,
      scalar: 0.95,
      ticks,
      origin: { x: 0.5, y: 0.44 },
    });

    confetti({
      ...base,
      colors: ["#FFFFFF", "#E2E8F0", "#94A3B8", "#0A2463", "#1D4ED8"],
      particleCount: isMobile ? 20 : 32,
      spread: 360,
      startVelocity: 22,
      decay: 0.91,
      gravity: 0.42,
      scalar: 0.82,
      ticks: isMobile ? 180 : 210,
      origin: { x: 0.5, y: 0.48 },
    });

    // 2. Arcos laterais sincronizados
    arcTimeoutId = window.setTimeout(() => {
      if (cancelled) return;
      confetti({
        ...base,
        particleCount: isMobile ? 20 : 30,
        angle: 62,
        spread: 50,
        startVelocity: 40,
        decay: 0.92,
        gravity: 0.62,
        scalar: 0.92,
        ticks,
        origin: { x: 0.1, y: 0.68 },
      });
      confetti({
        ...base,
        particleCount: isMobile ? 20 : 30,
        angle: 118,
        spread: 50,
        startVelocity: 40,
        decay: 0.92,
        gravity: 0.62,
        scalar: 0.92,
        ticks,
        origin: { x: 0.9, y: 0.68 },
      });
    }, 240);
  };

  void run();
  return cleanup;
}

/**
 * Disparo rápido e refinado de micro-estrelas e cristais em Azul Royal & Prata
 * para celebrar a confirmação de presença.
 */
export function fireMiniCelebration(origin: { x: number; y: number } = { x: 0.5, y: 0.6 }): void {
  void import("canvas-confetti").then(({ default: confetti }) => {
    const shapes = createLuxuryShapes(confetti);
    confetti({
      colors: ["#FFFFFF", "#E2E8F0", "#CBD5E1", "#60A5FA", "#1D4ED8", "#0A2463"],
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
