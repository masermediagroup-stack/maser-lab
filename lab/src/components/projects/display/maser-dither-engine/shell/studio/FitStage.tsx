"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type FitStageProps = {
  children: ReactNode;
  className?: string;
};

type Size = { w: number; h: number };

/**
 * Scales children down (never up) so the full component + effect fits the stage.
 * Used by the mobile workspace where desktop-sized adapters would otherwise clip.
 */
export function FitStage({ children, className }: FitStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const measure = measureRef.current;
    if (!wrap || !measure) return;

    const update = () => {
      const pad = 8;
      const ww = Math.max(0, wrap.clientWidth - pad * 2);
      const wh = Math.max(0, wrap.clientHeight - pad * 2);
      const iw = measure.offsetWidth;
      const ih = measure.offsetHeight;
      if (ww <= 0 || wh <= 0 || iw <= 0 || ih <= 0) {
        setScale(1);
        setSize({ w: iw, h: ih });
        return;
      }
      const next = Math.min(1, ww / iw, wh / ih);
      setScale(Number.isFinite(next) ? next : 1);
      setSize({ w: iw, h: ih });
    };

    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    ro.observe(measure);
    update();
    return () => ro.disconnect();
  }, []);

  const slotW = size.w > 0 ? size.w * scale : undefined;
  const slotH = size.h > 0 ? size.h * scale : undefined;

  return (
    <div
      ref={wrapRef}
      className={className ? `mde-fit-stage ${className}` : "mde-fit-stage"}
    >
      <div
        className="mde-fit-stage__slot"
        style={{ width: slotW, height: slotH }}
      >
        <div
          ref={measureRef}
          className="mde-fit-stage__measure"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
