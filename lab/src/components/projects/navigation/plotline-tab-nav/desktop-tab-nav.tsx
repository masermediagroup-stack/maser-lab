"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedText } from "./animated-text";
import {
  CENTER_NAV_ITEMS,
  SIGN_IN_ITEM,
  type NavItem,
  type NavItemId,
} from "./constants";
import { MagneticTabButton } from "./magnetic-tab-button";
import { PlotlineLogo } from "./plotline-logo";
import { SignInTabLabel } from "./sign-in-tab-label";
import type { PlotlineTabNavPlacement } from "./tab-nav";

type BubbleRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type DropdownRect = {
  left: number;
  top: number;
};

type DropdownId = Extract<NavItemId, "features" | "integrations">;

/** Peak blur during bubble spring — matches `--pl-bubble-motion-blur` in tokens.css */
const BUBBLE_MOTION_BLUR_PX = 5;

const BUBBLE_SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

const BUBBLE_MOTION_BLUR_FILTER: Transition = {
  duration: 0.38,
  times: [0, 0.3, 1],
  ease: [0.22, 1, 0.36, 1],
};

const INSTANT: Transition = { duration: 0 };
const DROPDOWN_WIDTH = 260;
const DROPDOWN_GAP = 12;
const DROPDOWN_CLOSE_DELAY_MS = 140;

function bubbleMotionBlurFilter(active: boolean): string | string[] {
  return active
    ? [`blur(0px)`, `blur(${BUBBLE_MOTION_BLUR_PX}px)`, `blur(0px)`]
    : "blur(0px)";
}

type DesktopTabNavProps = {
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  startFreeActive?: boolean;
  onStartFree?: () => void;
  forceReducedMotion?: boolean;
  idPrefix?: string;
  placement?: PlotlineTabNavPlacement;
};

export function DesktopTabNav({
  activeId,
  onNavigate,
  startFreeActive = false,
  onStartFree,
  forceReducedMotion,
  idPrefix,
  placement = "fixed-top",
}: DesktopTabNavProps) {
  const prefersReduced = useReducedMotion();
  const reduced = forceReducedMotion ?? prefersReduced ?? false;
  const visualActiveId = startFreeActive ? null : activeId;
  const bubbleActiveId = visualActiveId === SIGN_IN_ITEM.id ? SIGN_IN_ITEM.id : null;
  const barRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Partial<Record<NavItemId, HTMLButtonElement>>>({});
  const prevVisualActiveIdRef = useRef<NavItemId | null>(null);
  const isFirstMeasureRef = useRef(true);
  const closeDropdownTimeoutRef = useRef<number | null>(null);
  const [signInHovered, setSignInHovered] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<DropdownId | null>(null);
  const [dropdownRect, setDropdownRect] = useState<DropdownRect>({
    left: 0,
    top: 0,
  });
  const [bubbleSize, setBubbleSize] = useState({ width: 88, height: 36 });
  const [bubble, setBubble] = useState<BubbleRect>({
    left: 0,
    top: 0,
    width: 0,
    height: 36,
  });
  const [bubbleAnimates, setBubbleAnimates] = useState(false);

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

    setDropdownRect({
      left: Math.min(
        Math.max(viewportPadding, preferredLeft),
        Math.max(viewportPadding, maxLeft),
      ),
      top: buttonRect.bottom + DROPDOWN_GAP,
    });
  }, []);

  const openDropdown = useCallback(
    (item: NavItem, button: HTMLButtonElement | null) => {
      if (!item.dropdownItems) {
        closeDropdown();
        return;
      }

      cancelDropdownClose();
      if (button) updateDropdownRect(button);
      setOpenDropdownId(item.id as DropdownId);
    },
    [cancelDropdownClose, closeDropdown, updateDropdownRect],
  );

  const measureBubble = useCallback((id: NavItemId) => {
    const container = barRef.current;
    const link = linkRefs.current[id];
    if (!container || !link) return;

    const containerRect = container.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const width = linkRect.width;
    const height = linkRect.height;

    if (width > 0 && height > 0) {
      setBubbleSize({ width, height });
    }

    setBubble({
      left: linkRect.left - containerRect.left - container.clientLeft,
      top: linkRect.top - containerRect.top - container.clientTop,
      width,
      height,
    });
  }, []);

  useEffect(() => {
    const prev = prevVisualActiveIdRef.current;
    const tabChanged = prev !== bubbleActiveId;

    setBubbleAnimates(!isFirstMeasureRef.current && tabChanged);
    isFirstMeasureRef.current = false;

    if (bubbleActiveId) {
      measureBubble(bubbleActiveId);
    } else {
      setBubble((current) => ({ ...current, width: 0 }));
    }
    prevVisualActiveIdRef.current = bubbleActiveId;
  }, [bubbleActiveId, measureBubble]);

  useEffect(() => {
    const handleResize = () => {
      setBubbleAnimates(false);
      if (bubbleActiveId) {
        measureBubble(bubbleActiveId);
      }

      if (openDropdownId) {
        const button = linkRefs.current[openDropdownId];
        if (button) updateDropdownRect(button);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [bubbleActiveId, measureBubble, openDropdownId, updateDropdownRect]);

  useEffect(() => {
    if (!openDropdownId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDropdown();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeDropdown, openDropdownId]);

  useEffect(() => {
    return () => cancelDropdownClose();
  }, [cancelDropdownClose]);

  const headerClass =
    placement === "fixed-top"
      ? "fixed inset-x-0 top-0 z-50 hidden justify-center px-6 pt-5 md:flex"
      : "relative z-10 hidden w-full justify-center px-6 md:flex";

  const shouldBubbleMotionBlur =
    bubbleAnimates && !reduced && bubbleActiveId !== null;

  const baseWidth = bubbleSize.width;
  const baseHeight = bubbleSize.height;
  const scaleX = bubble.width > 0 ? bubble.width / baseWidth : 1;
  const scaleY = bubble.height > 0 ? bubble.height / baseHeight : 1;
  const signInActive = visualActiveId === SIGN_IN_ITEM.id;
  const openDropdownItem = openDropdownId
    ? CENTER_NAV_ITEMS.find((item) => item.id === openDropdownId)
    : null;
  const dropdownMotion = reduced
    ? {
        initial: false as const,
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.08 },
      }
    : {
        initial: { opacity: 0, y: -6, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -4, scale: 0.98 },
        transition: {
          duration: 0.19,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      };

  return (
    <header className={headerClass}>
      <div
        ref={barRef}
        className="plotline-glass relative grid w-full max-w-5xl grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-[var(--pl-radius-tab)] px-4 py-2.5 md:gap-4 md:px-5"
        style={{
          borderBottomLeftRadius: "var(--pl-radius-tab)",
          borderBottomRightRadius: "var(--pl-radius-tab)",
        }}
      >
        {bubbleActiveId && bubble.width > 0 ? (
          <motion.div
            className="plotline-glass-strong pointer-events-none absolute left-0 top-0 rounded-[var(--pl-radius-bubble)] border border-[var(--pl-glass-border)]"
            style={{
              width: baseWidth,
              height: baseHeight,
              transformOrigin: "left top",
              boxShadow:
                "0 0 24px rgba(155, 27, 92, 0.35), inset 0 1px 0 rgba(245, 184, 212, 0.12)",
            }}
            initial={false}
            animate={{
              x: bubble.left,
              y: bubble.top,
              scaleX,
              scaleY,
              opacity: 1,
              filter: bubbleMotionBlurFilter(shouldBubbleMotionBlur),
            }}
            transition={
              reduced || !bubbleAnimates
                ? INSTANT
                : {
                    x: BUBBLE_SPRING,
                    y: BUBBLE_SPRING,
                    scaleX: BUBBLE_SPRING,
                    scaleY: BUBBLE_SPRING,
                    opacity: { duration: 0.15 },
                    filter: shouldBubbleMotionBlur
                      ? BUBBLE_MOTION_BLUR_FILTER
                      : INSTANT,
                  }
            }
            aria-hidden
          />
        ) : null}

        <button
          type="button"
          onClick={() => onNavigate("features")}
          className="plotline-brand relative z-10 flex shrink-0 items-center gap-2.5 rounded-xl px-1 py-1"
          aria-label="Plotline home"
        >
          <PlotlineLogo size={32} className="plotline-brand-logomark" />
          <AnimatedText
            variant="heading"
            className="plotline-brand-label text-base font-semibold text-[var(--pl-text)]"
          >
            Plotline
          </AnimatedText>
        </button>

        <div className="relative z-10 flex min-h-10 items-center justify-center">
          <nav
            className="relative flex items-center gap-2.5"
            aria-label="Primary"
          >
            {CENTER_NAV_ITEMS.map((item) => {
              const isActive = item.id === visualActiveId;
              return (
                <MagneticTabButton
                  key={item.id}
                  ref={(node) => {
                    linkRefs.current[item.id] = node ?? undefined;
                  }}
                  reduced={reduced}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  onMouseEnter={(event) => openDropdown(item, event.currentTarget)}
                  onMouseLeave={scheduleDropdownClose}
                  onFocus={(event) => openDropdown(item, event.currentTarget)}
                  onBlur={scheduleDropdownClose}
                  id={idPrefix ? `${idPrefix}-tab-${item.id}` : undefined}
                  aria-current={isActive ? "page" : undefined}
                  aria-haspopup={item.dropdownItems ? "menu" : undefined}
                  aria-expanded={
                    item.dropdownItems ? openDropdownId === item.id : undefined
                  }
                  className={`relative inline-flex h-10 box-border items-center justify-center whitespace-nowrap rounded-full border border-transparent px-[18px] py-0 text-sm font-medium leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pl-pink-light)] ${
                    isActive
                      ? "text-[var(--pl-tab-active-text)]"
                      : "text-[var(--pl-text-muted)] hover:text-[var(--pl-pink-light)]"
                  }`}
                >
                  {item.dropdownItems ? (
                    <span className="relative z-10 grid grid-cols-[14px_auto_14px] items-center gap-1.5 whitespace-nowrap leading-none">
                      <span className="h-[14px] w-[14px]" aria-hidden />
                      <AnimatedText active={isActive}>{item.label}</AnimatedText>
                      <span className="flex h-[14px] w-[14px] shrink-0 items-center justify-center" aria-hidden>
                        <span
                          className={`plotline-dropdown-chevron ${
                            openDropdownId === item.id
                              ? "plotline-dropdown-chevron--open"
                              : ""
                          }`}
                        />
                      </span>
                    </span>
                  ) : (
                    <span className="relative z-10 inline-flex items-center justify-center whitespace-nowrap leading-none">
                      <AnimatedText active={isActive}>{item.label}</AnimatedText>
                    </span>
                  )}
                </MagneticTabButton>
              );
            })}
          </nav>
        </div>

        <MagneticTabButton
          ref={(node) => {
            linkRefs.current[SIGN_IN_ITEM.id] = node ?? undefined;
          }}
          reduced={reduced}
          type="button"
          onClick={() => onNavigate(SIGN_IN_ITEM.id)}
          onMouseEnter={() => setSignInHovered(true)}
          onMouseLeave={() => setSignInHovered(false)}
          id={idPrefix ? `${idPrefix}-tab-${SIGN_IN_ITEM.id}` : undefined}
          aria-current={signInActive ? "page" : undefined}
          className={`plotline-sign-in-btn relative z-10 flex h-10 shrink-0 items-center justify-center rounded-full px-4 py-0 text-sm font-medium leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pl-pink-light)] ${
            signInActive
              ? "plotline-sign-in-btn--active min-w-[5.5rem] text-[var(--pl-tab-active-text)]"
              : "text-[var(--pl-text-muted)] hover:text-[var(--pl-pink-light)]"
          }`}
        >
          <SignInTabLabel
            active={signInActive}
            reduced={reduced}
            hovered={signInHovered}
            layout="desktop"
          />
        </MagneticTabButton>

        <motion.button
          type="button"
          onClick={onStartFree}
          aria-pressed={startFreeActive}
          whileHover={reduced ? undefined : { scale: 1.03, y: -1 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className={`relative z-10 shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pl-pink-light)] ${
            startFreeActive
              ? "plotline-start-free--active"
              : "bg-[var(--pl-pink-dark)] text-[var(--pl-pink-light)] shadow-[0_8px_24px_rgba(155,27,92,0.45)] hover:text-[var(--pl-pink-light)]"
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
      </div>
      <AnimatePresence>
        {openDropdownItem?.dropdownItems ? (
          <motion.div
            key={openDropdownItem.id}
            className="plotline-dropdown-layer fixed"
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
            <div className="plotline-dropdown-bridge" aria-hidden />
            <div
              role="menu"
              aria-label={`${openDropdownItem.label} menu`}
              className="plotline-dropdown-panel"
            >
              {openDropdownItem.dropdownItems.map((dropdownItem) => (
                <button
                  key={dropdownItem}
                  type="button"
                  role="menuitem"
                  className="plotline-dropdown-item"
                  onClick={closeDropdown}
                >
                  {dropdownItem}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
