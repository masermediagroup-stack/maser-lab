"use client";

import { useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type UseMagneticHoverOptions = {
  reduced?: boolean;
  maxOffset?: number;
  hoverScale?: number;
};

export function useMagneticHover({
  reduced = false,
  maxOffset = 6,
  hoverScale = 1.04,
}: UseMagneticHoverOptions = {}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [canHover, setCanHover] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  const springX = useSpring(x, { stiffness: 420, damping: 32, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 420, damping: 32, mass: 0.45 });
  const springScale = useSpring(scale, { stiffness: 480, damping: 36, mass: 0.4 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const enabled = canHover && !reduced;

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!enabled || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;
      const pull = 0.18;

      x.set(Math.max(-maxOffset, Math.min(maxOffset, deltaX * pull)));
      y.set(Math.max(-maxOffset, Math.min(maxOffset, deltaY * pull)));
      scale.set(hoverScale);
    },
    [enabled, hoverScale, maxOffset, scale, x, y],
  );

  const onMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    scale.set(1);
  }, [scale, x, y]);

  return {
    ref,
    enabled,
    style: enabled
      ? { x: springX, y: springY, scale: springScale }
      : undefined,
    onMouseMove: enabled ? onMouseMove : undefined,
    onMouseLeave: enabled ? onMouseLeave : undefined,
  };
}
