"use client";

import type confettiType from "canvas-confetti";

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
 * Disparo rápido e refinado de micro-estrelas e cristais em Azul Royal & Prata
 * para celebrar a confirmação de presença no formulário RSVP.
 */
export function fireMiniCelebration(origin: { x: number; y: number } = { x: 0.5, y: 0.6 }): void {
  void import("canvas-confetti").then(({ default: confetti }) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const shapes = createLuxuryShapes(confetti);
    confetti({
      colors: ["#FFFFFF", "#E2E8F0", "#CBD5E1", "#60A5FA", "#1D4ED8", "#0A2463"],
      shapes,
      particleCount: isMobile ? 18 : 28,
      spread: 76,
      startVelocity: 26,
      decay: 0.9,
      gravity: 0.58,
      scalar: 0.78,
      ticks: isMobile ? 140 : 165,
      origin,
      zIndex: 90,
      disableForReducedMotion: true,
    });
  });
}
