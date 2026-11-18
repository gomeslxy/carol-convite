"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import CoverGate from "@/components/CoverGate";

const InvitationContent = dynamic(() => import("@/components/InvitationContent"));

type Stage = "closed" | "opening" | "open";

/**
 * Orquestra a experiência completa (Mobile & Desktop):
 * - Fase 1: Capa Bipartida (`CoverGate`) em papel fino off-white/gelo com ornamentos
 *           em Prata & Azul Royal e broche central "C" em alto-relevo (100dvh).
 * - Fase 2: Pôster animado (`HeroPoster`) + continuação editorial Royal Blue & Silver
 *           com liberação fluida do scroll (Lenis).
 */
export default function InvitationExperience() {
  const [stage, setStage] = useState<Stage>("closed");

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
        <CoverGate onOpenStart={handleOpenStart} onOpenComplete={handleOpenComplete} />
      )}
    </div>
  );
}
