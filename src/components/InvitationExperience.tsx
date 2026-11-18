"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import CoverGate from "@/components/CoverGate";
import InvitationContent from "@/components/InvitationContent";
import Preloader from "@/components/Preloader";
import { useScrollLock } from "@/components/SmoothScrollProvider";

type Stage = "closed" | "opening" | "open";

const MIN_PRELOADER_MS = 450;
const PRELOADER_TIMEOUT_MS = 3000;

const CRITICAL_IMAGE_FALLBACKS = [
  "/images/brasao-barroco-c.png",
  "/images/cover-ornament-backdrop-right.png",
  "/images/carol-cutout.png",
] as const;

interface ImageDescriptor {
  src: string;
  srcset?: string;
  sizes?: string;
  domEl?: HTMLImageElement;
}

/**
 * Pré-carrega e decodifica em memória (`new Image()` + `img.decode()`)
 * uma imagem crítica antes de liberar a tela inicial.
 */
async function decodeCriticalImage({
  src,
  srcset,
  sizes,
  domEl,
}: ImageDescriptor): Promise<void> {
  const img = new window.Image();
  if (sizes) img.sizes = sizes;
  if (srcset) img.srcset = srcset;
  img.src = src;

  if (!img.complete) {
    await new Promise<void>((resolve) => {
      const done = () => resolve();
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
      if (img.complete) resolve();
    });
  }

  if (img.naturalWidth > 0 && typeof img.decode === "function") {
    try {
      await img.decode();
    } catch {
      /* ignora falha de decode em navegadores ou respostas inválidas */
    }
  }

  if (domEl && domEl.complete && domEl.naturalWidth > 0 && typeof domEl.decode === "function") {
    try {
      await domEl.decode();
    } catch {
      /* ignora falha de decode no elemento montado */
    }
  }
}

async function preloadCriticalAssets(): Promise<void> {
  if (typeof window === "undefined") return;

  const domImages = Array.from(
    document.querySelectorAll<HTMLImageElement>('img[data-critical-asset="true"]'),
  );

  const descriptors: ImageDescriptor[] = [];
  const coveredFallbacks = new Set<string>();

  for (const el of domImages) {
    const rawSrc = el.getAttribute("src") ?? el.src;
    const srcset = el.getAttribute("srcset") ?? undefined;
    const sizes = el.getAttribute("sizes") ?? undefined;
    const effectiveSrc = el.currentSrc || rawSrc;

    for (const fallback of CRITICAL_IMAGE_FALLBACKS) {
      if (
        rawSrc.includes(encodeURIComponent(fallback)) ||
        rawSrc.includes(fallback)
      ) {
        coveredFallbacks.add(fallback);
      }
    }

    if (effectiveSrc) {
      descriptors.push({ src: effectiveSrc, srcset, sizes, domEl: el });
    }
  }

  for (const fallback of CRITICAL_IMAGE_FALLBACKS) {
    if (!coveredFallbacks.has(fallback)) {
      descriptors.push({ src: fallback });
    }
  }

  await Promise.all(descriptors.map((desc) => decodeCriticalImage(desc)));
}

/**
 * Orquestra a experiência completa (Mobile & Desktop):
 * - Fase 0: `Preloader` imediato (`bg-paper-fine`) enquanto aguarda `document.fonts.ready`
 *           e `img.decode()` das imagens críticas (mínimo ~450ms, timeout máximo 3000ms).
 * - Fase 1: Capa Bipartida (`CoverGate`) em papel fino off-white/gelo com ornamentos
 *           em Prata & Azul Royal e broche central "C" em alto-relevo (100dvh).
 * - Fase 2: Pôster animado (`HeroPoster`) já montado e decodificado por baixo +
 *           continuação editorial Royal Blue & Silver com liberação fluida do scroll (Lenis).
 */
export default function InvitationExperience() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [stage, setStage] = useState<Stage>("closed");

  // Mantém overflow: hidden no body durante o Preloader (CoverGate mantém após ele)
  useScrollLock(!isAppReady);

  useEffect(() => {
    let cancelled = false;
    let minTimerId: number | undefined;
    let safetyTimerId: number | undefined;

    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      if (minTimerId !== undefined) window.clearTimeout(minTimerId);
      if (safetyTimerId !== undefined) window.clearTimeout(safetyTimerId);
      setIsAppReady(true);
    };

    const waitMinDelay = new Promise<void>((resolve) => {
      minTimerId = window.setTimeout(resolve, MIN_PRELOADER_MS);
    });

    const waitFonts =
      typeof document !== "undefined" && "fonts" in document && document.fonts?.ready
        ? document.fonts.ready.then(() => undefined).catch(() => undefined)
        : Promise.resolve();

    const waitImages = preloadCriticalAssets().catch(() => undefined);

    safetyTimerId = window.setTimeout(finish, PRELOADER_TIMEOUT_MS);

    Promise.all([waitMinDelay, waitFonts, waitImages]).then(finish);

    return () => {
      cancelled = true;
      if (minTimerId !== undefined) window.clearTimeout(minTimerId);
      if (safetyTimerId !== undefined) window.clearTimeout(safetyTimerId);
    };
  }, []);

  const handleOpenStart = useCallback(() => setStage("opening"), []);
  const handleOpenComplete = useCallback(() => setStage("open"), []);

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-x-clip md:px-6 md:py-12 lg:px-10 lg:py-16">
      {/* Iluminação ambiental em Azul Royal e Prata suave no fundo do Desktop */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 hidden md:block"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 45%, rgba(10, 36, 99, 0.09) 0%, transparent 72%), radial-gradient(38% 38% at 15% 20%, rgba(30, 64, 175, 0.07) 0%, transparent 65%), radial-gradient(38% 38% at 85% 80%, rgba(148, 163, 184, 0.22) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      <InvitationContent revealed={stage !== "closed"} />

      {stage !== "open" && (
        <CoverGate
          ready={isAppReady}
          onOpenStart={handleOpenStart}
          onOpenComplete={handleOpenComplete}
        />
      )}

      <AnimatePresence>
        {!isAppReady && <Preloader key="app-preloader" />}
      </AnimatePresence>
    </div>
  );
}
