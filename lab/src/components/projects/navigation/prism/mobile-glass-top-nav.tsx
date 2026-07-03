"use client";

import { Figtree } from "next/font/google";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useCallback, useEffect, useId, useRef } from "react";
import { PrismLogo, ProfileIcon } from "./brand-icons";
import {
  BRAND_NAME,
  CATEGORY_ITEMS,
  PROFILE_ITEM,
  type NavItemId,
} from "./constants";
import type { PrismNavPlacement } from "./constants";
import { useBodyScrollLock } from "./use-body-scroll-lock";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-figtree",
});

type MobileGlassTopNavProps = {
  activeId: NavItemId | null;
  onNavigate: (id: NavItemId) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  forceReducedMotion?: boolean;
  className?: string;
  idPrefix?: string;
  placement?: PrismNavPlacement;
};

function MenuIcon({ open, reduced }: { open: boolean; reduced: boolean }) {
  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="relative h-5 w-5" aria-hidden>
      <motion.span
        className="absolute left-0 top-[3px] block h-[2px] w-5 rounded-full bg-white"
        animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        transition={transition}
      />
      <motion.span
        className="absolute left-0 top-[9px] block h-[2px] w-5 rounded-full bg-white"
        animate={open ? { opacity: 0, scaleX: 0.5 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: reduced ? 0 : 0.16 }}
      />
      <motion.span
        className="absolute left-0 top-[15px] block h-[2px] w-5 rounded-full bg-white"
        animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={transition}
      />
    </div>
  );
}

export function MobileGlassTopNav({
  activeId,
  onNavigate,
  isOpen,
  onOpenChange,
  forceReducedMotion,
  className,
  idPrefix,
  placement = "fixed-top",
}: MobileGlassTopNavProps) {
  const panelId = useId();
  const prefersReduced = useReducedMotion();
  const reduced = forceReducedMotion ?? prefersReduced ?? false;
  const isInline = placement === "inline";
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useBodyScrollLock(isOpen);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const openMenu = useCallback(() => {
    wasOpenRef.current = true;
    onOpenChange(true);
  }, [onOpenChange]);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      close();
      return;
    }
    openMenu();
  }, [close, isOpen, openMenu]);

  const handleNavigate = useCallback(
    (id: NavItemId) => {
      onNavigate(id);
      close();
    },
    [close, onNavigate],
  );

  const restoreTriggerFocus = useCallback(() => {
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const handleExitComplete = useCallback(() => {
    if (!isOpen && wasOpenRef.current) {
      restoreTriggerFocus();
      wasOpenRef.current = false;
    }
  }, [isOpen, restoreTriggerFocus]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [close, isOpen]);

  const panelTransition = reduced
    ? { duration: 0 }
    : {
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      };

  const panelExitTransition = reduced
    ? { duration: 0 }
    : {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      };

  const linkStagger = reduced ? 0 : 0.04;
  const profileIsActive = activeId === "profile";
  const profileLabelTransition = reduced
    ? "transition-none"
    : "transition-colors duration-150";

  const shellClass = isInline
    ? "relative z-10 w-full max-w-md md:hidden"
    : "prism-mobile-fixed fixed inset-x-0 z-50 flex justify-center px-4 md:hidden";

  return (
    <>
      <AnimatePresence onExitComplete={handleExitComplete}>
        {isOpen ? (
          <motion.button
            key="prism-mobile-scrim"
            type="button"
            aria-label="Close menu overlay"
            className="prism-mobile-scrim fixed inset-0 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={panelExitTransition}
            onClick={close}
          />
        ) : null}
      </AnimatePresence>

      <div className={`${shellClass} ${className ?? ""}`}>
        <header
          className={`${figtree.className} prism-nav w-full max-w-md`}
          data-reduced-motion={reduced ? "true" : "false"}
        >
          <motion.div
            layout
            transition={panelExitTransition}
            data-open={isOpen ? "true" : "false"}
            className="prism-glass-bar prism-mobile-shell w-full overflow-hidden"
          >
            <div className="relative z-10 flex h-[var(--prism-nav-height-mobile)] items-center justify-between px-4">
              <motion.button
                type="button"
                onClick={() => handleNavigate("home")}
                whileTap={reduced ? undefined : { scale: 0.97 }}
                transition={{
                  duration: reduced ? 0 : 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex min-h-11 items-center gap-2.5 rounded-[var(--prism-radius-pill)] px-1 py-1 text-[var(--prism-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--prism-selector-from)]"
                aria-label={`${BRAND_NAME} home`}
              >
                <PrismLogo className="h-7 w-7 shrink-0" />
                <span className="prism-brand-word text-[17px] font-medium tracking-[0.02em]">
                  {BRAND_NAME}
                </span>
              </motion.button>

              <button
                ref={triggerRef}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                onClick={toggleMenu}
                className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--prism-selector-from)]"
              >
                <MenuIcon open={isOpen} reduced={reduced} />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="prism-mobile-menu"
                  id={panelId}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Navigation menu"
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={panelTransition}
                  className="overflow-hidden"
                >
                  <nav
                    className="relative z-10 flex flex-col gap-1 border-t border-[var(--prism-glass-border)] px-3 pb-4 pt-3"
                    aria-label="Primary mobile"
                  >
                    {CATEGORY_ITEMS.map((item, index) => {
                      const isActive = item.id === activeId;
                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          role="tab"
                          id={
                            idPrefix ? `${idPrefix}-tab-${item.id}` : undefined
                          }
                          aria-selected={isActive}
                          aria-controls={
                            idPrefix
                              ? `${idPrefix}-panel-${item.id}`
                              : undefined
                          }
                          initial={reduced ? false : { opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * linkStagger,
                            duration: reduced ? 0 : 0.26,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          whileTap={reduced ? undefined : { scale: 0.97 }}
                          onClick={() => handleNavigate(item.id)}
                          className={`prism-nav-link relative z-10 flex min-h-12 items-center rounded-[var(--prism-radius-pill)] px-4 text-left text-[17px] font-medium leading-[26px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--prism-selector-from)] ${
                            isActive
                              ? "prism-selector-pill text-[var(--prism-text-active)]"
                              : "text-[var(--prism-text-muted)]"
                          }`}
                        >
                          {item.label}
                        </motion.button>
                      );
                    })}

                    <motion.div
                      className="mt-2 border-t border-[var(--prism-glass-border)] pt-2"
                      initial={reduced ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: CATEGORY_ITEMS.length * linkStagger + 0.04,
                        duration: reduced ? 0 : 0.24,
                      }}
                    >
                      <motion.button
                        type="button"
                        role="tab"
                        id={idPrefix ? `${idPrefix}-tab-profile` : undefined}
                        aria-selected={profileIsActive}
                        aria-controls={
                          idPrefix ? `${idPrefix}-panel-profile` : undefined
                        }
                        initial={reduced ? false : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: CATEGORY_ITEMS.length * linkStagger,
                          duration: reduced ? 0 : 0.26,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileTap={reduced ? undefined : { scale: 0.97 }}
                        onClick={() => handleNavigate("profile")}
                        className={`prism-profile-btn relative z-10 flex min-h-12 w-full items-center gap-2.5 rounded-[var(--prism-radius-pill)] px-4 py-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--prism-selector-from)] ${
                          profileIsActive
                            ? "prism-selector-pill"
                            : "prism-profile-glass"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${profileLabelTransition} ${
                            profileIsActive
                              ? "bg-black/10 text-[var(--prism-text-active)]"
                              : "bg-[var(--prism-profile-icon-glass)] text-white"
                          }`}
                        >
                          <ProfileIcon className="h-4 w-4" />
                        </span>
                        <span
                          className={`text-[17px] font-medium leading-[26px] ${profileLabelTransition} ${
                            profileIsActive
                              ? "text-[var(--prism-text-active)]"
                              : "text-white"
                          }`}
                        >
                          {PROFILE_ITEM.label}
                        </span>
                      </motion.button>
                    </motion.div>
                  </nav>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </header>
      </div>
    </>
  );
}
