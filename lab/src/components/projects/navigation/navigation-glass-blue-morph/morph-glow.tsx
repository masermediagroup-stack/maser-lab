"use client";

import { motion, useReducedMotion } from "framer-motion";

export type GlowRect = {
  left: number;
  width: number;
  height: number;
};

type MorphGlowProps = {
  rect: GlowRect;
  forceReducedMotion?: boolean;
};

export function MorphGlow({ rect, forceReducedMotion }: MorphGlowProps) {
  const prefersReduced = useReducedMotion();
  const reduced = forceReducedMotion ?? prefersReduced ?? false;

  return (
    <motion.div
      className="pointer-events-none absolute top-1/2 -translate-y-1/2 overflow-visible"
      aria-hidden
      animate={{
        left: rect.left,
        width: rect.width,
        height: Math.max(rect.height, 44),
      }}
      transition={
        reduced
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 320,
              damping: 28,
              mass: 0.9,
            }
      }
      style={{
        borderRadius: "var(--prism-radius-pill)",
      }}
    >
      <div
        className="absolute inset-0 scale-110"
        style={{
          borderRadius: "inherit",
          background:
            "radial-gradient(ellipse 80% 100% at 50% 50%, var(--prism-blue-mid) 0%, var(--prism-blue-deep) 45%, var(--prism-blue-navy) 100%)",
          opacity: "var(--prism-glow-opacity)",
          filter: "blur(28px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          borderRadius: "inherit",
          background:
            "linear-gradient(135deg, rgba(56, 189, 248, 0.35) 0%, rgba(29, 78, 216, 0.25) 100%)",
          filter: "blur(12px)",
        }}
      />
    </motion.div>
  );
}
