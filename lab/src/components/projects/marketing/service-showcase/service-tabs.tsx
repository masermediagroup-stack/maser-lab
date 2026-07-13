"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { SS_PILL_LAYOUT_ID } from "./constants";
import type { ServiceItem } from "./types";

type ServiceTabsProps = {
  items: ServiceItem[];
  activeId: string;
  onChange: (id: string) => void;
  tabDurationMs: number;
  reducedMotion: boolean;
  panelIdPrefix: string;
};

export function ServiceTabs({
  items,
  activeId,
  onChange,
  tabDurationMs,
  reducedMotion,
  panelIdPrefix,
}: ServiceTabsProps) {
  const listId = useId();
  const prefersReduced = useReducedMotion();
  const reduce = reducedMotion || !!prefersReduced;
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = tabRefs.current.get(activeId);
    if (!node || !scrollRef.current) return;
    node.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeId, reduce]);

  const activeIndex = items.findIndex((item) => item.id === activeId);

  const focusTab = (index: number) => {
    const next = items[index];
    if (!next) return;
    onChange(next.id);
    requestAnimationFrame(() => {
      tabRefs.current.get(next.id)?.focus();
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (items.length === 0) return;
    const current = activeIndex < 0 ? 0 : activeIndex;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab((current + 1) % items.length);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab((current - 1 + items.length) % items.length);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(items.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={scrollRef}
      className="service-showcase__tabs -mx-1 overflow-x-auto px-1"
      role="presentation"
    >
      <div
        role="tablist"
        aria-label="Service types"
        aria-orientation="horizontal"
        id={listId}
        className="relative flex w-max min-w-full gap-1.5 border-b border-[var(--ss-border)] pb-[calc(0.875rem*var(--ss-space-scale))]"
        onKeyDown={onKeyDown}
      >
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(el) => {
                if (el) tabRefs.current.set(item.id, el);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={`${panelIdPrefix}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${panelIdPrefix}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "service-showcase__tab relative z-10 shrink-0 rounded-none",
                "px-[var(--ss-tab-pad-x)] py-[var(--ss-tab-pad-y)]",
                "text-sm font-medium tracking-[-0.01em] transition-colors",
                "duration-[var(--ss-tab-duration)]",
                selected ? "text-white" : "text-[var(--ss-fg)]",
              )}
              onClick={() => onChange(item.id)}
            >
              {selected ? (
                <motion.span
                  layoutId={SS_PILL_LAYOUT_ID}
                  className="absolute inset-0 -z-10 rounded-none bg-[var(--ss-fg)]"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                          mass: 0.7,
                          duration: tabDurationMs / 1000,
                        }
                  }
                  aria-hidden
                />
              ) : null}
              <span className="relative z-10 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
