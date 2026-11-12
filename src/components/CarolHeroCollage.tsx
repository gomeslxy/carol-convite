"use client";

import { motion } from "framer-motion";
import { Bow } from "@/components/BowDecoration";
import { FoilBalloon18 } from "@/components/Ornaments";
import { EVENT } from "@/config/event";

export interface CarolHeroCollageProps {
  /** Versão compacta para a prévia da carta saindo do envelope 3D */
  compact?: boolean;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  COLAGEM EDITORIAL DA ANIVERSARIANTE (Inspirada nas Fotos de Referência)
 *  - Foto da Carol bebê sem fundo em PNG de alta qualidade (/images/carol-cutout.png)
 *  - Adesivos sem fundo: Globo espelhado, Estrelas cromadas & glitter azul/prata,
 *    Coração metalizado azul, Balão metalizado 3D "18" e Laço Azul Royal acetinado.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function CarolHeroCollage({ compact = false }: CarolHeroCollageProps) {
  if (compact) {
    return (
      <div className="relative mx-auto flex h-[112px] w-[176px] items-center justify-center select-none">
        {/* Globo espelhado ao fundo */}
        <img
          src="/images/disco-ball.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 w-[92px] -translate-x-1/2 opacity-95 drop-shadow-[0_6px_14px_rgba(9,13,22,0.4)]"
        />

        {/* Estrelas sem fundo nas laterais */}
        <img
          src="/images/silver-glitter-star.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-1 right-3 w-[28px] rotate-12"
        />
        <img
          src="/images/blue-star.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-3 right-2 w-[26px] -rotate-12"
        />
        <img
          src="/images/heart-blue.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-5 left-2 w-[22px] -rotate-12"
        />

        {/* Carol Bebê sem fundo em PNG */}
        <img
          src="/images/carol-cutout.png"
          alt={EVENT.name}
          className="relative z-10 mt-3 h-[96px] w-auto object-contain drop-shadow-[0_8px_16px_rgba(9,13,22,0.5)]"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
          }}
        />

        {/* Balão metalizado 18 à esquerda */}
        <div className="pointer-events-none absolute bottom-1 -left-1 z-20 -rotate-6">
          <FoilBalloon18 className="w-[54px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-[350px] sm:max-w-[400px] flex-col items-center justify-center pt-4 pb-2 select-none">
      {/* Container da Composição Editorial */}
      <div className="relative flex h-[252px] w-[284px] sm:h-[290px] sm:w-[328px] items-end justify-center">
        {/* Halo luminoso suave atrás do globo e da Carol */}
        <div
          className="pointer-events-none absolute top-4 left-1/2 h-[190px] w-[190px] sm:h-[220px] sm:w-[220px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22)_0%,rgba(96,165,250,0.14)_45%,transparent_72%)] blur-xl"
          aria-hidden
        />

        {/* 1. Globo Espelhado Prateado Grande atrás da Carol */}
        <motion.img
          src="/images/disco-ball.png"
          alt=""
          aria-hidden
          animate={{ rotate: [-2.5, 2.5, -2.5], y: [0, -5, 0] }}
          transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-1 left-1/2 z-0 w-[196px] sm:w-[228px] -translate-x-1/2 opacity-95 drop-shadow-[0_14px_28px_rgba(9,13,22,0.5)]"
        />

        {/* 2. Laço Azul Royal Acetinado no topo direito do globo */}
        <motion.div
          animate={{ rotate: [10, 15, 10], y: [0, -3, 0] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-2 right-2 sm:right-3 z-20"
        >
          <Bow variant="royal" className="w-[62px] sm:w-[74px]" />
        </motion.div>

        {/* 3. Estrela de Glitter Prateada no canto superior esquerdo */}
        <motion.img
          src="/images/silver-glitter-star.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -6, 0], rotate: [-12, -4, -12] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute top-2 left-1 sm:left-2 z-10 w-[56px] sm:w-[66px] drop-shadow-[0_8px_14px_rgba(9,13,22,0.35)]"
        />

        {/* 4. Coração Metalizado Azul Claro flutuando à esquerda */}
        <motion.img
          src="/images/heart-blue.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -7, 0], rotate: [-14, -6, -14], scale: [1, 1.05, 1] }}
          transition={{ duration: 4.9, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="pointer-events-none absolute top-[28%] -left-1 sm:left-0 z-10 w-[44px] sm:w-[52px] drop-shadow-[0_8px_16px_rgba(9,13,22,0.4)]"
        />

        {/* 5. Estrela Cromada Prateada à direita */}
        <motion.img
          src="/images/silver-star.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -6, 0], rotate: [8, 16, 8] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="pointer-events-none absolute top-[24%] right-0 sm:right-1 z-10 w-[52px] sm:w-[60px] drop-shadow-[0_8px_14px_rgba(9,13,22,0.38)]"
        />

        {/* 6. Foto da Carol Bebê sem fundo em PNG de alta qualidade (Protagonista) */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex items-end justify-center"
        >
          <img
            src="/images/carol-cutout.png"
            alt={`${EVENT.name} — ${EVENT.age} anos`}
            className="h-[222px] sm:h-[256px] w-auto object-contain drop-shadow-[0_16px_26px_rgba(9,13,22,0.55)]"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
            }}
          />
        </motion.div>

        {/* 7. Balão Metalizado 3D "18" em Prata Cromado (Canto Inferior Esquerdo) */}
        <motion.div
          animate={{ y: [0, -7, 0], rotate: [-6, -2, -6] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute bottom-1 -left-3 sm:-left-5 z-20"
        >
          <FoilBalloon18 className="w-[106px] sm:w-[124px]" />
        </motion.div>

        {/* 8. Estrela de Glitter Azul Royal no lado direito inferior */}
        <motion.img
          src="/images/blue-star.png"
          alt=""
          aria-hidden
          animate={{ y: [0, -5, 0], rotate: [-6, 6, -6] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          className="pointer-events-none absolute bottom-6 right-0 sm:right-1 z-20 w-[50px] sm:w-[58px] drop-shadow-[0_8px_16px_rgba(9,13,22,0.45)]"
        />
      </div>
    </div>
  );
}
