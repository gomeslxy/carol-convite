"use client";

import Lenis from "@studio-freight/lenis";
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

  const stopRaf = useCallback(() => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const startRaf = useCallback(() => {
    const instance = lenisRef.current;
    if (!instance || rafIdRef.current !== null || lockCount.current > 0 || document.hidden) {
      return;
    }

    const tick = (time: number) => {
      if (!lenisRef.current || lockCount.current > 0 || document.hidden) {
        rafIdRef.current = null;
        return;
      }
      lenisRef.current.raf(time);
      rafIdRef.current = window.requestAnimationFrame(tick);
    };

    rafIdRef.current = window.requestAnimationFrame(tick);
  }, []);

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
      lenisRef.current?.start();
      lenisRef.current?.resize();
      startRaf();
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
  }, [startRaf]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      if (lockCount.current > 0) {
        document.documentElement.classList.add("scroll-locked");
      } else {
        document.documentElement.classList.remove("scroll-locked");
      }
      return;
    }

    const instance = new Lenis({
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
      startRaf();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRaf();
      } else if (lockCount.current === 0) {
        startRaf();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopRaf();
      if (unlockResizeRafRef.current !== null) {
        window.cancelAnimationFrame(unlockResizeRafRef.current);
        unlockResizeRafRef.current = null;
      }
      instance.destroy();
      lenisRef.current = null;
    };
  }, [startRaf, stopRaf]);

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
