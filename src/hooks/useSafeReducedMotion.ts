"use client";

import { useEffect, useState } from "react";

/**
 * Hook seguro para hidratação SSR/CSR do `prefers-reduced-motion`.
 * Retorna `false` no SSR e no primeiro render cliente (zero hydration mismatch),
 * sincronizando em `useEffect` e escutando alterações dinâmicas do sistema operacional.
 */
export function useSafeReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    }

    mq.addListener(handleChange);
    return () => mq.removeListener(handleChange);
  }, []);

  return reduced;
}
