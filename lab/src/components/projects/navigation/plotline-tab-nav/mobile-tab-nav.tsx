"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatedText } from "./animated-text";
import { CENTER_NAV_ITEMS, BRAND_NAME, SIGN_IN_ITEM, type NavItemId } from "./constants";
import { PlotlineLogo } from "./plotline-logo";
import { MagneticTabButton } from "./magnetic-tab-button";
import { SignInTabLabel } from "./sign-in-tab-label";
import { useBodyScrollLock } from "./use-body-scroll-lock";
import type { PlotlineTabNavPlacement } from "./tab-nav";

type MobileTabNavProps = {
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  startFreeActive?: boolean;
  onStartFree?: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  forceReducedMotion?: boolean;
  idPrefix?: string;
  placement?: PlotlineTabNavPlacement;
};

function MenuIcon({ open, reduced }: { open: boolean; reduced: boolean }) {
  const barTransition = reduced
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.23, 1, 0.32, 1] as const };

  return (
    <div className="relative h-5 w-5" aria-hidden>
      <motion.span
        className="absolute left-0 top-[3px] block h-[2px] w-5 rounded-full bg-[var(--pl-text)]"
        animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        transition={barTransition}
      />
      <motion.span
        className="absolute left-0 top-[9px] block h-[2px] w-5 rounded-full bg-[var(--pl-text)]"
        animate={open ? { opacity: 0, scaleX: 0.5 } : { opacity: 1, scaleX: 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.16 }}
      />
      <motion.span
        className="absolute left-0 top-[15px] block h-[2px] w-5 rounded-full bg-[var(--pl-text)]"
        animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={barTransition}
      />
    </div>
  );
}

function MobileNavTabItem({
  item,
  index,
  isActive,
  reduced,
  linkStagger,
  isOpen,
  idPrefix,
  onNavigate,
}: {
  item: (typeof CENTER_NAV_ITEMS)[number];
  index: number;
  isActive: boolean;
  reduced: boolean;
  linkStagger: number;
  isOpen: boolean;
  idPrefix?: string;
  onNavigate: (id: NavItemId) => void;
}) {
  return (
    <MagneticTabButton
      reduced={reduced}
      type="button"
      initial={reduced ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? undefined : { opacity: 0, x: -8 }}
      transition={{
        delay: index * linkStagger,
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      onClick={() => onNavigate(item.id)}
      id={idPrefix ? `${idPrefix}-tab-${item.id}` : undefined}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-12 items-center rounded-2xl px-3 text-left text-lg font-medium transition-colors hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pl-pink-light)] ${
        isActive
          ? "text-[var(--pl-tab-active-text)]"
          : "text-[var(--pl-text)]"
      }`}
    >
      <AnimatedText
        reveal={isOpen}
        revealDelay={index * linkStagger}
        active={isActive}
      >
        {item.label}
      </AnimatedText>
    </MagneticTabButton>
  );
}

function MobileSignInTabItem({
  index,
  isActive,
  reduced,
  linkStagger,
  isOpen,
  idPrefix,
  onNavigate,
}: {
  index: number;
  isActive: boolean;
  reduced: boolean;
  linkStagger: number;
  isOpen: boolean;
  idPrefix?: string;
  onNavigate: (id: NavItemId) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <MagneticTabButton
      reduced={reduced}
      type="button"
      initial={reduced ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? undefined : { opacity: 0, x: -8 }}
      transition={{
        delay: index * linkStagger,
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      onClick={() => onNavigate(SIGN_IN_ITEM.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      id={idPrefix ? `${idPrefix}-tab-${SIGN_IN_ITEM.id}` : undefined}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-12 items-center rounded-2xl px-3 text-left text-lg font-medium transition-colors hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pl-pink-light)] ${
        isActive
          ? "text-[var(--pl-tab-active-text)]"
          : "text-[var(--pl-text)]"
      }`}
    >
      <SignInTabLabel
        active={isActive}
        reduced={reduced}
        hovered={hovered}
        reveal={isOpen}
        revealDelay={index * linkStagger}
        layout="mobile"
      />
    </MagneticTabButton>
  );
}

export function MobileTabNav({
  activeId,
  onNavigate,
  startFreeActive = false,
  onStartFree,
  isOpen,
  onOpenChange,
  forceReducedMotion,
  idPrefix,
  placement = "fixed-top",
}: MobileTabNavProps) {
  const panelId = useId();
  const prefersReduced = useReducedMotion();
  const reduced = forceReducedMotion ?? prefersReduced ?? false;
  const visualActiveId = startFreeActive ? null : activeId;
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

  const handleStartFree = useCallback(() => {
    onStartFree?.();
    close();
  }, [close, onStartFree]);

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

  const isAnchored = placement === "fixed-top";
  const headerClass = isAnchored
    ? "fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 md:hidden"
    : "relative z-10 flex w-full justify-center px-4 md:hidden";

  const panelClass = isAnchored
    ? "plotline-glass-strong fixed inset-x-3 top-[4.25rem] z-50 overflow-hidden md:hidden"
    : "plotline-glass-strong absolute inset-x-0 top-full z-50 mt-2 overflow-hidden md:hidden";

  return (
    <div className={isAnchored ? undefined : "relative w-full max-w-md"}>
      <header className={headerClass}>
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
            className="plotline-brand flex items-center gap-2.5 rounded-xl px-1 py-1"
            aria-label={`${BRAND_NAME} home`}
          >
            <PlotlineLogo size={30} className="plotline-brand-logomark" />
            <AnimatedText
              variant="heading"
              className="plotline-brand-label text-[15px] font-semibold text-[var(--pl-text)]"
            >
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
            <MenuIcon open={isOpen} reduced={reduced} />
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
              className={panelClass}
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
                {CENTER_NAV_ITEMS.map((item, index) => (
                  <MobileNavTabItem
                    key={item.id}
                    item={item}
                    index={index}
                    isActive={item.id === visualActiveId}
                    reduced={reduced}
                    linkStagger={linkStagger}
                    isOpen={isOpen}
                    idPrefix={idPrefix}
                    onNavigate={handleNavigate}
                  />
                ))}

                <MobileSignInTabItem
                  index={CENTER_NAV_ITEMS.length}
                  isActive={visualActiveId === SIGN_IN_ITEM.id}
                  reduced={reduced}
                  linkStagger={linkStagger}
                  isOpen={isOpen}
                  idPrefix={idPrefix}
                  onNavigate={handleNavigate}
                />

                <motion.div
                  className="mt-4 flex flex-col gap-2 border-t border-[var(--pl-glass-border)] pt-4"
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: (CENTER_NAV_ITEMS.length + 1) * linkStagger + 0.05,
                  }}
                >
                  <motion.button
                    type="button"
                    onClick={handleStartFree}
                    aria-pressed={startFreeActive}
                    whileTap={reduced ? undefined : { scale: 0.98 }}
                    className={`min-h-12 rounded-2xl px-4 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pl-pink-light)] ${
                      startFreeActive
                        ? "plotline-start-free--active"
                        : "bg-[var(--pl-pink-dark)] text-[var(--pl-pink-light)]"
                    }`}
                  >
                    <AnimatedText
                      className={
                        startFreeActive ? "text-[var(--pl-pink-dark)]" : undefined
                      }
                    >
                      Start free
                    </AnimatedText>
                  </motion.button>
                </motion.div>
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
