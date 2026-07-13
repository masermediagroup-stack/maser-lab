"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BeforeAfterSlider } from "./before-after-slider";
import type { ServiceImageMode, ServiceItem } from "./types";

type ServicePanelProps = {
  item: ServiceItem;
  panelIdPrefix: string;
  panelDurationMs: number;
  borderRadiusPx: number;
  reducedMotion: boolean;
  imageMode: ServiceImageMode;
  isFirstPaint: boolean;
};

function shouldShowComparison(
  item: ServiceItem,
  imageMode: ServiceImageMode,
): boolean {
  if (imageMode === "image") return false;
  if (imageMode === "comparison") return Boolean(item.comparison);
  return Boolean(item.comparison);
}

export function ServicePanel({
  item,
  panelIdPrefix,
  panelDurationMs,
  borderRadiusPx,
  reducedMotion,
  imageMode,
  isFirstPaint,
}: ServicePanelProps) {
  const prefersReduced = useReducedMotion();
  const reduce = reducedMotion || !!prefersReduced;
  const showComparison = shouldShowComparison(item, imageMode);
  const duration = reduce ? 0 : panelDurationMs / 1000;
  const mediaDuration = reduce ? 0 : Math.max(duration, 0.42);
  const mediaTransition = {
    duration: mediaDuration,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <div
      role="tabpanel"
      id={`${panelIdPrefix}-panel-${item.id}`}
      aria-labelledby={`${panelIdPrefix}-tab-${item.id}`}
      className="pt-[var(--ss-gap)]"
    >
      <div className="grid grid-cols-1 items-center gap-[var(--ss-gap)] md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div
          className="relative aspect-[4/3] min-w-0 overflow-hidden border border-[var(--ss-border)] bg-[var(--ss-hover)]"
          style={{ borderRadius: borderRadiusPx }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={`media-${item.id}`}
              className="absolute inset-0 will-change-transform"
              initial={reduce ? { y: "0%" } : { y: "-100%" }}
              animate={{ y: "0%" }}
              exit={reduce ? { opacity: 0 } : { y: "100%" }}
              transition={mediaTransition}
            >
              {showComparison && item.comparison ? (
                <BeforeAfterSlider
                  before={item.comparison.before}
                  after={item.comparison.after}
                  borderRadiusPx={0}
                  reducedMotion={reduce}
                  priority={isFirstPaint}
                  className="!aspect-auto h-full w-full rounded-none border-0"
                />
              ) : (
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority={isFirstPaint}
                  className="object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`copy-${item.id}`}
            className="flex min-w-0 flex-col gap-[var(--ss-copy-gap)] md:pl-2"
            initial={
              reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduce ? { opacity: 0, y: 0 } : { opacity: 0, y: 6 }
            }
            transition={{
              duration,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <h3 className="text-balance text-[clamp(1.75rem,2.4vw,2.375rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-[var(--ss-fg)]">
              {item.title}
            </h3>
            <p className="max-w-[34ch] text-[1.0125rem] leading-[1.65] text-[var(--ss-fg-muted)]">
              {item.description}
            </p>
            {item.cta ? (
              <Link
                href={item.cta.href}
                className="service-showcase__cta mt-1 inline-flex w-fit items-center gap-2 text-sm font-medium tracking-[-0.01em] text-[var(--ss-fg)] underline decoration-[var(--ss-border)] underline-offset-[0.35em] transition-[text-decoration-color] duration-200 hover:decoration-[var(--ss-fg)]"
              >
                {item.cta.label}
                <span aria-hidden className="translate-y-px">
                  →
                </span>
              </Link>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
