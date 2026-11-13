import { memo, type CSSProperties } from "react";
import { Bow } from "@/components/BowDecoration";
import { FoilBalloon18 } from "@/components/Ornaments";
import { EVENT } from "@/config/event";

export interface CarolHeroCollageProps {
  /** Versão compacta para a prévia da carta saindo do envelope 3D */
  compact?: boolean;
}

type StickerStyle = CSSProperties & {
  "--float-duration"?: string;
  "--ty"?: string;
  "--r-start"?: string;
  "--r-mid"?: string;
  "--s-start"?: string;
  "--s-mid"?: string;
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  COLAGEM EDITORIAL DA ANIVERSARIANTE
 *  - Animações CSS puras aceleradas por GPU (transform: translate3d), sem
 *    loops infinitos em JavaScript e pausadas automaticamente quando ocultas.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const CarolHeroCollage = memo(function CarolHeroCollage({
  compact = false,
}: CarolHeroCollageProps) {
  if (compact) {
    return (
      <div className="relative mx-auto flex h-[112px] w-[176px] items-center justify-center select-none">
        <img
          src="/images/disco-ball.png"
          alt=""
          width={92}
          height={92}
          decoding="async"
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 w-[92px] h-auto -translate-x-1/2 opacity-95 drop-shadow-[0_6px_14px_rgba(9,13,22,0.4)]"
        />

        <img
          src="/images/silver-glitter-star.png"
          alt=""
          width={28}
          height={28}
          decoding="async"
          aria-hidden
          className="pointer-events-none absolute top-1 right-3 w-[28px] h-auto rotate-12"
        />
        <img
          src="/images/blue-star.png"
          alt=""
          width={26}
          height={26}
          decoding="async"
          aria-hidden
          className="pointer-events-none absolute bottom-3 right-2 w-[26px] h-auto -rotate-12"
        />
        <img
          src="/images/heart-blue.png"
          alt=""
          width={22}
          height={22}
          decoding="async"
          aria-hidden
          className="pointer-events-none absolute top-5 left-2 w-[22px] h-auto -rotate-12"
        />

        <img
          src="/images/carol-cutout.png"
          alt={EVENT.name}
          width={120}
          height={144}
          decoding="async"
          className="relative z-10 mt-3 h-[96px] w-auto object-contain drop-shadow-[0_8px_16px_rgba(9,13,22,0.5)]"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
          }}
        />

        <div className="pointer-events-none absolute bottom-1 -left-1 z-20 -rotate-6">
          <FoilBalloon18 className="w-[54px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-[350px] sm:max-w-[400px] flex-col items-center justify-center pt-4 pb-2 select-none">
      <div className="relative flex h-[252px] w-[284px] sm:h-[290px] sm:w-[328px] items-end justify-center">
        {/* Halo luminoso suave atrás do globo e da Carol */}
        <div
          className="pointer-events-none absolute top-4 left-1/2 h-[190px] w-[190px] sm:h-[220px] sm:w-[220px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.22)_0%,rgba(96,165,250,0.12)_42%,transparent_70%)]"
          aria-hidden
        />

        {/* 1. Globo Espelhado Prateado Grande */}
        <div className="pointer-events-none absolute top-1 left-1/2 z-0 w-[196px] sm:w-[228px] -translate-x-1/2">
          <img
            src="/images/disco-ball.png"
            alt=""
            width={228}
            height={228}
            decoding="async"
            aria-hidden
            style={
              {
                "--float-duration": "6.8s",
                "--ty": "-5px",
                "--r-start": "-2.5deg",
                "--r-mid": "2.5deg",
              } as StickerStyle
            }
            className="animate-sticker-sway w-full h-auto opacity-95 drop-shadow-[0_14px_28px_rgba(9,13,22,0.5)]"
          />
        </div>

        {/* 2. Laço Azul Royal Acetinado no topo direito do globo */}
        <div
          style={
            {
              "--float-duration": "5.4s",
              "--ty": "-3px",
              "--r-start": "10deg",
              "--r-mid": "15deg",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute -top-2 right-2 sm:right-3 z-20"
        >
          <Bow variant="royal" className="w-[62px] sm:w-[74px]" />
        </div>

        {/* 3. Estrela de Glitter Prateada no canto superior esquerdo */}
        <img
          src="/images/silver-glitter-star.png"
          alt=""
          width={66}
          height={66}
          decoding="async"
          aria-hidden
          style={
            {
              "--float-duration": "4.5s",
              "--ty": "-6px",
              "--r-start": "-12deg",
              "--r-mid": "-4deg",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute top-2 left-1 sm:left-2 z-10 w-[56px] sm:w-[66px] h-auto drop-shadow-[0_8px_14px_rgba(9,13,22,0.35)]"
        />

        {/* 4. Coração Metalizado Azul Claro flutuando à esquerda */}
        <img
          src="/images/heart-blue.png"
          alt=""
          width={52}
          height={52}
          decoding="async"
          aria-hidden
          style={
            {
              animationDelay: "0.3s",
              "--float-duration": "4.9s",
              "--ty": "-7px",
              "--r-start": "-14deg",
              "--r-mid": "-6deg",
              "--s-start": "1",
              "--s-mid": "1.05",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute top-[28%] -left-1 sm:left-0 z-10 w-[44px] sm:w-[52px] h-auto drop-shadow-[0_8px_16px_rgba(9,13,22,0.4)]"
        />

        {/* 5. Estrela Cromada Prateada à direita */}
        <img
          src="/images/silver-star.png"
          alt=""
          width={60}
          height={60}
          decoding="async"
          aria-hidden
          style={
            {
              animationDelay: "0.5s",
              "--float-duration": "5.2s",
              "--ty": "-6px",
              "--r-start": "8deg",
              "--r-mid": "16deg",
            } as StickerStyle
          }
          className="animate-sticker-float-alt pointer-events-none absolute top-[24%] right-0 sm:right-1 z-10 w-[52px] sm:w-[60px] h-auto drop-shadow-[0_8px_14px_rgba(9,13,22,0.38)]"
        />

        {/* 6. Foto da Carol Bebê sem fundo em PNG (Protagonista) */}
        <div className="relative z-10 flex items-end justify-center">
          <img
            src="/images/carol-cutout.png"
            alt={`${EVENT.name} — ${EVENT.age} anos`}
            width={220}
            height={256}
            decoding="async"
            fetchPriority="high"
            className="h-[222px] sm:h-[256px] w-auto object-contain drop-shadow-[0_16px_26px_rgba(9,13,22,0.55)]"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 82%, transparent 100%)",
            }}
          />
        </div>

        {/* 7. Balão Metalizado 3D "18" em Prata Cromado */}
        <div
          style={
            {
              "--float-duration": "4.8s",
              "--ty": "-7px",
              "--r-start": "-6deg",
              "--r-mid": "-2deg",
            } as StickerStyle
          }
          className="animate-sticker-float pointer-events-none absolute bottom-1 -left-3 sm:-left-5 z-20"
        >
          <FoilBalloon18 className="w-[106px] sm:w-[124px]" />
        </div>

        {/* 8. Estrela de Glitter Azul Royal no lado direito inferior */}
        <img
          src="/images/blue-star.png"
          alt=""
          width={58}
          height={58}
          decoding="async"
          aria-hidden
          style={
            {
              animationDelay: "0.7s",
              "--float-duration": "4.2s",
              "--ty": "-5px",
              "--r-start": "-6deg",
              "--r-mid": "6deg",
            } as StickerStyle
          }
          className="animate-sticker-float-alt pointer-events-none absolute bottom-6 right-0 sm:right-1 z-20 w-[50px] sm:w-[58px] h-auto drop-shadow-[0_8px_16px_rgba(9,13,22,0.45)]"
        />
      </div>
    </div>
  );
});

export default CarolHeroCollage;
