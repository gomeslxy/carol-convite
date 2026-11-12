"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface BaseProps {
  icon: LucideIcon;
  children: ReactNode;
  tone?: "royal" | "light";
  className?: string;
}

type SheetButtonProps =
  | (BaseProps & { href: string; onClick?: never; type?: never })
  | (BaseProps & { href?: never; onClick?: () => void; type?: "button" | "submit" });

const tones = {
  royal:
    "bg-imperial text-white shadow-[0_10px_24px_-10px_rgba(23,37,84,0.7)] ring-1 ring-inset ring-white/20",
  light: "bg-white/85 text-royal-900 ring-1 ring-inset ring-silver-300 shadow-[0_6px_18px_-10px_rgba(15,23,42,0.25)]",
};

/** Botão secundário usado dentro dos bottom-sheets (link externo ou ação). */
export default function SheetButton({ icon: Icon, children, tone = "light", className = "", ...rest }: SheetButtonProps) {
  const cls = `flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-sans text-[13px] font-semibold tracking-wide transition-colors ${tones[tone]} ${className}`;
  const content = (
    <>
      <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
      <span>{children}</span>
    </>
  );

  if ("href" in rest && rest.href) {
    return (
      <motion.a whileTap={{ scale: 0.96 }} href={rest.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button whileTap={{ scale: 0.96 }} type={rest.type ?? "button"} onClick={rest.onClick} className={cls}>
      {content}
    </motion.button>
  );
}

