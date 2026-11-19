"use client";

import type Lenis from "@studio-freight/lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

interface ScrollLockContextValue {
  /** Trava o scroll (contador — suporta travas aninhadas). */
  lock: () => void;
  unlock: () => void;
}

const ScrollLockContext = createContext<ScrollLockContextValue | null>(null);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const lockCount = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const unlockResizeRafRef = useRef<number | null>(null);
  const destroyedRef = useRef(false);
  const lenisLoadingRef = useRef(false);
  const prefersReducedRef = useRef(false);

  const stopRaf = useCallback(() => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const startRaf = useCallback(() => {
    const instance = lenisRef.current;
    if (
      !instance ||
      destroyedRef.current ||
      rafIdRef.current !== null ||
      lockCount.current > 0 ||
      document.hidden
    ) {
      return;
    }

    const tick = (time: number) => {
      if (
        !lenisRef.current ||
        destroyedRef.current ||
        lockCount.current > 0 ||
        document.hidden
      ) {
        rafIdRef.current = null;
        return;
      }
      lenisRef.current.raf(time);
      rafIdRef.current = window.requestAnimationFrame(tick);
    };

    rafIdRef.current = window.requestAnimationFrame(tick);
  }, []);

  const ensureLenis = useCallback(() => {
    if (
      typeof window === "undefined" ||
      destroyedRef.current ||
      lenisRef.current ||
      lenisLoadingRef.current ||
      lockCount.current > 0 ||
      prefersReducedRef.current
    ) {
      return;
    }

    // Touch mobile/tablets usam scroll nativo 60/120fps sem chunk de Lenis nem loop RAF ocioso
    if (!window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    lenisLoadingRef.current = true;
    void import("@studio-freight/lenis")
      .then(({ default: LenisCtor }) => {
        lenisLoadingRef.current = false;
        if (destroyedRef.current || lenisRef.current) return;

        const instance = new LenisCtor({
          lerp: 0.12,
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1,
        });

        lenisRef.current = instance;
        if (lockCount.current > 0) {
          document.documentElement.classList.add("scroll-locked");
          instance.stop();
          stopRaf();
        } else {
          document.documentElement.classList.remove("scroll-locked");
          instance.resize();
          startRaf();
        }
      })
      .catch(() => {
        lenisLoadingRef.current = false;
      });
  }, [startRaf, stopRaf]);

  const lock = useCallback(() => {
    if (unlockResizeRafRef.current !== null) {
      window.cancelAnimationFrame(unlockResizeRafRef.current);
      unlockResizeRafRef.current = null;
    }
    lockCount.current += 1;
    if (lockCount.current === 1) {
      document.documentElement.classList.add("scroll-locked");
      lenisRef.current?.stop();
      stopRaf();
    }
  }, [stopRaf]);

  const unlock = useCallback(() => {
    if (lockCount.current === 0) return;
    lockCount.current -= 1;
    if (lockCount.current === 0) {
      document.documentElement.classList.remove("scroll-locked");
      if (lenisRef.current) {
        lenisRef.current.start();
        lenisRef.current.resize();
        startRaf();
      } else {
        ensureLenis();
      }
      if (unlockResizeRafRef.current !== null) {
        window.cancelAnimationFrame(unlockResizeRafRef.current);
      }
      unlockResizeRafRef.current = window.requestAnimationFrame(() => {
        unlockResizeRafRef.current = null;
        if (lockCount.current === 0) {
          lenisRef.current?.resize();
        }
      });
    }
  }, [ensureLenis, startRaf]);

  useEffect(() => {
    destroyedRef.current = false;
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    prefersReducedRef.current = prefersReduced;

    if (lockCount.current > 0) {
      document.documentElement.classList.add("scroll-locked");
    } else {
      document.documentElement.classList.remove("scroll-locked");
      ensureLenis();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRaf();
      } else if (lockCount.current === 0) {
        if (lenisRef.current) {
          startRaf();
        } else {
          ensureLenis();
        }
      }
    };

    const handlePageShow = () => {
      if (lockCount.current > 0) {
        document.documentElement.classList.add("scroll-locked");
        lenisRef.current?.stop();
        stopRaf();
      } else {
        document.documentElement.classList.remove("scroll-locked");
        if (lenisRef.current) {
          lenisRef.current.start();
          lenisRef.current.resize();
          startRaf();
        } else {
          ensureLenis();
        }
      }
    };

    const handlePageHide = () => {
      stopRaf();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      destroyedRef.current = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
      stopRaf();
      if (unlockResizeRafRef.current !== null) {
        window.cancelAnimationFrame(unlockResizeRafRef.current);
        unlockResizeRafRef.current = null;
      }
      lenisRef.current?.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove("scroll-locked");
    };
  }, [ensureLenis, startRaf, stopRaf]);

  const lockValue = useMemo<ScrollLockContextValue>(() => ({ lock, unlock }), [lock, unlock]);

  return <ScrollLockContext.Provider value={lockValue}>{children}</ScrollLockContext.Provider>;
}

/** Trava o scroll enquanto `active` for verdadeiro. */
export function useScrollLock(active: boolean) {
  const ctx = useContext(ScrollLockContext);
  if (!ctx) throw new Error("useScrollLock deve ser usado dentro de <SmoothScrollProvider>");
  const { lock, unlock } = ctx;

  useEffect(() => {
    if (!active) return;
    lock();
    return () => unlock();
  }, [active, lock, unlock]);
}
