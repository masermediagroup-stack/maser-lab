"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type AnimatedTextProps = {
  children: ReactNode;
  variant?: "label" | "heading" | "body";
  reveal?: boolean;
  revealDelay?: number;
  className?: string;
  /** When true, label uses active tab text color. */
  active?: boolean;
};

const ACTIVE_TEXT_COLOR = "var(--pl-tab-active-text)";

const variantClass: Record<NonNullable<AnimatedTextProps["variant"]>, string> =
  {
    label: "inline-block",
    heading: "inline-block tracking-tight",
    body: "inline-block",
  };

export function AnimatedText({
  children,
  variant = "label",
  reveal = false,
  revealDelay = 0,
  className = "",
  active = false,
}: AnimatedTextProps) {
  const reduced = useReducedMotion() ?? false;
  const baseClass = `${variantClass[variant]} ${className}`;

  const content = (
    <span
      className={baseClass}
      style={active ? { color: ACTIVE_TEXT_COLOR } : undefined}
    >
      {children}
    </span>
  );

  if (!reveal) {
    return content;
  }

  return (
    <motion.span
      className={baseClass}
      style={active ? { color: ACTIVE_TEXT_COLOR } : undefined}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0 : 0.35,
        delay: revealDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.span>
  );
}
