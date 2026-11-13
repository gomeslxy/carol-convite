"use client";

import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Bow } from "@/components/BowDecoration";
import { CornerFiligree } from "@/components/Ornaments";
import { useScrollLock } from "@/components/SmoothScrollProvider";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

function SheetPanel({ onClose, title, subtitle, icon, children }: Omit<SheetProps, "open">) {
  const controls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const subtitleId = useId();

  useScrollLock(true);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, []);

  const handleDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
      data-lenis-prevent
    >
      <motion.div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/65 md:backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.26 }}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        drag="y"
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={handleDragEnd}
        initial={{ y: "100%", opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 330, damping: 34, mass: 0.9 }}
        className="bg-satin relative flex max-h-[88dvh] w-full max-w-md md:max-w-lg flex-col overflow-hidden rounded-t-[28px] md:rounded-[28px] shadow-[0_28px_60px_-12px_rgba(15,23,42,0.38)] outline-none will-change-transform"
      >
        {/* Moldura dupla prateada interna + cantoneiras geométricas */}
        <div
          className="pointer-events-none absolute inset-2.5 rounded-t-[22px] md:rounded-[22px] border border-silver-300/85"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-[14px] rounded-t-[19px] md:rounded-[19px] border border-silver-200/90"
          aria-hidden
        />
        <CornerFiligree
          position="tl"
          tone="slate"
          className="absolute top-3.5 left-3.5 size-9 opacity-45"
        />
        <CornerFiligree
          position="tr"
          tone="slate"
          className="absolute top-3.5 right-3.5 size-9 opacity-45"
        />

        {/* Cabeçalho arrastável */}
        <div
          onPointerDown={(e) => controls.start(e)}
          className="relative shrink-0 cursor-grab touch-none px-6 pt-3.5 pb-4 text-center active:cursor-grabbing"
        >
          <span
            className="mx-auto block h-1.5 w-11 rounded-full bg-silver-300 md:hidden"
            aria-hidden
          />
          <Bow variant="silver" className="mx-auto mt-2.5 w-11" />
          {icon ? <div className="mx-auto mt-1 flex justify-center text-royal-800">{icon}</div> : null}
          <h3
            id={titleId}
            className="mt-2 font-serif text-[14px] sm:text-[15px] font-semibold tracking-[0.26em] text-slate-800"
          >
            {title}
          </h3>
          {subtitle ? (
            <p
              id={subtitleId}
              className="mt-1.5 font-sans text-[10.5px] font-medium tracking-[0.16em] text-slate-500 uppercase"
            >
              {subtitle}
            </p>
          ) : null}
          <span className="hairline-silver mx-auto mt-4 block h-px w-44" aria-hidden />

          <button
            type="button"
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Fechar janela"
            className="absolute top-4 right-4 grid size-9 cursor-pointer place-items-center rounded-full border border-silver-300 bg-white/90 text-slate-500 transition hover:border-royal-700 hover:text-royal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-700/40 active:scale-90"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="relative overflow-y-auto overscroll-contain px-6 sm:px-8 pb-[max(28px,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/** Modal / Bottom-sheet responsivo com arraste para fechar, foco acessível e trava de scroll. */
export default function Sheet({ open, ...props }: SheetProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>{open ? <SheetPanel key="sheet" {...props} /> : null}</AnimatePresence>,
    document.body,
  );
}
