"use client";

import { User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { AnimatedText } from "./animated-text";

type SignInTabLabelProps = {
  active?: boolean;
  reduced?: boolean;
  hovered?: boolean;
  reveal?: boolean;
  revealDelay?: number;
  /** Mobile: icon always visible before label. */
  layout?: "desktop" | "mobile";
};

export function SignInTabLabel({
  active = false,
  reduced = false,
  hovered = false,
  reveal = false,
  revealDelay = 0,
  layout = "desktop",
}: SignInTabLabelProps) {
  const prefersReduced = useReducedMotion();
  const motionReduced = reduced || (prefersReduced ?? false);
  const [pointerFine, setPointerFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setPointerFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const showIconOnly = layout === "desktop" && hovered && pointerFine;
  const duration = motionReduced ? 0 : 0.15;

  if (layout === "mobile") {
    return (
      <span className="inline-flex items-center justify-center gap-2.5">
        <User size={18} strokeWidth={2} aria-hidden className="shrink-0" />
        <AnimatedText active={active} reveal={reveal} revealDelay={revealDelay}>
          Sign in
        </AnimatedText>
      </span>
    );
  }

  return (
    <span className="relative inline-flex h-5 min-w-[4.5rem] items-center justify-center">
      <motion.span
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: showIconOnly ? 0 : 1, scale: showIconOnly ? 0.92 : 1 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={showIconOnly}
      >
        <AnimatedText active={active} reveal={reveal} revealDelay={revealDelay}>
          Sign in
        </AnimatedText>
      </motion.span>
      <motion.span
        className="absolute inset-0 flex items-center justify-center"
        animate={{ opacity: showIconOnly ? 1 : 0, scale: showIconOnly ? 1 : 0.92 }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={!showIconOnly}
      >
        <User size={16} strokeWidth={2} aria-hidden />
      </motion.span>
    </span>
  );
}
