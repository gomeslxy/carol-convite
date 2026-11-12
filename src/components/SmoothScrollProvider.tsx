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

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  /** Trava o scroll (contador — suporta travas aninhadas: envelope + modais). */
  lock: () => void;
  unlock: () => void;
}

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

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    lenisRef.current = instance;
    if (lockCount.current > 0) instance.stop();
    else document.documentElement.classList.remove("scroll-locked");
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  const value = useMemo(() => ({ lenis, lock, unlock }), [lenis, lock, unlock]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

export function useSmoothScroll(): SmoothScrollContextValue {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) throw new Error("useSmoothScroll deve ser usado dentro de <SmoothScrollProvider>");
  return ctx;
}

/** Trava o scroll enquanto `active` for verdadeiro. */
export function useScrollLock(active: boolean) {
  const { lock, unlock } = useSmoothScroll();
  useEffect(() => {
    if (!active) return;
    lock();
    return () => unlock();
  }, [active, lock, unlock]);
}

