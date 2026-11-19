"use client";

import { AnimatePresence, MotionConfig } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import CoverGate from "@/components/CoverGate";
import InvitationContent from "@/components/InvitationContent";
import Preloader from "@/components/Preloader";
import { useScrollLock } from "@/components/SmoothScrollProvider";

type Stage = "closed" | "opening" | "open";

const MIN_PRELOADER_MS = 450;
const PRELOADER_TIMEOUT_MS = 3000;

const CRITICAL_IMAGE_FALLBACKS: Readonly<Record<string, string>> = {
  crest: "/images/brasao-barroco-c.png",
  backdrop: "/images/cover-ornament-backdrop-right.png",
  carol: "/images/carol-cutout.png",
  partyHat: "/images/party-hat.png",
};

/**
 * Aguarda o carregamento (`load`/`error`) de um `HTMLImageElement` já existente ou criado em memória,
 * respeitando `AbortSignal` para evitar memory leaks em unmount/timeout.
 */
function waitForImageLoad(img: HTMLImageElement, signal: AbortSignal): Promise<void> {
  if (img.complete) return Promise.resolve();
  if (signal.aborted) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const cleanup = () => {
      img.removeEventListener("load", onDone);
      img.removeEventListener("error", onDone);
      signal.removeEventListener("abort", onDone);
    };
    const onDone = () => {
      cleanup();
      resolve();
    };

    img.addEventListener("load", onDone, { once: true });
    img.addEventListener("error", onDone, { once: true });
    signal.addEventListener("abort", onDone, { once: true });

    if (img.complete) {
      onDone();
    }
  });
}

async function safeDecodeImage(img: HTMLImageElement): Promise<void> {
  if (img.naturalWidth > 0 && typeof img.decode === "function") {
    try {
      await img.decode();
    } catch {
      /* ignora falha de decode em navegadores ou respostas inválidas */
    }
  }
}

/**
 * Garante carregamento e pré-decodificação em memória (`img.decode()`) do elemento DOM montado.
 * Se já carregou (`naturalWidth > 0`), retorna sem criar segunda instância de `Image`;
 * caso contrário tenta o fallback pela URL resolvida.
 */
async function decodeDomCriticalImage(
  domEl: HTMLImageElement,
  signal: AbortSignal,
): Promise<void> {
  await waitForImageLoad(domEl, signal);
  if (signal.aborted) return;

  await safeDecodeImage(domEl);
  if (signal.aborted || domEl.naturalWidth > 0) return;

  const resolvedSrc = domEl.currentSrc || domEl.getAttribute("src") || domEl.src;
  if (!resolvedSrc) return;

  await decodeFallbackUrl(resolvedSrc, signal);
}

async function decodeFallbackUrl(src: string, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return;
  const img = new window.Image();
  img.decoding = "sync";
  img.src = src;

  await waitForImageLoad(img, signal);
  if (signal.aborted) return;
  await safeDecodeImage(img);
}

async function preloadCriticalAssets(signal: AbortSignal): Promise<void> {
  if (typeof window === "undefined") return;

  const domImages = Array.from(
    document.querySelectorAll<HTMLImageElement>("img[data-critical-asset]"),
  );

  const coveredKeys = new Set<string>();
  const tasks: Promise<void>[] = [];

  for (const el of domImages) {
    const key = el.getAttribute("data-critical-asset");
    if (key) coveredKeys.add(key);
    tasks.push(decodeDomCriticalImage(el, signal));
  }

  for (const [key, fallbackSrc] of Object.entries(CRITICAL_IMAGE_FALLBACKS)) {
    if (!coveredKeys.has(key)) {
      tasks.push(decodeFallbackUrl(fallbackSrc, signal));
    }
  }

  await Promise.all(tasks);
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

  // Mantém overflow: hidden no body durante o Preloader (CoverGate assume após ele)
  useScrollLock(!isAppReady);

  useEffect(() => {
    let cancelled = false;
    let minTimerId: number | undefined;
    let safetyTimerId: number | undefined;
    let rafId: number | undefined;
    const controller = new AbortController();

    const commitReady = () => {
      if (cancelled) return;
      cancelled = true;
      controller.abort();
      if (minTimerId !== undefined) window.clearTimeout(minTimerId);
      if (safetyTimerId !== undefined) window.clearTimeout(safetyTimerId);
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
      setIsAppReady(true);
    };

    const finishAfterPaint = () => {
      if (cancelled) return;
      rafId = window.requestAnimationFrame(commitReady);
    };

    const waitMinDelay = new Promise<void>((resolve) => {
      minTimerId = window.setTimeout(resolve, MIN_PRELOADER_MS);
    });

    const waitFonts =
      typeof document !== "undefined" && "fonts" in document && document.fonts?.ready
        ? document.fonts.ready.then(() => undefined).catch(() => undefined)
        : Promise.resolve();

    const waitImages = preloadCriticalAssets(controller.signal).catch(() => undefined);

    safetyTimerId = window.setTimeout(commitReady, PRELOADER_TIMEOUT_MS);

    Promise.all([waitMinDelay, waitFonts, waitImages]).then(finishAfterPaint);

    return () => {
      cancelled = true;
      controller.abort();
      if (minTimerId !== undefined) window.clearTimeout(minTimerId);
      if (safetyTimerId !== undefined) window.clearTimeout(safetyTimerId);
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleOpenStart = useCallback(() => setStage("opening"), []);
  const handleOpenComplete = useCallback(() => setStage("open"), []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-x-clip md:px-6 md:py-12 lg:px-10 lg:py-16">
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
    </MotionConfig>
  );
}
