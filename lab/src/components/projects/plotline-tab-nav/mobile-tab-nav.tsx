"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useId, useRef } from "react";
import { AnimatedText } from "./animated-text";
import { NAV_ITEMS, BRAND_NAME, type NavItemId } from "./constants";
import { PlotlineLogo } from "./plotline-logo";
import { useBodyScrollLock } from "./use-body-scroll-lock";

type MobileTabNavProps = {
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  forceReducedMotion?: boolean;
};

function MenuIcon({ open }: { open: boolean }) {
  return (
    <div className="relative h-5 w-5" aria-hidden>
      <motion.span
        className="absolute left-0 top-[3px] block h-[2px] w-5 rounded-full bg-[var(--pl-text)]"
        animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.span
        className="absolute left-0 top-[9px] block h-[2px] w-5 rounded-full bg-[var(--pl-text)]"
        animate={open ? { opacity: 0, scaleX: 0.5 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.16 }}
      />
      <motion.span
        className="absolute left-0 top-[15px] block h-[2px] w-5 rounded-full bg-[var(--pl-text)]"
        animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function MobileTabNav({
  activeId,
  onNavigate,
  isOpen,
  onOpenChange,
  forceReducedMotion,
}: MobileTabNavProps) {
  const panelId = useId();
  const prefersReduced = useReducedMotion();
  const reduced = forceReducedMotion ?? prefersReduced ?? false;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(isOpen);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const handleNavigate = useCallback(
    (id: NavItemId) => {
      onNavigate(id);
      close();
    },
    [close, onNavigate],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [close, isOpen]);

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  const panelTransition = reduced
    ? { duration: 0 }
    : {
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      };

  const linkStagger = reduced ? 0 : 0.045;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 md:hidden">
        <motion.div
          className="plotline-glass relative flex w-full max-w-md items-center justify-between px-4 py-3"
          style={{
            borderBottomLeftRadius: "var(--pl-radius-tab)",
            borderBottomRightRadius: "var(--pl-radius-tab)",
            borderTopLeftRadius: "18px",
            borderTopRightRadius: "18px",
          }}
          layout
        >
          <button
            type="button"
            onClick={() => handleNavigate("features")}
            className="flex items-center gap-2.5"
            aria-label={`${BRAND_NAME} home`}
          >
            <PlotlineLogo size={30} />
            <AnimatedText variant="heading" className="text-[15px] font-semibold text-[var(--pl-text)]">
              {BRAND_NAME}
            </AnimatedText>
          </button>

          <button
            ref={triggerRef}
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            onClick={() => onOpenChange(!isOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pl-pink-light)]"
          >
            <MenuIcon open={isOpen} />
          </button>
        </motion.div>
      </header>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              className="fixed inset-0 z-40 bg-[var(--pl-scrim)] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.22 }}
              onClick={close}
            />

            <motion.div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="plotline-glass-strong fixed inset-x-3 top-[4.25rem] z-50 overflow-hidden md:hidden"
              style={{
                borderRadius: "var(--pl-radius-panel)",
                transformOrigin: "top center",
              }}
              initial={
                reduced
                  ? { opacity: 1, scaleY: 1, y: 0 }
                  : { opacity: 0, scaleY: 0.88, y: -12 }
              }
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              exit={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, scaleY: 0.94, y: -8 }
              }
              transition={panelTransition}
            >
              {/* Concave tab hinge */}
              <svg
                className="pointer-events-none absolute -top-[18px] left-1/2 h-[20px] w-[120px] -translate-x-1/2 text-[var(--pl-glass-bg-strong)]"
                viewBox="0 0 120 20"
                aria-hidden
              >
                <path
                  d="M0 20 Q60 0 120 20 L120 20 L0 20 Z"
                  fill="currentColor"
                />
              </svg>

              <nav className="flex flex-col gap-1 px-4 pb-6 pt-5" aria-label="Primary mobile">
                {NAV_ITEMS.map((item, index) => {
                  const isActive = item.id === activeId;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      initial={
                        reduced ? false : { opacity: 0, x: -12 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduced ? undefined : { opacity: 0, x: -8 }}
                      transition={{
                        delay: index * linkStagger,
                        duration: 0.28,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={() => handleNavigate(item.id)}
                      aria-current={isActive ? "page" : undefined}
                      className="flex min-h-12 items-center rounded-2xl px-3 text-left text-lg font-medium transition-colors hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pl-pink-light)]"
                    >
                      <AnimatedText
                        reveal={isOpen}
                        revealDelay={index * linkStagger}
                        className={
                          isActive
                            ? "text-[var(--pl-pink-light)]"
                            : "text-[var(--pl-text)]"
                        }
                      >
                        {item.label}
                      </AnimatedText>
                    </motion.button>
                  );
                })}

                <motion.div
                  className="mt-4 flex flex-col gap-2 border-t border-[var(--pl-glass-border)] pt-4"
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_ITEMS.length * linkStagger + 0.05 }}
                >
                  <button
                    type="button"
                    className="min-h-12 rounded-2xl px-3 text-left text-base text-[var(--pl-text-muted)]"
                  >
                    <AnimatedText>Sign in</AnimatedText>
                  </button>
                  <motion.button
                    type="button"
                    whileTap={reduced ? undefined : { scale: 0.98 }}
                    className="min-h-12 rounded-2xl bg-[var(--pl-pink-dark)] px-4 text-base font-semibold text-[var(--pl-pink-light)]"
                  >
                    <AnimatedText>Start free</AnimatedText>
                  </motion.button>
                </motion.div>
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
