"use client";

import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollLockContextValue {
  /** Trava o scroll (contador — suporta travas aninhadas: envelope + modais). */
  lock: () => void;
  unlock: () => void;
}

interface SmoothScrollContextValue extends ScrollLockContextValue {
  lenis: Lenis | null;
}

const ScrollLockContext = createContext<ScrollLockContextValue | null>(null);
const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lockCount = useRef(0);

  const lock = useCallback(() => {
    lockCount.current += 1;
    if (lockCount.current === 1) {
      document.documentElement.classList.add("scroll-locked");
      lenisRef.current?.stop();
    }
  }, []);

  const unlock = useCallback(() => {
    lockCount.current = Math.max(0, lockCount.current - 1);
    if (lockCount.current === 0) {
      document.documentElement.classList.remove("scroll-locked");
      lenisRef.current?.start();
    }
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const instance = new Lenis({
      duration: prefersReduced ? 0.4 : 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReduced,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    });

    const onScroll = () => ScrollTrigger.update();
    instance.on("scroll", onScroll);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);

    lenisRef.current = instance;
    if (lockCount.current > 0) {
      document.documentElement.classList.add("scroll-locked");
      instance.stop();
    } else {
      document.documentElement.classList.remove("scroll-locked");
    }
    setLenis(instance);

    return () => {
      instance.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const lockValue = useMemo<ScrollLockContextValue>(() => ({ lock, unlock }), [lock, unlock]);
  const scrollValue = useMemo<SmoothScrollContextValue>(
    () => ({ lenis, lock, unlock }),
    [lenis, lock, unlock],
  );

  return (
    <ScrollLockContext.Provider value={lockValue}>
      <SmoothScrollContext.Provider value={scrollValue}>{children}</SmoothScrollContext.Provider>
    </ScrollLockContext.Provider>
  );
}

export function useSmoothScroll(): SmoothScrollContextValue {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) throw new Error("useSmoothScroll deve ser usado dentro de <SmoothScrollProvider>");
  return ctx;
}

/** Trava o scroll enquanto `active` for verdadeiro sem assinar mudanças da instância Lenis. */
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
