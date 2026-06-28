"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type AnimatedTextProps = {
  children: ReactNode;
  variant?: "label" | "heading" | "body";
  reveal?: boolean;
  revealDelay?: number;
  className?: string;
};

const variantClass: Record<NonNullable<AnimatedTextProps["variant"]>, string> =
  {
    label: "inline-block",
    heading: "inline-block tracking-tight",
    body: "inline-block",
  };

function AnimatedString({
  text,
  className,
  reduced,
}: {
  text: string;
  className: string;
  reduced: boolean;
}) {
  return (
    <motion.span className={`inline-flex ${className}`}>
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          className="inline-block"
          whileHover={
            reduced
              ? undefined
              : {
                  y: -3,
                  color: "var(--pl-pink-light)",
                  transition: {
                    delay: index * 0.015,
                    duration: 0.12,
                  },
                }
          }
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export function AnimatedText({
  children,
  variant = "label",
  reveal = false,
  revealDelay = 0,
  className = "",
}: AnimatedTextProps) {
  const reduced = useReducedMotion() ?? false;
  const baseClass = `${variantClass[variant]} ${className}`;

  if (typeof children !== "string") {
    return (
      <motion.span
        className={baseClass}
        whileHover={
          reduced ? undefined : { y: -1, color: "var(--pl-pink-light)" }
        }
        transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    );
  }

  const content = (
    <AnimatedString text={children} className={baseClass} reduced={reduced} />
  );

  if (!reveal) {
    return (
      <motion.span
        className={baseClass}
        whileHover={
          reduced ? undefined : { y: variant === "heading" ? -2 : -1 }
        }
        transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      >
        {content}
      </motion.span>
    );
  }

  return (
    <motion.span
      className={baseClass}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0 : 0.35,
        delay: revealDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {content}
    </motion.span>
  );
}
