"use client";

import type confettiType from "canvas-confetti";

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

/**
 * Dispara uma celebração luxuosa de estrelas de 4 pontas (✦), cristais lapidados
 * e poeira estelar prateada e azul royal (substituindo o confete quadrado comum).
 */
export async function fireLuxuryCelebration(preloaded?: typeof confettiType | null) {
  const confetti = preloaded ?? (await import("canvas-confetti")).default;

  // Formas vetoriais customizadas: Estrela de 4 pontas (✦) e Diamante Lapidado
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

  const shapes = [fourPointStar, diamondCrystal, "circle", "square"] as confettiType.Shape[];

  const base: confettiType.Options = {
    colors: ROYAL_AND_SILVER_PALETTE,
    shapes,
    zIndex: 60,
    disableForReducedMotion: true,
  };

  // 1. Explosão de confetes finos e partículas em prata metálica e azul royal no momento exato em que a aba abre
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

  // Halo radial prateado e azul royal
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

  // 2. Arcos laterais sincronizados com a abertura das portas
  window.setTimeout(() => {
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
  const interval = window.setInterval(() => {
    if (Date.now() > end) {
      window.clearInterval(interval);
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
}

/* ───────── Partículas Ambientais Cintilantes (Estrelas 4 Pontas em SVG) ───────── */

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

export function AmbientSparkles({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {SPARKLE_POINTS.map((sp, i) => (
        <svg
          key={i}
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
}

