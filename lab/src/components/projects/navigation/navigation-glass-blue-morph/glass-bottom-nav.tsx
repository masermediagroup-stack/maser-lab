"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  NAV_ITEMS,
  NAV_ITEM_IDS,
  type NavItemId,
} from "./constants";
import {
  ExploreIcon,
  GalleryIcon,
  HomeIcon,
  LibraryIcon,
  ProfileIcon,
} from "./icons";
import { MorphGlow, type GlowRect } from "./morph-glow";
import "./tokens.css";

const ICONS = {
  home: HomeIcon,
  explore: ExploreIcon,
  library: LibraryIcon,
  gallery: GalleryIcon,
  profile: ProfileIcon,
} as const;

type GlassBottomNavProps = {
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  forceReducedMotion?: boolean;
  className?: string;
  /** Prefix for tab/panel ids — must match tabpanel `aria-labelledby` in parent */
  idPrefix?: string;
};

export function GlassBottomNav({
  activeId,
  onNavigate,
  forceReducedMotion,
  className,
  idPrefix: idPrefixProp,
}: GlassBottomNavProps) {
  const generatedId = useId();
  const idPrefix = idPrefixProp ?? generatedId;
  const prefersReduced = useReducedMotion();
  const reduced = forceReducedMotion ?? prefersReduced ?? false;
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<NavItemId, HTMLButtonElement>>>({});
  const [glow, setGlow] = useState<GlowRect>({
    left: 0,
    width: 0,
    height: 48,
  });

  const measureGlow = useCallback((id: NavItemId) => {
    const nav = navRef.current;
    const tab = tabRefs.current[id];
    if (!nav || !tab) return;

    const navRect = nav.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    setGlow({
      left: tabRect.left - navRect.left,
      width: tabRect.width,
      height: tabRect.height,
    });
  }, []);

  useEffect(() => {
    measureGlow(activeId);
  }, [activeId, measureGlow]);

  useEffect(() => {
    const handleResize = () => measureGlow(activeId);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeId, measureGlow]);

  const focusTab = useCallback((id: NavItemId) => {
    tabRefs.current[id]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      let nextIndex = index;
      switch (event.key) {
        case "ArrowRight":
          nextIndex = (index + 1) % NAV_ITEMS.length;
          break;
        case "ArrowLeft":
          nextIndex = (index - 1 + NAV_ITEMS.length) % NAV_ITEMS.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = NAV_ITEMS.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      const next = NAV_ITEMS[nextIndex];
      if (next) {
        onNavigate(next.id);
        focusTab(next.id);
      }
    },
    [focusTab, onNavigate],
  );

  return (
    <nav
      className={`prism-nav fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-6 pt-2 ${className ?? ""}`}
      aria-label="Primary"
    >
      <div
        ref={navRef}
        className="prism-glass-bar relative flex w-full max-w-[420px] items-stretch justify-between gap-0.5 rounded-[var(--prism-radius-pill)] px-2 py-2"
        role="tablist"
        aria-orientation="horizontal"
      >
        <MorphGlow rect={glow} forceReducedMotion={forceReducedMotion} />

        {NAV_ITEMS.map((item, index) => {
          const isActive = item.id === activeId;
          const Icon = ICONS[item.id];

          return (
            <motion.button
              key={item.id}
              ref={(node) => {
                tabRefs.current[item.id] = node ?? undefined;
              }}
              type="button"
              role="tab"
              id={`${idPrefix}-tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={`${idPrefix}-panel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              layout={!reduced}
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 400,
                      damping: 34,
                    }
              }
              onClick={() => onNavigate(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onLayoutAnimationComplete={() => {
                if (isActive) measureGlow(item.id);
              }}
              whileTap={reduced ? undefined : { scale: 0.94 }}
              className={`relative z-10 flex min-h-11 min-w-11 flex-col items-center justify-center rounded-[var(--prism-radius-pill)] px-2 py-1.5 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--prism-blue-bright)] ${
                isActive ? "flex-[1.35] px-3" : "flex-1"
              }`}
              style={{
                color: isActive
                  ? "var(--prism-blue-bright)"
                  : "var(--prism-icon-muted)",
              }}
            >
              <Icon active={isActive} className="h-6 w-6 shrink-0" />
              <AnimatePresence mode="wait" initial={false}>
                {isActive ? (
                  <motion.span
                    key="label"
                    initial={
                      reduced ? false : { opacity: 0, y: 4 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -2 }}
                    transition={{
                      duration: reduced ? 0 : 0.16,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="mt-0.5 text-[10px] font-medium tracking-wide"
                  >
                    {item.label}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

export { NAV_ITEM_IDS, type NavItemId };
