"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useId, type PointerEvent as ReactPointerEvent } from "react";
import { CalligraphicMonogramC } from "@/components/Ornaments";

/* ───────── Contorno suave e realista de cera fundida em 3D (sem pontas deformadas) ───────── */

function buildSmoothWaxPath(cx: number, cy: number, r: number, points = 48): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    // Ondulação suave e natural de cera prensada (variação sutil de 1.8px)
    const rr =
      r +
      1.8 * Math.sin(a * 3 + 0.4) +
      1.2 * Math.cos(a * 5 + 1.1) +
      0.7 * Math.sin(a * 8 + 2.3);
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d} Z`;
}

const WAX_OUTER_PATH = buildSmoothWaxPath(100, 100, 86);
const WAX_CUSHION_PATH = buildSmoothWaxPath(100, 100, 76);

export interface WaxSealProps {
  initial?: string;
  opening: boolean;
  onOpen: () => void;
}

export default function WaxSeal({ opening, onOpen }: WaxSealProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name: string) => `seal-${uid}-${name}`;

  // Tilt 3D interativo (paralaxe suave ao mover mouse/toque)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smoothX = useSpring(mx, { stiffness: 240, damping: 22, mass: 0.6 });
  const smoothY = useSpring(my, { stiffness: 240, damping: 22, mass: 0.6 });

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const glossX = useTransform(smoothX, [-0.5, 0.5], [12, -12]);
  const glossY = useTransform(smoothY, [-0.5, 0.5], [12, -12]);

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (opening) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(nx);
    my.set(ny);
  };

  const handlePointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      className="relative grid size-[clamp(228px,60vw,280px)] sm:size-[276px] lg:size-[300px] place-items-center"
      style={{ perspective: "1000px" }}
    >
      {/* ───────── Ondas de Luz e Explosão de Brilho ao Abrir o Broche ───────── */}
      {opening && (
        <>
          <motion.span
            initial={{ scale: 0.55, opacity: 0.95 }}
            animate={{ scale: 2.35, opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute size-[58%] rounded-full border-2 border-white/90 bg-[radial-gradient(circle,rgba(255,255,255,0.85)_0%,rgba(59,130,246,0.45)_45%,transparent_75%)] shadow-[0_0_50px_rgba(37,99,235,0.65)]"
            aria-hidden
          />
          <motion.span
            initial={{ scale: 0.6, opacity: 0.85 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
            className="pointer-events-none absolute size-[58%] rounded-full border border-silver-200"
            aria-hidden
          />
        </>
      )}

      {/* ───────── Texto Curvado "CLIQUE PARA ABRIR" (Arco Esquerdo Fiel à Referência) ───────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={
          opening
            ? { opacity: 0, scale: 1.18, filter: "blur(4px)" }
            : { opacity: 1, scale: [1, 1.025, 1] }
        }
        transition={
          opening
            ? { duration: 0.38, ease: "easeIn" }
            : {
                opacity: { duration: 0.8, delay: 0.35 },
                scale: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
              }
        }
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <svg viewBox="0 0 300 300" className="size-full overflow-visible">
          <defs>
            {/* Arco circular perfeito abraçando o lado esquerdo do selo (centro 150,150, raio 95) */}
            <path
              id={id("arc-left")}
              d="M 118 239 A 95 95 0 0 1 118 61"
            />
          </defs>

          <text
            fill="#1E3A8A"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: "0.14em",
            }}
          >
            <textPath href={`#${id("arc-left")}`} startOffset="50%" textAnchor="middle">
              CLIQUE PARA ABRIR
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* ───────── Selo de Cera 3D Central com Monograma Caligráfico "C" ───────── */}
      <motion.button
        type="button"
        onClick={onOpen}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        disabled={opening}
        initial={{ scale: 0.76, opacity: 0, rotate: -10 }}
        animate={
          opening
            ? {
                scale: [1, 0.92, 1.18, 0.78],
                rotate: [0, -4, 8, 16],
                y: [0, 3, -14, -22],
                opacity: [1, 1, 0.92, 0],
                filter: [
                  "brightness(1) blur(0px)",
                  "brightness(1.15) blur(0px)",
                  "brightness(1.38) blur(1px)",
                  "brightness(1.5) blur(6px)",
                ],
              }
            : {
                scale: 1,
                opacity: 1,
                rotate: 0,
                y: 0,
                filter: "brightness(1) blur(0px)",
              }
        }
        transition={
          opening
            ? {
                duration: 0.68,
                times: [0, 0.2, 0.62, 1],
                ease: [0.22, 1, 0.36, 1],
              }
            : { type: "spring", stiffness: 160, damping: 16, delay: 0.2 }
        }
        whileHover={opening ? undefined : { scale: 1.055 }}
        whileTap={opening ? undefined : { scale: 0.95 }}
        style={{
          rotateX: opening ? 0 : rotateX,
          rotateY: opening ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        aria-label="Clique para abrir o convite"
        className="group relative size-[58%] cursor-pointer rounded-full outline-none focus-visible:ring-4 focus-visible:ring-royal-700/35"
      >
        {/* Halo pulsante 3D em Azul Royal */}
        <span className="absolute inset-[6%] rounded-full bg-royal-700/22 blur-md animate-seal-ripple" aria-hidden />
        <span
          className="absolute inset-[6%] rounded-full bg-royal-800/16 animate-seal-ripple [animation-delay:1.6s]"
          aria-hidden
        />

        <span className="relative block size-full animate-seal-pulse">
          <svg
            viewBox="0 0 200 200"
            className="size-full overflow-visible drop-shadow-[0_18px_28px_rgba(15,23,42,0.34)]"
            aria-hidden
          >
            <defs>
              {/* Corpo principal da cera em Azul Royal acetinado profundo */}
              <radialGradient id={id("wax-body")} cx="32%" cy="26%" r="78%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="22%" stopColor="#2563EB" />
                <stop offset="52%" stopColor="#1D4ED8" />
                <stop offset="78%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#0F172A" />
              </radialGradient>

              {/* Volume almofadado do anel externo da cera (3D Cushion) */}
              <linearGradient id={id("wax-cushion")} x1="15%" y1="10%" x2="85%" y2="90%">
                <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#3B82F6" stopOpacity="0.35" />
                <stop offset="70%" stopColor="#1E3A8A" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
              </linearGradient>

              {/* Moeda interna prensada */}
              <radialGradient id={id("press")} cx="62%" cy="66%" r="74%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="45%" stopColor="#1D4ED8" />
                <stop offset="82%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#172554" />
              </radialGradient>

              {/* Sombra de cavidade interna do carimbo */}
              <linearGradient id={id("rim-shadow")} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0F172A" stopOpacity="0.85" />
                <stop offset="48%" stopColor="#1E3A8A" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.85" />
              </linearGradient>

              {/* Prata polida espelhada para o monograma e anéis */}
              <linearGradient id={id("silver")} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#F8FAFC" />
                <stop offset="48%" stopColor="#CBD5E1" />
                <stop offset="72%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>

              {/* Brilho especular superior */}
              <radialGradient id={id("gloss")} cx="32%" cy="22%" r="46%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.62" />
                <stop offset="45%" stopColor="#DBEAFE" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>

              <filter id={id("engrave")} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="-0.8" dy="-0.8" stdDeviation="0.45" floodColor="#0F172A" floodOpacity="0.85" />
                <feDropShadow dx="0.8" dy="1" stdDeviation="0.55" floodColor="#FFFFFF" floodOpacity="0.45" />
              </filter>

              <clipPath id={id("clip")}>
                <path d={WAX_OUTER_PATH} />
              </clipPath>
            </defs>

            {/* 1. Corpo externo da cera em Azul Royal */}
            <path d={WAX_OUTER_PATH} fill={`url(#${id("wax-body")})`} />

            {/* 2. Anel de volume 3D da borda de cera derretida */}
            <path
              d={WAX_CUSHION_PATH}
              fill="none"
              stroke={`url(#${id("wax-cushion")})`}
              strokeWidth="7.5"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* 3. Reflexo especular dinâmico com paralaxe */}
            <g clipPath={`url(#${id("clip")})`}>
              <motion.ellipse
                cx="64"
                cy="44"
                rx="56"
                ry="32"
                fill={`url(#${id("gloss")})`}
                transform="rotate(-26 64 44)"
                style={{ x: glossX, y: glossY }}
              />
            </g>

            {/* Filete luminoso externo */}
            <path d={WAX_OUTER_PATH} fill="none" stroke="#DBEAFE" strokeOpacity="0.5" strokeWidth="1.1" />

            {/* 4. Cavidade central prensada pelo sinete */}
            <circle cx="100" cy="100" r="64" fill={`url(#${id("press")})`} />
            <circle cx="100" cy="100" r="64" fill="none" stroke={`url(#${id("rim-shadow")})`} strokeWidth="3.6" />

            {/* 5. Duplo anel circular em Prata Polida (idêntico à moeda interna do selo da referência) */}
            <circle
              cx="100"
              cy="100"
              r="58"
              fill="none"
              stroke={`url(#${id("silver")})`}
              strokeWidth="1.4"
              strokeOpacity="0.92"
            />
            <circle
              cx="100"
              cy="100"
              r="54"
              fill="none"
              stroke={`url(#${id("silver")})`}
              strokeWidth="0.85"
              strokeOpacity="0.7"
            />

            {/* 6. Monograma Caligráfico "C" esculpido em Prata Polida no centro do selo */}
            <g filter={`url(#${id("engrave")})`} transform="translate(100 101) scale(0.76) translate(-96 -96)">
              <CalligraphicMonogramC
                strokeUrl={`url(#${id("silver")})`}
                fillUrl={`url(#${id("silver")})`}
                accentUrl={`url(#${id("silver")})`}
              />
            </g>
          </svg>
        </span>
      </motion.button>
    </div>
  );
}
