"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedText } from "./animated-text";
import { NAV_ITEMS, type NavItemId } from "./constants";
import { PlotlineLogo } from "./plotline-logo";

type BubbleRect = {
  left: number;
  width: number;
  height: number;
};

type DesktopTabNavProps = {
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  forceReducedMotion?: boolean;
};

export function DesktopTabNav({
  activeId,
  onNavigate,
  forceReducedMotion,
}: DesktopTabNavProps) {
  const prefersReduced = useReducedMotion();
  const reduced = forceReducedMotion ?? prefersReduced ?? false;
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Partial<Record<NavItemId, HTMLButtonElement>>>({});
  const [bubble, setBubble] = useState<BubbleRect>({
    left: 0,
    width: 0,
    height: 36,
  });
  const [hoveredId, setHoveredId] = useState<NavItemId | null>(null);

  const measureBubble = useCallback((id: NavItemId) => {
    const nav = navRef.current;
    const link = linkRefs.current[id];
    if (!nav || !link) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    setBubble({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      height: linkRect.height,
    });
  }, []);

  useEffect(() => {
    measureBubble(activeId);
  }, [activeId, measureBubble]);

  useEffect(() => {
    const handleResize = () => measureBubble(hoveredId ?? activeId);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeId, hoveredId, measureBubble]);

  const bubbleTarget = hoveredId ?? activeId;

  useEffect(() => {
    measureBubble(bubbleTarget);
  }, [bubbleTarget, measureBubble]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden justify-center px-6 pt-5 md:flex">
      <div
        className="plotline-glass flex w-full max-w-5xl items-center gap-4 rounded-[var(--pl-radius-tab)] px-4 py-2.5 md:px-5"
        style={{ borderBottomLeftRadius: "var(--pl-radius-tab)", borderBottomRightRadius: "var(--pl-radius-tab)" }}
      >
        <button
          type="button"
          onClick={() => onNavigate("features")}
          className="flex shrink-0 items-center gap-2.5 rounded-xl px-1 py-1 transition-opacity hover:opacity-90"
          aria-label="Plotline home"
        >
          <PlotlineLogo size={32} />
          <AnimatedText variant="heading" className="text-base font-semibold text-[var(--pl-text)]">
            Plotline
          </AnimatedText>
        </button>

        <nav
          ref={navRef}
          className="relative mx-auto hidden items-center md:flex"
          aria-label="Primary"
        >
          <motion.div
            className="plotline-glass-strong pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-[var(--pl-radius-bubble)] border border-[var(--pl-glass-border)]"
            animate={{
              left: bubble.left,
              width: bubble.width,
              height: bubble.height,
            }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 420,
                    damping: 32,
                    mass: 0.8,
                  }
            }
            style={{
              boxShadow:
                "0 0 24px rgba(155, 27, 92, 0.35), inset 0 1px 0 rgba(245, 184, 212, 0.12)",
            }}
            aria-hidden
          />

          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                ref={(node) => {
                  linkRefs.current[item.id] = node ?? undefined;
                }}
                type="button"
                onClick={() => onNavigate(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(item.id)}
                onBlur={() => setHoveredId(null)}
                aria-current={isActive ? "page" : undefined}
                className="relative z-10 px-4 py-2 text-sm font-medium text-[var(--pl-text-muted)] transition-colors hover:text-[var(--pl-pink-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pl-pink-light)]"
              >
                <AnimatedText
                  className={
                    isActive
                      ? "text-[var(--pl-pink-light)]"
                      : "text-[var(--pl-text-muted)]"
                  }
                >
                  {item.label}
                </AnimatedText>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-medium text-[var(--pl-text-muted)] transition-colors hover:text-[var(--pl-pink-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pl-pink-light)]"
          >
            <AnimatedText>Sign in</AnimatedText>
          </button>
          <motion.button
            type="button"
            whileHover={reduced ? undefined : { scale: 1.03, y: -1 }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-full bg-[var(--pl-pink-dark)] px-5 py-2 text-sm font-semibold text-[var(--pl-pink-light)] shadow-[0_8px_24px_rgba(155,27,92,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pl-pink-light)]"
          >
            <AnimatedText>Start free</AnimatedText>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
