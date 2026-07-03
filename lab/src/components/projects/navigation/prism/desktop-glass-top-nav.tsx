"use client";

import { Figtree } from "next/font/google";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PrismLogo, ProfileIcon } from "./brand-icons";
import {
  BRAND_NAME,
  CATEGORY_ITEMS,
  PROFILE_ITEM,
  isCategoryId,
  type CategoryItem,
  type CategoryId,
  type NavItemId,
} from "./constants";
import type { PrismNavPlacement } from "./constants";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-figtree",
});

type SelectorRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type MotionChannel = "pointer" | "keyboard";

type DropdownRect = {
  left: number;
  top: number;
};

type DropdownId = Extract<CategoryId, "explore" | "library">;

type DesktopGlassTopNavProps = {
  activeId: NavItemId | null;
  onNavigate: (id: NavItemId) => void;
  forceReducedMotion?: boolean;
  className?: string;
  idPrefix?: string;
  placement?: PrismNavPlacement;
};

const LIQUID_SPRING: Transition = {
  type: "spring",
  duration: 0.42,
  bounce: 0.2,
};

const INSTANT: Transition = { duration: 0 };

const PILL_MOTION_BLUR_PX = 6;

const PILL_MOTION_BLUR_FILTER: Transition = {
  duration: 0.42,
  times: [0, 0.28, 1],
  ease: [0.22, 1, 0.36, 1],
};

const DROPDOWN_WIDTH = 240;
const DROPDOWN_GAP = 20;
const DROPDOWN_CLOSE_DELAY_MS = 140;
const ENTRANCE_EASE = [0.16, 1, 0.3, 1] as const;

const navShellEnter = (reduced: boolean): Variants => ({
  hidden: reduced
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: 12,
        filter: "blur(8px)",
      },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: reduced
      ? { duration: 0.12, ease: ENTRANCE_EASE }
      : {
          duration: 0.56,
          ease: ENTRANCE_EASE,
        },
  },
});

const logoEnter = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: reduced ? 0.12 : 0.34,
      ease: ENTRANCE_EASE,
      delay: reduced ? 0 : 0.1,
    },
  },
});

const navItemEnter = (reduced: boolean, index: number): Variants => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: reduced ? 0.12 : 0.3,
      ease: ENTRANCE_EASE,
      delay: reduced ? 0 : 0.22 + index * 0.07,
    },
  },
});

const activePillEnter = (reduced: boolean): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: reduced ? 0.08 : 0.2,
      ease: ENTRANCE_EASE,
    },
  },
});

const profileEnter = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, x: 8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: reduced ? 0.12 : 0.34,
      ease: ENTRANCE_EASE,
      delay: reduced ? 0 : 0.68,
    },
  },
});

function pillMotionBlurFilter(active: boolean): string | string[] {
  return active
    ? [`blur(0px)`, `blur(${PILL_MOTION_BLUR_PX}px)`, `blur(0px)`]
    : "blur(0px)";
}

const tapTransition = (reduced: boolean): Transition =>
  reduced
    ? { duration: 0 }
    : {
        type: "tween",
        duration: 0.12,
        ease: [0.22, 1, 0.36, 1],
      };

function pillTransition(reduced: boolean, channel: MotionChannel): Transition {
  if (reduced || channel === "keyboard") return INSTANT;
  return LIQUID_SPRING;
}

export function DesktopGlassTopNav({
  activeId,
  onNavigate,
  forceReducedMotion,
  className,
  idPrefix,
  placement = "fixed-top",
}: DesktopGlassTopNavProps) {
  const prefersReduced = useReducedMotion();
  const reduced = forceReducedMotion ?? prefersReduced ?? false;

  const linksRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Partial<Record<CategoryId, HTMLButtonElement>>>(
    {},
  );
  const prevCategoryRef = useRef<CategoryId | null>(null);
  const isFirstMeasureRef = useRef(true);
  const syncFrameRef = useRef<number | null>(null);
  const syncSecondFrameRef = useRef<number | null>(null);
  const [pillSize, setPillSize] = useState({ width: 96, height: 48 });
  const [motionChannel, setMotionChannel] = useState<MotionChannel>("pointer");
  const [pillAnimates, setPillAnimates] = useState(false);
  const [selectorLayoutReady, setSelectorLayoutReady] = useState(false);
  const closeDropdownTimeoutRef = useRef<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<DropdownId | null>(null);
  const [dropdownRect, setDropdownRect] = useState<DropdownRect>({
    left: 0,
    top: 0,
  });

  const [selector, setSelector] = useState<SelectorRect>({
    left: 0,
    top: 0,
    width: 0,
    height: 48,
  });

  const showCategorySelector = isCategoryId(activeId);
  const profileIsActive = activeId === "profile";

  const cancelDropdownClose = useCallback(() => {
    if (closeDropdownTimeoutRef.current !== null) {
      window.clearTimeout(closeDropdownTimeoutRef.current);
      closeDropdownTimeoutRef.current = null;
    }
  }, []);

  const closeDropdown = useCallback(() => {
    cancelDropdownClose();
    setOpenDropdownId(null);
  }, [cancelDropdownClose]);

  const scheduleDropdownClose = useCallback(() => {
    cancelDropdownClose();
    closeDropdownTimeoutRef.current = window.setTimeout(() => {
      setOpenDropdownId(null);
      closeDropdownTimeoutRef.current = null;
    }, DROPDOWN_CLOSE_DELAY_MS);
  }, [cancelDropdownClose]);

  const updateDropdownRect = useCallback((button: HTMLButtonElement) => {
    const buttonRect = button.getBoundingClientRect();
    const viewportPadding = 12;
    const maxLeft = window.innerWidth - DROPDOWN_WIDTH - viewportPadding;
    const preferredLeft =
      buttonRect.left + buttonRect.width / 2 - DROPDOWN_WIDTH / 2;
    const left = Math.min(
      Math.max(viewportPadding, preferredLeft),
      Math.max(viewportPadding, maxLeft),
    );

    setDropdownRect({
      left,
      top: buttonRect.bottom + DROPDOWN_GAP,
    });
  }, []);

  const openDropdown = useCallback(
    (item: CategoryItem, button: HTMLButtonElement | null) => {
      if (!item.dropdownItems || item.id === "home" || item.id === "gallery") {
        closeDropdown();
        return;
      }

      cancelDropdownClose();
      if (button) updateDropdownRect(button);
      setOpenDropdownId(item.id as DropdownId);
    },
    [cancelDropdownClose, closeDropdown, updateDropdownRect],
  );

  const measureSelector = useCallback((id: CategoryId): boolean => {
    const container = linksRef.current;
    const button = categoryRefs.current[id];
    if (!container || !button) return false;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const width = buttonRect.width;
    const height = buttonRect.height;
    if (width <= 0 || height <= 0) return false;

    setPillSize({ width, height });

    setSelector({
      left: buttonRect.left - containerRect.left,
      top: buttonRect.top - containerRect.top,
      width,
      height,
    });
    return true;
  }, []);

  const syncActiveSelector = useCallback(() => {
    if (!showCategorySelector || !isCategoryId(activeId)) return;
    setPillAnimates(false);
    if (measureSelector(activeId)) {
      setSelectorLayoutReady(true);
    }
  }, [activeId, measureSelector, showCategorySelector]);

  const scheduleSelectorSync = useCallback(() => {
    if (syncFrameRef.current !== null) {
      window.cancelAnimationFrame(syncFrameRef.current);
    }
    if (syncSecondFrameRef.current !== null) {
      window.cancelAnimationFrame(syncSecondFrameRef.current);
    }

    syncFrameRef.current = window.requestAnimationFrame(() => {
      syncSecondFrameRef.current = window.requestAnimationFrame(() => {
        syncActiveSelector();
        syncFrameRef.current = null;
        syncSecondFrameRef.current = null;
      });
    });
  }, [syncActiveSelector]);

  const navigateCategory = useCallback(
    (id: CategoryId, channel: MotionChannel) => {
      setMotionChannel(channel);
      onNavigate(id);
    },
    [onNavigate],
  );

  useLayoutEffect(() => {
    if (!showCategorySelector || !isCategoryId(activeId)) return;

    const prev = prevCategoryRef.current;
    const categoryChanged = prev !== null && prev !== activeId;

    setPillAnimates(!isFirstMeasureRef.current && categoryChanged);
    isFirstMeasureRef.current = false;

    if (measureSelector(activeId)) {
      setSelectorLayoutReady(true);
    }
    prevCategoryRef.current = activeId;
  }, [activeId, measureSelector, showCategorySelector]);

  useLayoutEffect(() => {
    if (selectorLayoutReady && !reduced) return;
    scheduleSelectorSync();

    return () => {
      if (syncFrameRef.current !== null) {
        window.cancelAnimationFrame(syncFrameRef.current);
        syncFrameRef.current = null;
      }
      if (syncSecondFrameRef.current !== null) {
        window.cancelAnimationFrame(syncSecondFrameRef.current);
        syncSecondFrameRef.current = null;
      }
    };
  }, [reduced, scheduleSelectorSync, selectorLayoutReady]);

  useEffect(() => {
    const handleResize = () => {
      if (showCategorySelector && isCategoryId(activeId)) {
        setPillAnimates(false);
        measureSelector(activeId);
      }

      if (openDropdownId) {
        const button = categoryRefs.current[openDropdownId];
        if (button) updateDropdownRect(button);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    activeId,
    measureSelector,
    openDropdownId,
    showCategorySelector,
    updateDropdownRect,
  ]);

  useEffect(() => {
    if (!openDropdownId) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDropdown();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [closeDropdown, openDropdownId]);

  useEffect(() => {
    return () => cancelDropdownClose();
  }, [cancelDropdownClose]);

  const focusCategory = useCallback((id: CategoryId) => {
    categoryRefs.current[id]?.focus();
  }, []);

  const handleCategoryKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      let nextIndex = index;
      switch (event.key) {
        case "ArrowRight":
          nextIndex = (index + 1) % CATEGORY_ITEMS.length;
          break;
        case "ArrowLeft":
          nextIndex = (index - 1 + CATEGORY_ITEMS.length) % CATEGORY_ITEMS.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = CATEGORY_ITEMS.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      const next = CATEGORY_ITEMS[nextIndex];
      if (next) {
        navigateCategory(next.id, "keyboard");
        focusCategory(next.id);
      }
    },
    [focusCategory, navigateCategory],
  );

  const baseWidth = pillSize.width;
  const baseHeight = pillSize.height;
  const scaleX = selector.width > 0 ? selector.width / baseWidth : 1;
  const scaleY = selector.height > 0 ? selector.height / baseHeight : 1;

  const placementClass =
    placement === "inline"
      ? "relative hidden w-full px-4 md:block"
      : placement === "center"
        ? "relative z-10 mx-auto hidden w-full max-w-[var(--prism-nav-max-width)] px-4 md:flex md:justify-center"
        : "fixed inset-x-0 top-0 z-50 hidden justify-center px-6 pt-8 md:flex";

  const profileLabelTransition = reduced
    ? "transition-none"
    : "transition-colors duration-150";

  const shouldPillMotionBlur =
    pillAnimates && !reduced && motionChannel === "pointer";
  const pillSpring = pillTransition(reduced, motionChannel);
  const openDropdownItem = openDropdownId
    ? CATEGORY_ITEMS.find((item) => item.id === openDropdownId)
    : null;
  const dropdownMotion = reduced
    ? {
        initial: false as const,
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.08 },
      }
    : {
        initial: { opacity: 0, y: -4, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -4, scale: 0.98 },
        transition: {
          duration: 0.18,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      };

  return (
    <motion.header
      className={`${figtree.className} prism-nav ${placementClass} ${className ?? ""}`}
      data-reduced-motion={reduced ? "true" : "false"}
    >
      <motion.nav
        className="prism-glass-bar relative z-10 flex h-[var(--prism-nav-height)] w-full max-w-[var(--prism-nav-max-width)] items-center justify-between rounded-[var(--prism-radius-pill)] px-8"
        aria-label="Primary"
        variants={navShellEnter(reduced)}
        initial="hidden"
        animate="visible"
        onAnimationComplete={scheduleSelectorSync}
      >
        <motion.button
          type="button"
          onClick={() => onNavigate("home")}
          className="prism-brand relative z-10 shrink-0 rounded-[var(--prism-radius-pill)] px-1 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--prism-selector-from)]"
          aria-label={`${BRAND_NAME} home`}
          variants={logoEnter(reduced)}
        >
          <span className="prism-brand-mark inline-flex items-center gap-3.5 text-[var(--prism-text)]">
            <PrismLogo className="h-8 w-8 shrink-0" />
            <span className="text-[19px] font-medium tracking-[0.025em]">
              {BRAND_NAME}
            </span>
          </span>
        </motion.button>

        <div
          ref={linksRef}
          className="relative z-10 flex items-center gap-2"
          role="tablist"
          aria-orientation="horizontal"
        >
          {showCategorySelector && selector.width > 0 && selectorLayoutReady ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 rounded-[var(--prism-radius-pill)]"
              style={{
                width: baseWidth,
                height: baseHeight,
                transformOrigin: "left top",
              }}
              variants={activePillEnter(reduced)}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="h-full w-full rounded-[var(--prism-radius-pill)] prism-selector-pill"
                style={{
                  transformOrigin: "left top",
                }}
                initial={false}
                animate={{
                  x: selector.left,
                  y: selector.top,
                  scaleX,
                  scaleY,
                  filter: pillMotionBlurFilter(shouldPillMotionBlur),
                }}
                transition={
                  pillAnimates
                    ? {
                        x: pillSpring,
                        y: pillSpring,
                        scaleX: pillSpring,
                        scaleY: pillSpring,
                        filter: shouldPillMotionBlur
                          ? PILL_MOTION_BLUR_FILTER
                          : INSTANT,
                      }
                    : INSTANT
                }
              />
            </motion.div>
          ) : null}

          {CATEGORY_ITEMS.map((item, index) => {
            const isActive = item.id === activeId;
            return (
              <motion.button
                key={item.id}
                ref={(node) => {
                  categoryRefs.current[item.id] = node ?? undefined;
                }}
                type="button"
                role="tab"
                id={idPrefix ? `${idPrefix}-tab-${item.id}` : undefined}
                aria-selected={isActive}
                aria-controls={
                  idPrefix ? `${idPrefix}-panel-${item.id}` : undefined
                }
                tabIndex={isActive || activeId === null ? 0 : -1}
                onClick={() => navigateCategory(item.id, "pointer")}
                onMouseEnter={(event) => openDropdown(item, event.currentTarget)}
                onMouseLeave={scheduleDropdownClose}
                onFocus={(event) => openDropdown(item, event.currentTarget)}
                onBlur={scheduleDropdownClose}
                onKeyDown={(event) => handleCategoryKeyDown(event, index)}
                aria-haspopup={item.dropdownItems ? "menu" : undefined}
                aria-expanded={
                  item.dropdownItems ? openDropdownId === item.id : undefined
                }
                whileTap={reduced ? undefined : { scale: 0.97 }}
                transition={tapTransition(reduced)}
                className={`prism-nav-link relative z-10 min-h-[48px] rounded-[var(--prism-radius-pill)] px-5 py-2.5 text-[17px] font-medium leading-[26px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--prism-selector-from)] ${
                  isActive
                    ? "text-[var(--prism-text-active)]"
                    : "text-[var(--prism-text-muted)]"
                }`}
              >
                <motion.span variants={navItemEnter(reduced, index)}>
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          type="button"
          role="tab"
          id={idPrefix ? `${idPrefix}-tab-profile` : undefined}
          aria-selected={profileIsActive}
          aria-controls={idPrefix ? `${idPrefix}-panel-profile` : undefined}
          tabIndex={profileIsActive || activeId === null ? 0 : -1}
          onClick={() => onNavigate("profile")}
          whileTap={reduced ? undefined : { scale: 0.97 }}
          transition={tapTransition(reduced)}
          variants={profileEnter(reduced)}
          className={`prism-profile-btn relative z-10 flex min-h-[52px] items-center gap-2.5 rounded-[var(--prism-radius-pill)] px-4 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--prism-selector-from)] ${
            profileIsActive ? "prism-selector-pill" : "prism-profile-glass"
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
      </motion.nav>
      <AnimatePresence>
        {openDropdownItem?.dropdownItems ? (
          <motion.div
            key={openDropdownItem.id}
            className="prism-dropdown-layer fixed"
            style={{
              left: dropdownRect.left,
              top: dropdownRect.top,
              width: DROPDOWN_WIDTH,
              transformOrigin: "top center",
            }}
            onMouseEnter={cancelDropdownClose}
            onMouseLeave={scheduleDropdownClose}
            onFocus={cancelDropdownClose}
            onBlur={scheduleDropdownClose}
            {...dropdownMotion}
          >
            <div className="prism-dropdown-bridge" aria-hidden />
            <div
              id={
                idPrefix
                  ? `${idPrefix}-dropdown-${openDropdownItem.id}`
                  : undefined
              }
              role="menu"
              aria-label={`${openDropdownItem.label} menu`}
              className="prism-dropdown-panel"
            >
              {openDropdownItem.dropdownItems.map((dropdownItem) => (
                <button
                  key={dropdownItem}
                  type="button"
                  role="menuitem"
                  className="prism-dropdown-item"
                  onClick={closeDropdown}
                >
                  {dropdownItem}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
