"use client";

import { useCallback, useState } from "react";
import Envelope3DOpening from "@/components/Envelope3DOpening";
import InvitationContent from "@/components/InvitationContent";

type Stage = "closed" | "opening" | "open";

/**
 * Orquestra a experiência completa (Mobile & Desktop):
 * - Fase 1: Envelope 3D Real em Azul Royal acetinado e Prata (100dvh centralizado)
 *           que abre a aba superior em perspectiva 3D e extrai a folha interna.
 * - Fase 2: A folha branca perolada extraída do envelope expande-se continuamente
 *           tornando-se o corpo do convite, com liberação fluida do scroll (Lenis).
 */
export default function InvitationExperience() {
  const [stage, setStage] = useState<Stage>("closed");

  const handleOpenStart = useCallback(() => setStage("opening"), []);
  const handleOpenComplete = useCallback(() => setStage("open"), []);

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-x-hidden md:px-6 md:py-12 lg:px-10 lg:py-16">
      {/* Iluminação ambiental em Azul Royal e Prata suave no fundo do Desktop */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 hidden md:block"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 45%, rgba(30, 64, 175, 0.10) 0%, transparent 72%), radial-gradient(38% 38% at 15% 20%, rgba(29, 78, 216, 0.08) 0%, transparent 65%), radial-gradient(38% 38% at 85% 80%, rgba(148, 163, 184, 0.20) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      <InvitationContent revealed={stage !== "closed"} interactive={stage === "open"} />
      {stage !== "open" && (
        <Envelope3DOpening onOpenStart={handleOpenStart} onOpenComplete={handleOpenComplete} />
      )}
    </div>
  );
}
