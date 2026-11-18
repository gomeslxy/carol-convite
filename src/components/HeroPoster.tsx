"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CalendarDays, Clock } from "lucide-react";
import Image from "next/image";
import { memo, useId, useRef, useState, type CSSProperties } from "react";
import { Bow } from "@/components/BowDecoration";
import { EVENT, FORMATTED_EVENT_DATE } from "@/config/event";
import carolCutoutImage from "../../public/images/carol-cutout.png";
import partyHatImage from "../../public/images/party-hat.png";

export type FloatStyle = CSSProperties & {
  "--float-duration"?: string;
  "--ty"?: string;
  "--r-start"?: string;
  "--r-mid"?: string;
  "--s-start"?: string;
  "--s-mid"?: string;
};

interface DiscoTile {
  id: string;
  points: string;
  fill: string;
  sparkle?: boolean;
  cx: number;
  cy: number;
}

/**
 * Gera os ladrilhos espelhados em projeção esférica 3D determinística
 * (mesmo output no SSR e no cliente, sem hidratação divergente).
 */
function buildDiscoTiles(rows: number): DiscoTile[] {
  const tiles: DiscoTile[] = [];
  const R = 95;
  const C = 100;

  for (let r = 0; r < rows; r++) {
    const lat1 = -Math.PI / 2 + (r / rows) * Math.PI;
    const lat2 = -Math.PI / 2 + ((r + 1) / rows) * Math.PI;
    const latMid = (lat1 + lat2) / 2;
    const cols = Math.max(4, Math.round(rows * 1.9 * Math.cos(latMid)));

    for (let c = 0; c < cols; c++) {
      const lon1 = -Math.PI / 2 + (c / cols) * Math.PI;
      const lon2 = -Math.PI / 2 + ((c + 1) / cols) * Math.PI;
      const lonMid = (lon1 + lon2) / 2;

      const project = (lat: number, lon: number) => {
        const x = C + R * Math.cos(lat) * Math.sin(lon);
        const y = C - R * Math.sin(lat);
        return [Number(x.toFixed(1)), Number(y.toFixed(1))];
      };

      const p1 = project(lat1, lon1);
      const p2 = project(lat1, lon2);
      const p3 = project(lat2, lon2);
      const p4 = project(lat2, lon1);

      // Normal da faceta para sombreamento especular
      const nx = Math.cos(latMid) * Math.sin(lonMid);
      const ny = -Math.sin(latMid);
      const nz = Math.cos(latMid) * Math.cos(lonMid);

      // Luz principal superior esquerda + jitter determinístico de espelho
      const light = nx * -0.45 + ny * -0.52 + nz * 0.72;
      const facetHash = Math.abs(Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1;
      const intensity = Math.max(0, Math.min(1, light * 0.65 + facetHash * 0.55));

      let fill = "#1E293B";
      if (intensity > 0.88) fill = "#FFFFFF";
      else if (intensity > 0.74) fill = "#E2E8F0";
      else if (intensity > 0.58) fill = "#CBD5E1";
      else if (intensity > 0.42) fill = "#94A3B8";
      else if (intensity > 0.28) fill = "#475569";
      else if (intensity > 0.14) fill = "#334155";

      const cx = Number(((p1[0] + p2[0] + p3[0] + p4[0]) / 4).toFixed(1));
      const cy = Number(((p1[1] + p2[1] + p3[1] + p4[1]) / 4).toFixed(1));

      tiles.push({
        id: `${r}-${c}`,
        points: `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]}`,
        fill,
        sparkle: intensity > 0.92 && (r + c) % 3 === 0,
        cx,
        cy,
      });
    }
  }

  return tiles;
}

const BIG_DISCO_TILES = buildDiscoTiles(10);
const MINI_DISCO_TILES = buildDiscoTiles(8);

/** Globo Espelhado Vetorial 3D com reflexos dinâmicos. */
const MirrorDiscoBall = memo(function MirrorDiscoBall({
  className = "",
  mini = false,
  topStar = false,
}: {
  className?: string;
  mini?: boolean;
  topStar?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clipId = `disco-clip-${uid}`;
  const shadeId = `disco-shade-${uid}`;
  const tiles = mini ? MINI_DISCO_TILES : BIG_DISCO_TILES;

  return (
    <div className={`relative select-none ${className}`} aria-hidden>
      {topStar && (
        <svg
          width={40}
          height={40}
          viewBox="0 0 40 40"
          className="pointer-events-none absolute -top-[21%] left-1/2 z-20 h-auto w-[34%] aspect-square -translate-x-1/2"
        >
          <polygon
            points="20,2 25.2,13.4 37.6,14.8 28.4,23.2 30.8,35.6 20,29.4 9.2,35.6 11.6,23.2 2.4,14.8 14.8,13.4"
            fill="#071739"
            stroke="#0A2463"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      )}

      <svg width={200} height={200} viewBox="0 0 200 200" className="w-full h-auto aspect-square">
        <defs>
          <clipPath id={clipId}>
            <circle cx="100" cy="100" r="95" />
          </clipPath>
          <radialGradient id={shadeId} cx="34%" cy="30%" r="72%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.30" />
            <stop offset="55%" stopColor="#94A3B8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#071739" stopOpacity="0.48" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="96" fill="#0F172A" />

        <g clipPath={`url(#${clipId})`}>
          {tiles.map((t) => (
            <polygon
              key={t.id}
              points={t.points}
              fill={t.fill}
              stroke="#0F172A"
              strokeWidth={mini ? "1.8" : "1.3"}
              strokeLinejoin="round"
            />
          ))}
          <circle cx="100" cy="100" r="95" fill={`url(#${shadeId})`} />
        </g>
        <circle
          cx="100"
          cy="100"
          r="95.2"
          fill="none"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="1"
        />

        {/* Brilhos especulares sutis apenas nos globos principais */}
        {!mini &&
          tiles
            .filter((t) => t.sparkle)
            .slice(0, 3)
            .map((t, idx) => (
              <g
                key={`glint-${t.id}`}
                style={{
                  transformOrigin: `${t.cx}px ${t.cy}px`,
                  animationDelay: `${idx * 0.8}s`,
                }}
                className="animate-disco-glint"
              >
                <path
                  d={`M ${t.cx} ${t.cy - 9} L ${t.cx + 2} ${t.cy - 2} L ${t.cx + 9} ${t.cy} L ${t.cx + 2} ${t.cy + 2} L ${t.cx} ${t.cy + 9} L ${t.cx - 2} ${t.cy + 2} L ${t.cx - 9} ${t.cy} L ${t.cx - 2} ${t.cy - 2} Z`}
                  fill="#FFFFFF"
                  opacity="0.92"
                />
              </g>
            ))}
      </svg>
    </div>
  );
});

const GLITTER_SPECKS = [
  { x: 50, y: 20, r: 1.5, c: "#93C5FD" },
  { x: 46, y: 31, r: 1.8, c: "#FFFFFF" },
  { x: 55, y: 35, r: 1.3, c: "#60A5FA" },
  { x: 38, y: 42, r: 1.6, c: "#E2E8F0" },
  { x: 63, y: 44, r: 1.5, c: "#93C5FD" },
  { x: 24, y: 41, r: 1.4, c: "#FFFFFF" },
  { x: 76, y: 42, r: 1.4, c: "#60A5FA" },
  { x: 50, y: 50, r: 2.0, c: "#FFFFFF" },
  { x: 43, y: 56, r: 1.4, c: "#93C5FD" },
  { x: 58, y: 57, r: 1.6, c: "#E2E8F0" },
  { x: 35, y: 65, r: 1.5, c: "#60A5FA" },
  { x: 65, y: 66, r: 1.4, c: "#FFFFFF" },
  { x: 29, y: 78, r: 1.4, c: "#93C5FD" },
  { x: 71, y: 78, r: 1.5, c: "#FFFFFF" },
  { x: 51, y: 67, r: 1.3, c: "#93C5FD" },
  { x: 49, y: 41, r: 1.2, c: "#3B82F6" },
] as const;

/** Estrela de 5 pontas com glitter em Azul Royal / Marinho (otimizada 60fps sem drop-shadow). */
export const GlitterBlueStar = memo(function GlitterBlueStar({
  className = "",
  style,
  animClass = "animate-sticker-float",
}: {
  className?: string;
  style?: FloatStyle;
  animClass?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `gstar-${uid}`;
  const clipId = `gstar-clip-${uid}`;

  return (
    <svg
      width={100}
      height={100}
      viewBox="0 0 100 100"
      style={style}
      className={`${animClass} pointer-events-none h-auto aspect-square select-none ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="12%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="48%" stopColor="#0A2463" />
          <stop offset="100%" stopColor="#071739" />
        </linearGradient>
        <clipPath id={clipId}>
          <polygon points="50,4 62.5,33.5 94.5,36.2 70,57.4 77.6,88.8 50,72 22.4,88.8 30,57.4 5.5,36.2 37.5,33.5" />
        </clipPath>
      </defs>

      <polygon
        points="50,4 62.5,33.5 94.5,36.2 70,57.4 77.6,88.8 50,72 22.4,88.8 30,57.4 5.5,36.2 37.5,33.5"
        fill={`url(#${gradId})`}
        stroke="#0A2463"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      <g clipPath={`url(#${clipId})`}>
        {GLITTER_SPECKS.map((s, idx) => (
          <circle key={idx} cx={s.x} cy={s.y} r={s.r} fill={s.c} opacity="0.9" />
        ))}
      </g>
    </svg>
  );
});

/** Estrela 3D facetada em Prata Metálico Espelhado (10 facetas chanfradas). */
export const MetallicSilverStar = memo(function MetallicSilverStar({
  className = "",
  style,
  animClass = "animate-sticker-float-alt",
}: {
  className?: string;
  style?: FloatStyle;
  animClass?: string;
}) {
  const facets: [string, string][] = [
    ["50,50 50,4 37.5,33.5", "#FFFFFF"],
    ["50,50 50,4 62.5,33.5", "#CBD5E1"],
    ["50,50 62.5,33.5 94.5,36.2", "#F8FAFC"],
    ["50,50 94.5,36.2 70,57.4", "#64748B"],
    ["50,50 70,57.4 77.6,88.8", "#E2E8F0"],
    ["50,50 77.6,88.8 50,72", "#475569"],
    ["50,50 50,72 22.4,88.8", "#94A3B8"],
    ["50,50 22.4,88.8 30,57.4", "#475569"],
    ["50,50 30,57.4 5.5,36.2", "#CBD5E1"],
    ["50,50 5.5,36.2 37.5,33.5", "#94A3B8"],
  ];

  return (
    <svg
      width={100}
      height={100}
      viewBox="0 0 100 100"
      style={style}
      className={`${animClass} pointer-events-none h-auto aspect-square select-none ${className}`}
      aria-hidden
    >
      {facets.map(([pts, fill], idx) => (
        <polygon key={idx} points={pts} fill={fill} stroke="#64748B" strokeWidth="0.4" strokeLinejoin="round" />
      ))}
      <polygon
        points="50,4 62.5,33.5 94.5,36.2 70,57.4 77.6,88.8 50,72 22.4,88.8 30,57.4 5.5,36.2 37.5,33.5"
        fill="none"
        stroke="#475569"
        strokeOpacity="0.55"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M50 18 L51.5 23 L56.5 24.5 L51.5 26 L50 31 L48.5 26 L43.5 24.5 L48.5 23 Z"
        fill="#FFFFFF"
        opacity="0.92"
      />
    </svg>
  );
});

interface LetterTile {
  char: string;
  bg: string;
  text: string;
  rotate: number;
  yOffset: number;
  serif?: boolean;
  tall?: boolean;
}

const HAPPY_TILES: LetterTile[] = [
  { char: "H", bg: "linear-gradient(155deg,#0A2463 0%,#071739 100%)", text: "#F1F5F9", rotate: -5, yOffset: 3 },
  { char: "A", bg: "linear-gradient(155deg,#2157A8 0%,#123775 100%)", text: "#DCE8F7", rotate: -1.5, yOffset: -2 },
  { char: "P", bg: "linear-gradient(155deg,#0D2553 0%,#071739 100%)", text: "#FFFFFF", rotate: 1.5, yOffset: 1 },
  { char: "P", bg: "linear-gradient(155deg,#A4CAEF 0%,#74A6DC 100%)", text: "#FFFFFF", rotate: -2, yOffset: -3 },
  { char: "Y", bg: "linear-gradient(155deg,#11326D 0%,#071739 100%)", text: "#F8FAFC", rotate: 3, yOffset: 2 },
];

const BIRTHDAY_TILES: LetterTile[] = [
  { char: "B", bg: "linear-gradient(155deg,#F0F6FC 0%,#C9DDF4 100%)", text: "#071739", rotate: -4, yOffset: -1, serif: true, tall: true },
  { char: "i", bg: "linear-gradient(155deg,#194C96 0%,#0A2463 100%)", text: "#FFFFFF", rotate: 2, yOffset: 4, serif: true },
  { char: "R", bg: "linear-gradient(155deg,#C4DCF5 0%,#8FB7E3 100%)", text: "#071739", rotate: -2, yOffset: -1, serif: true },
  { char: "t", bg: "linear-gradient(155deg,#1F55A5 0%,#0A2463 100%)", text: "#FFFFFF", rotate: 1.5, yOffset: 2, serif: true },
  { char: "h", bg: "linear-gradient(155deg,#113878 0%,#071739 100%)", text: "#DCE8F7", rotate: -2, yOffset: -2 },
  { char: "d", bg: "linear-gradient(155deg,#EDF4FB 0%,#CADFF4 100%)", text: "#071739", rotate: 2, yOffset: 1, serif: true },
  { char: "A", bg: "linear-gradient(155deg,#83B1E4 0%,#5384C4 100%)", text: "#071739", rotate: -1.5, yOffset: -2 },
  { char: "y", bg: "linear-gradient(155deg,#245CB0 0%,#0A2463 100%)", text: "#F8FAFC", rotate: 3.5, yOffset: 3 },
];

function LetterBlock({
  tile,
  index,
  revealed,
  sizeClass,
  textClass,
}: {
  tile: LetterTile;
  index: number;
  revealed: boolean;
  sizeClass: string;
  textClass: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.56, y: tile.yOffset + 30, rotate: tile.rotate * 2.1 }}
      animate={
        revealed
          ? { opacity: 1, scale: tile.tall ? 1.06 : 1, y: tile.yOffset, rotate: tile.rotate }
          : { opacity: 0, scale: 0.56, y: tile.yOffset + 30, rotate: tile.rotate * 2.1 }
      }
      whileHover={{ scale: 1.09, rotate: 0, y: tile.yOffset - 4 }}
      whileTap={{ scale: 0.94 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 14,
        delay: revealed ? 0.3 + index * 0.11 : 0,
      }}
      className={`relative cursor-default rounded-[5px] sm:rounded-[7px] bg-[linear-gradient(135deg,#FFFFFF_0%,#CBD5E1_36%,#1E40AF_72%,#F8FAFC_100%)] p-[2px] shadow-[0_6px_14px_rgba(7,23,57,0.28)] ${sizeClass}`}
    >
      <div
        style={{ backgroundImage: tile.bg, color: tile.text }}
        className={`flex size-full items-center justify-center rounded-[3.5px] sm:rounded-[5px] border border-royal-navy/55 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)] leading-none ${tile.serif ? "font-serif font-bold" : "font-sans font-extrabold"
          } ${textClass}`}
      >
        {tile.char}
      </div>
    </motion.div>
  );
}

/** Cluster de 5 balões brilhantes em Azul Royal/Marinho (renderização leve 60fps). */
function RoyalGlossyBalloons({ className = "" }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradA = `bal-a-${uid}`;
  const gradB = `bal-b-${uid}`;

  const balloons = [
    { cx: 58, cy: 66, rx: 52, ry: 56, grad: gradA, rot: -10 },
    { cx: 120, cy: 102, rx: 48, ry: 52, grad: gradB, rot: 8 },
    { cx: 74, cy: 132, rx: 54, ry: 58, grad: gradA, rot: -4 },
    { cx: 164, cy: 152, rx: 52, ry: 55, grad: gradA, rot: 12 },
    { cx: 112, cy: 176, rx: 46, ry: 48, grad: gradB, rot: 0 },
  ] as const;

  return (
    <svg
      width={230}
      height={230}
      viewBox="0 0 230 230"
      className={`pointer-events-none w-full h-auto aspect-square select-none ${className}`}
      aria-hidden
    >
      <defs>
        <radialGradient id={gradA} cx="32%" cy="28%" r="74%">
          <stop offset="0%" stopColor="#2E5CA8" />
          <stop offset="38%" stopColor="#163A7A" />
          <stop offset="76%" stopColor="#0A2463" />
          <stop offset="100%" stopColor="#071739" />
        </radialGradient>
        <radialGradient id={gradB} cx="35%" cy="26%" r="74%">
          <stop offset="0%" stopColor="#26529A" />
          <stop offset="44%" stopColor="#12316A" />
          <stop offset="82%" stopColor="#0A2463" />
          <stop offset="100%" stopColor="#050F24" />
        </radialGradient>
      </defs>

      {balloons.map((b, idx) => (
        <g key={idx} transform={`rotate(${b.rot} ${b.cx} ${b.cy})`}>
            {/* Nó sutil na base do balão */}
            <polygon
              points={`${b.cx - 4},${b.cy + b.ry + 4} ${b.cx + 4},${b.cy + b.ry + 4} ${b.cx},${b.cy + b.ry - 2}`}
              fill="#071739"
            />
            <ellipse
              cx={b.cx}
              cy={b.cy}
              rx={b.rx}
              ry={b.ry}
              fill={`url(#${b.grad})`}
              stroke="#3B82F6"
              strokeOpacity="0.22"
              strokeWidth="1.2"
            />

            {/* Reflexo curvo em grade luminosa (janela) característico do látex brilhante */}
            <g fill="#FFFFFF" opacity="0.86">
              <path
                d={`M ${b.cx - b.rx * 0.56} ${b.cy - b.ry * 0.14} Q ${b.cx - b.rx * 0.52} ${b.cy - b.ry * 0.48} ${b.cx - b.rx * 0.18} ${b.cy - b.ry * 0.54} L ${b.cx - b.rx * 0.14} ${b.cy - b.ry * 0.42} Q ${b.cx - b.rx * 0.42} ${b.cy - b.ry * 0.38} ${b.cx - b.rx * 0.44} ${b.cy - b.ry * 0.12} Z`}
                opacity="0.72"
              />
              <rect
                x={b.cx + b.rx * 0.18}
                y={b.cy - b.ry * 0.32}
                width="5"
                height="6"
                rx="1.2"
                transform={`rotate(12 ${b.cx + b.rx * 0.18} ${b.cy - b.ry * 0.32})`}
                opacity="0.78"
              />
              <rect
                x={b.cx + b.rx * 0.31}
                y={b.cy - b.ry * 0.27}
                width="5"
                height="6"
                rx="1.2"
                transform={`rotate(14 ${b.cx + b.rx * 0.31} ${b.cy - b.ry * 0.27})`}
                opacity="0.65"
              />
              <rect
                x={b.cx + b.rx * 0.21}
                y={b.cy - b.ry * 0.18}
                width="5"
                height="6"
                rx="1.2"
                transform={`rotate(12 ${b.cx + b.rx * 0.21} ${b.cy - b.ry * 0.18})`}
                opacity="0.72"
              />
              <rect
                x={b.cx + b.rx * 0.34}
                y={b.cy - b.ry * 0.12}
                width="5"
                height="6"
                rx="1.2"
                transform={`rotate(14 ${b.cx + b.rx * 0.34} ${b.cy - b.ry * 0.12})`}
                opacity="0.58"
              />
            </g>

            {/* Contra-luz suave prateada na borda inferior */}
            <path
              d={`M ${b.cx - b.rx * 0.35} ${b.cy + b.ry * 0.78} Q ${b.cx} ${b.cy + b.ry * 0.9} ${b.cx + b.rx * 0.42} ${b.cy + b.ry * 0.72}`}
              fill="none"
              stroke="#93C5FD"
              strokeOpacity="0.28"
              strokeWidth="2"
              strokeLinecap="round"
            />
        </g>
      ))}
    </svg>
  );
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SEÇÃO HERO: PÔSTER INTERATIVO
 *  - Parallax multi-camada atrelado ao scroll (globos espelhados + estrelas laterais).
 *  - Letreiro "HAPPY BiRthdAy" em placas retangulares metálicas com stagger.
 *  - Estrelas cintilantes em glitter azul royal e prata 3D chanfrada.
 *  - Bloco editorial da data (Julho · SÁB | 17 | 19:30 · 2027).
 *  - Foto P&B da Carol bebê com proporção explícita (zero CLS), chapéu, laço e balões.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function HeroPoster({ revealed }: { revealed: boolean }) {
  const posterRef = useRef<HTMLElement>(null);
  const [portraitError, setPortraitError] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: posterRef,
    offset: ["start start", "end start"],
  });

  const topBallParallax = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -26]);
  const bottomBallParallax = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 22]);
  const starsUpParallax = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -18]);
  const starsDownParallax = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 14]);

  const monthTitle =
    FORMATTED_EVENT_DATE.month.charAt(0).toUpperCase() +
    FORMATTED_EVENT_DATE.month.slice(1).toLowerCase();

  return (
    <section
      ref={posterRef}
      aria-label={`Pôster comemorativo ${EVENT.name} — ${EVENT.age} Anos`}
      className="relative flex min-h-[650px] sm:min-h-[820px] w-full flex-col items-center justify-between overflow-visible pt-16 sm:pt-20 select-none"
    >
      {/* 1. GLOBOS ESPELHADOS GIGANTES (Entrada cinematográfica lenta + parallax no scroll) */}
      <motion.div
        style={{ y: topBallParallax }}
        className="pointer-events-none absolute -top-12 -left-14 sm:-top-16 sm:-left-16 z-[3] w-[198px] sm:w-[274px]"
        aria-hidden
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -28, x: -28 }}
          animate={
            revealed
              ? { opacity: 1, scale: 1, rotate: 0, x: 0 }
              : { opacity: 0, scale: 0.7, rotate: -28, x: -28 }
          }
          transition={{ duration: 1.85, delay: revealed ? 0.15 : 0, ease: [0.16, 1, 0.3, 1] }}
        >
          <MirrorDiscoBall />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: bottomBallParallax }}
        className="pointer-events-none absolute -bottom-14 -right-12 sm:-bottom-16 sm:-right-14 z-[24] w-[196px] sm:w-[278px]"
        aria-hidden
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: 26, x: 28 }}
          animate={
            revealed
              ? { opacity: 1, scale: 1, rotate: 0, x: 0 }
              : { opacity: 0, scale: 0.7, rotate: 26, x: 28 }
          }
          transition={{ duration: 1.85, delay: revealed ? 0.45 : 0, ease: [0.16, 1, 0.3, 1] }}
        >
          <MirrorDiscoBall />
        </motion.div>
      </motion.div>

      {/* 2. ESTRELAS LATERAIS COM ENTRADA STAGGERED PROLONGADA, PARALLAX & CINTILAÇÃO */}
      <motion.div
        style={{ y: starsUpParallax }}
        className="pointer-events-none absolute top-3 right-2.5 sm:top-5 sm:right-5 z-[4] w-[62px] sm:w-[94px]"
        aria-hidden
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.2, rotate: -24 }}
          animate={revealed ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.2, rotate: -24 }}
          transition={{ type: "spring", stiffness: 110, damping: 14, delay: revealed ? 0.35 : 0 }}
        >
          <GlitterBlueStar
            style={
              {
                "--float-duration": "4.8s",
                "--ty": "-6px",
                "--r-start": "14deg",
                "--r-mid": "22deg",
              } as FloatStyle
            }
            className="w-full"
          />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: starsDownParallax }}
        className="pointer-events-none absolute top-[72px] right-[25%] sm:top-[88px] sm:right-[28%] z-[4] w-[38px] sm:w-[56px]"
        aria-hidden
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.2, rotate: 22 }}
          animate={revealed ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.2, rotate: 22 }}
          transition={{ type: "spring", stiffness: 110, damping: 14, delay: revealed ? 0.55 : 0 }}
        >
          <GlitterBlueStar
            style={
              {
                animationDelay: "0.4s",
                "--float-duration": "4.4s",
                "--ty": "-5px",
                "--r-start": "-10deg",
                "--r-mid": "-2deg",
              } as FloatStyle
            }
            className="w-full"
          />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: starsUpParallax }}
        className="pointer-events-none absolute top-[134px] right-1.5 sm:top-[164px] sm:right-5 z-[4] w-[36px] sm:w-[68px]"
        aria-hidden
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.2, rotate: -20 }}
          animate={revealed ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.2, rotate: -20 }}
          transition={{ type: "spring", stiffness: 110, damping: 14, delay: revealed ? 0.72 : 0 }}
        >
          <MetallicSilverStar
            style={
              {
                animationDelay: "0.3s",
                "--float-duration": "5.1s",
                "--ty": "-6px",
                "--r-start": "8deg",
                "--r-mid": "16deg",
              } as FloatStyle
            }
            className="w-full"
          />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: starsDownParallax }}
        className="pointer-events-none absolute top-[224px] right-1.5 sm:top-[276px] sm:right-4 z-[4] w-[24px] sm:w-[40px]"
        aria-hidden
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.2, rotate: 20 }}
          animate={revealed ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.2, rotate: 20 }}
          transition={{ type: "spring", stiffness: 110, damping: 14, delay: revealed ? 0.9 : 0 }}
        >
          <MetallicSilverStar
            style={
              {
                animationDelay: "0.6s",
                "--float-duration": "4.6s",
                "--ty": "-4px",
                "--r-start": "-6deg",
                "--r-mid": "6deg",
              } as FloatStyle
            }
            className="w-full"
          />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: starsUpParallax }}
        className="pointer-events-none absolute top-[242px] left-1.5 sm:top-[290px] sm:left-7 z-[4] w-[34px] sm:w-[60px]"
        aria-hidden
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.2, rotate: -22 }}
          animate={revealed ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.2, rotate: -22 }}
          transition={{ type: "spring", stiffness: 110, damping: 14, delay: revealed ? 1.08 : 0 }}
        >
          <MetallicSilverStar
            style={
              {
                animationDelay: "0.2s",
                "--float-duration": "5.3s",
                "--ty": "-6px",
                "--r-start": "-10deg",
                "--r-mid": "-2deg",
              } as FloatStyle
            }
            className="w-full"
          />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: starsDownParallax }}
        className="pointer-events-none absolute top-[336px] left-1.5 sm:top-[396px] sm:left-6 z-[4] w-[34px] sm:w-[58px]"
        aria-hidden
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.2, rotate: 22 }}
          animate={revealed ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.2, rotate: 22 }}
          transition={{ type: "spring", stiffness: 110, damping: 14, delay: revealed ? 1.25 : 0 }}
        >
          <GlitterBlueStar
            style={
              {
                animationDelay: "0.5s",
                "--float-duration": "4.9s",
                "--ty": "-5px",
                "--r-start": "-14deg",
                "--r-mid": "-4deg",
              } as FloatStyle
            }
            className="w-full"
          />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: starsUpParallax }}
        className="pointer-events-none absolute bottom-[174px] right-2.5 sm:bottom-[218px] sm:right-6 z-[4] w-[50px] sm:w-[70px]"
        aria-hidden
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.2, rotate: -24 }}
          animate={revealed ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.2, rotate: -24 }}
          transition={{ type: "spring", stiffness: 110, damping: 14, delay: revealed ? 1.42 : 0 }}
        >
          <GlitterBlueStar
            style={
              {
                animationDelay: "0.7s",
                "--float-duration": "5.2s",
                "--ty": "-6px",
                "--r-start": "-12deg",
                "--r-mid": "-3deg",
              } as FloatStyle
            }
            className="w-full"
          />
        </motion.div>
      </motion.div>

      <motion.div
        style={{ y: starsDownParallax }}
        className="pointer-events-none absolute bottom-[118px] right-5 sm:bottom-[152px] sm:right-10 z-[4] w-[34px] sm:w-[46px]"
        aria-hidden
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.2, rotate: 20 }}
          animate={revealed ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.2, rotate: 20 }}
          transition={{ type: "spring", stiffness: 110, damping: 14, delay: revealed ? 1.6 : 0 }}
        >
          <MetallicSilverStar
            style={
              {
                animationDelay: "0.85s",
                "--float-duration": "4.5s",
                "--ty": "-4px",
                "--r-start": "6deg",
                "--r-mid": "14deg",
              } as FloatStyle
            }
            className="w-full"
          />
        </motion.div>
      </motion.div>

      {/* 3. MIOLO EDITORIAL CENTRAL: Mini Globo + Letreiro "HAPPY BiRthdAy" + Data */}
      <div className="relative z-[10] flex w-full flex-col items-center px-3 sm:px-6 text-center">
        {/* Mini Globo Central com Estrela Azul-Marinho no Topo */}
        <motion.div
          initial={{ opacity: 0, y: -42, scale: 0.48 }}
          animate={revealed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -42, scale: 0.48 }}
          transition={{ type: "spring", stiffness: 115, damping: 15, delay: revealed ? 0.1 : 0 }}
          className="relative -mb-2 sm:-mb-2.5 z-[11] w-[66px] sm:w-[86px]"
        >
          <MirrorDiscoBall mini topStar />
        </motion.div>

        {/* Letreiro "HAPPY" */}
        <div className="relative z-[12] flex items-center justify-center gap-1 sm:gap-1.5">
          {HAPPY_TILES.map((tile, i) => (
            <LetterBlock
              key={`happy-${i}`}
              tile={tile}
              index={i}
              revealed={revealed}
              sizeClass="w-[45px] h-[55px] sm:w-[66px] sm:h-[80px]"
              textClass="text-[28px] sm:text-[42px]"
            />
          ))}
        </div>

        {/* Letreiro "BiRthdAy" */}
        <div className="relative z-[12] mt-1 sm:mt-1.5 flex items-center justify-center gap-[3px] sm:gap-1.5">
          {BIRTHDAY_TILES.map((tile, i) => (
            <LetterBlock
              key={`bday-${i}`}
              tile={tile}
              index={i + 5}
              revealed={revealed}
              sizeClass="w-[32px] h-[43px] sm:w-[50px] sm:h-[66px]"
              textClass="text-[21px] sm:text-[34px]"
            />
          ))}
        </div>

        {/* Bloco da Data Oficial: Julho · SÁB | 17 | 19:30 · 2027 */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={revealed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.94 }}
          transition={{ duration: 1.35, delay: revealed ? 1.35 : 0, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 sm:mt-6 flex w-full max-w-[290px] sm:max-w-[390px] flex-col items-center text-royal-navy"
        >
          {/* Mês entre filetes */}
          <div className="flex w-full items-center gap-3 sm:gap-4">
            <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
            <span className="font-serif text-[26px] sm:text-[34px] font-bold leading-none tracking-wide">
              {monthTitle}
            </span>
            <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
          </div>

          {/* Linha Central: [Calendário] SÁB | 17 | [Relógio] 19:30 */}
          <div className="mt-1.5 sm:mt-2 flex items-center justify-center gap-2.5 sm:gap-5">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CalendarDays className="size-[20px] sm:size-[28px] text-royal-deep" strokeWidth={2} />
              <span className="font-sans text-[16px] sm:text-[22px] font-extrabold tracking-[0.06em] uppercase">
                {FORMATTED_EVENT_DATE.weekdayShort}
              </span>
            </div>

            <span className="h-9 sm:h-11 w-[2px] bg-royal-deep/80" aria-hidden />

            <span className="font-serif text-[46px] sm:text-[62px] font-bold leading-none tracking-tight">
              {FORMATTED_EVENT_DATE.day}
            </span>

            <span className="h-9 sm:h-11 w-[2px] bg-royal-deep/80" aria-hidden />

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="size-[20px] sm:size-[28px] text-royal-deep" strokeWidth={2} />
              <span className="font-sans text-[16px] sm:text-[22px] font-extrabold tabular-nums tracking-[0.04em]">
                {FORMATTED_EVENT_DATE.time}
              </span>
            </div>
          </div>

          {/* Ano em Pílula Azul Royal entre filetes */}
          <div className="mt-2 sm:mt-2.5 flex w-full items-center gap-3 sm:gap-4">
            <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
            <span className="rounded-full bg-royal-navy px-5 py-1 sm:px-7 sm:py-1.5 font-sans text-[14px] sm:text-[17px] font-bold tracking-[0.22em] text-white shadow-[0_4px_10px_rgba(7,23,57,0.28)]">
              {FORMATTED_EVENT_DATE.year}
            </span>
            <span className="h-[1.5px] flex-1 bg-royal-deep/80" />
          </div>
        </motion.div>
      </div>

      {/* 4. BASE DO PÔSTER: Foto P&B da Carol Bebê + Chapéu Glitter Azul + Laço Azul + Balões */}
      <div className="relative mt-5 sm:mt-8 flex w-full items-end justify-center">
        {/* Buquê de Balões Glossy Azul Royal no Canto Inferior Esquerdo */}
        <motion.div
          initial={{ opacity: 0, x: -44, y: 40, scale: 0.82 }}
          animate={revealed ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: -44, y: 40, scale: 0.82 }}
          transition={{ duration: 1.75, delay: revealed ? 1.35 : 0, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute -bottom-4 -left-5 sm:-bottom-6 sm:-left-6 z-[22] w-[184px] sm:w-[264px]"
        >
          <div
            style={
              {
                "--float-duration": "5.8s",
                "--ty": "-6px",
                "--r-start": "-1deg",
                "--r-mid": "2deg",
              } as FloatStyle
            }
            className="animate-sticker-float"
          >
            <RoyalGlossyBalloons />
          </div>
        </motion.div>

        {/* Foto Recortada da Carol Bebê + Adereços 100% travados em coordenadas percentuais (zero CLS) */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.88 }}
          animate={revealed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 48, scale: 0.88 }}
          transition={{ duration: 1.65, delay: revealed ? 0.95 : 0, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-[14] mx-auto aspect-[833/1024] w-[252px] sm:w-[344px]"
        >
          <Image
            src={carolCutoutImage}
            alt={`${EVENT.name} — ${EVENT.age} anos`}
            width={833}
            height={1024}
            priority
            fetchPriority="high"
            loading="eager"
            decoding="sync"
            data-critical-asset="carol"
            sizes="(max-width: 639px) 252px, 344px"
            draggable={false}
            onError={() => setPortraitError(true)}
            className={`block size-full object-contain drop-shadow-[0_12px_24px_rgba(7,23,57,0.28)] ${
              portraitError ? "opacity-0" : ""
            }`}
            style={{
              transform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              WebkitMaskImage: "linear-gradient(to bottom, black 86%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 86%, transparent 100%)",
            }}
          />

          {/* Laço Azul Royal Acetinado preso no cabelo/faixa (lado superior esquerdo, acima da sobrancelha) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
            transition={{ type: "spring", stiffness: 135, damping: 13, delay: revealed ? 1.75 : 0 }}
            className="pointer-events-none absolute top-[11%] left-[25.5%] z-[18] w-[15.5%] -rotate-[22deg] drop-shadow-[0_1px_1px_rgba(255,255,255,0.75)]"
          >
            <Bow variant="royal" className="w-full" />
          </motion.div>

          {/* Chapéu Cônico Glitter Azul Royal apoiado no topo/lateral superior direito da cabeça */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: -14 }}
            animate={revealed ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.4, y: -14 }}
            transition={{ type: "spring", stiffness: 130, damping: 13, delay: revealed ? 1.95 : 0 }}
            className="pointer-events-none absolute -top-[18.5%] right-[11.5%] z-[18] w-[33%] rotate-[23deg]"
          >
            <Image
              src={partyHatImage}
              alt=""
              width={331}
              height={472}
              priority
              fetchPriority="high"
              loading="eager"
              decoding="sync"
              data-critical-asset="partyHat"
              sizes="(max-width: 639px) 84px, 114px"
              draggable={false}
              className="block h-auto w-full select-none drop-shadow-[0_6px_12px_rgba(7,23,57,0.38)]"
              style={{
                transform: "translate3d(0, 0, 0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
