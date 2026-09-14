"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  FROST_NAV_ICONS,
  FROST_NAV_ITEMS,
  LEAVE_MS,
  SLOT_ARCS,
  normalizePath,
} from "./constants";
import type { FrostNavId, FrostNavShell, TylerGlassNavProps } from "./types";
import "./tokens.css";

const FINE_HOVER = "(hover: hover) and (pointer: fine)";

function useFineHover(): boolean {
  const [fine, setFine] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(FINE_HOVER).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(FINE_HOVER);
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return fine;
}

function useOsReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduce;
}

function useOsReduceTransparency(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-transparency: reduce)");
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduce;
}

export function TylerGlassNav({
  pathname = "/",
  items = FROST_NAV_ITEMS,
  forceExpanded = false,
  forceReducedMotion = false,
  forceReducedTransparency = false,
  forceShell,
  forceSlotHover = null,
  onNavigate,
}: TylerGlassNavProps) {
  const reactId = useId();
  const fineHover = useFineHover();
  const osReduceMotion = useOsReduceMotion();
  const osReduceTransparency = useOsReduceTransparency();
  const [pinned, setPinned] = useState(false);
  const [pointerHot, setPointerHot] = useState(false);
  const [slotHover, setSlotHover] = useState<FrostNavId | null>(null);
  const [instant, setInstant] = useState(false);
  const leaveTimer = useRef<number | null>(null);
  const peekPointerRef = useRef(false);

  const forcedOpen =
    forceExpanded ||
    forceShell === "expanded-quiet" ||
    forceShell === "expanded-slot";

  const lockedPeek =
    forceShell === "dim-peek" || forceShell === "glowing-peek";
  const open =
    !lockedPeek && (forcedOpen || pinned || (fineHover && pointerHot));
  const litSlot = forceSlotHover ?? (forceShell === "expanded-slot" ? "work" : slotHover);
  const reducedMotion = forceReducedMotion || osReduceMotion;
  const reducedTransparency = forceReducedTransparency || osReduceTransparency;
  const current = normalizePath(pathname);

  let shell: FrostNavShell = "dim-peek";
  if (forceShell) {
    shell = forceShell;
  } else if (!open && pointerHot) {
    shell = "glowing-peek";
  } else if (open && litSlot) {
    shell = "expanded-slot";
  } else if (open) {
    shell = "expanded-quiet";
  }

  const snapOpen = useCallback(() => {
    setInstant(true);
    setPinned(true);
  }, []);

  const clearLeave = useCallback(() => {
    if (leaveTimer.current !== null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  const onPointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!fineHover) return;
      if (event.pointerType === "touch") return;
      clearLeave();
      setPointerHot(true);
      setInstant(reducedMotion);
    },
    [clearLeave, fineHover, reducedMotion],
  );

  const onPointerLeave = useCallback(() => {
    if (!fineHover) return;
    clearLeave();
    leaveTimer.current = window.setTimeout(() => {
      setPointerHot(false);
      setSlotHover(null);
      if (!forcedOpen) setPinned(false);
      leaveTimer.current = null;
    }, LEAVE_MS);
  }, [clearLeave, fineHover, forcedOpen]);

  useEffect(() => {
    return () => clearLeave();
  }, [clearLeave]);

  useEffect(() => {
    if (!pinned || fineHover) return;
    const onPointerDown = (event: PointerEvent) => {
      const root = document.getElementById(reactId);
      if (root && event.target instanceof Node && root.contains(event.target)) {
        return;
      }
      setPinned(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pinned, fineHover, reactId]);

  const onPeekActivate = useCallback(() => {
    peekPointerRef.current = false;
    if (fineHover) {
      snapOpen();
      return;
    }
    setInstant(reducedMotion);
    setPinned((openNow) => !openNow);
  }, [fineHover, reducedMotion, snapOpen]);

  const onPeekFocus = useCallback(() => {
    if (peekPointerRef.current) return;
    snapOpen();
  }, [snapOpen]);

  return (
    <nav
      id={reactId}
      className="tv-frost-nav"
      aria-label="Tyler Vea frost disc navigation"
      data-open={open ? "true" : "false"}
      data-shell={shell}
      data-instant={instant || reducedMotion ? "true" : "false"}
      data-reduced-motion={forceReducedMotion ? "true" : undefined}
      data-reduced-transparency={reducedTransparency ? "true" : undefined}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="tv-frost-nav__lift">
        <div className="tv-frost-nav__frost" aria-hidden="true" />
        <div className="tv-frost-nav__inner-rim" aria-hidden="true" />
        <span
          className="tv-frost-nav__divider"
          style={{ transform: "rotate(240deg)" }}
          aria-hidden="true"
        />
        <span
          className="tv-frost-nav__divider"
          style={{ transform: "rotate(300deg)" }}
          aria-hidden="true"
        />
        <button
          type="button"
          className="tv-frost-nav__peek"
          aria-label="Open navigation"
          aria-expanded={open}
          tabIndex={open && fineHover ? -1 : 0}
          onClick={onPeekActivate}
          onPointerDown={() => {
            peekPointerRef.current = true;
          }}
          onFocus={onPeekFocus}
        />
        {items.map((item) => {
          const Icon = FROST_NAV_ICONS[item.id];
          const arc = SLOT_ARCS[item.id];
          const active = normalizePath(item.href) === current;
          const lit = litSlot === item.id;
          const solid = open && (lit || active);
          return (
            <a
              key={item.id}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="tv-frost-nav__slot"
              style={{ clipPath: arc.clipPath }}
              data-active={active && open && !lit ? "true" : undefined}
              data-lit={lit && open ? "true" : undefined}
              tabIndex={open ? 0 : -1}
              onPointerEnter={() => {
                if (!fineHover) return;
                setSlotHover(item.id);
              }}
              onPointerLeave={() => {
                if (!fineHover) return;
                setSlotHover((id) => (id === item.id ? null : id));
              }}
              onFocus={() => {
                snapOpen();
              }}
              onClick={(event) => {
                onNavigate?.(item.href, event);
                setPinned(false);
                setPointerHot(false);
              }}
            >
              <span
                className="tv-frost-nav__mark"
                style={{ left: arc.iconX, top: arc.iconY }}
              >
                <Icon solid={solid} />
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
