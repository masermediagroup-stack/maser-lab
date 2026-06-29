"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import {
  forwardRef,
  useCallback,
  type ReactNode,
} from "react";
import { useMagneticHover } from "./use-magnetic-hover";

type MagneticTabButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children: ReactNode;
  reduced?: boolean;
};

export const MagneticTabButton = forwardRef<
  HTMLButtonElement,
  MagneticTabButtonProps
>(function MagneticTabButton(
  {
    children,
    reduced = false,
    className,
    onMouseMove,
    onMouseLeave,
    whileTap,
    transition,
    ...props
  },
  forwardedRef,
) {
  const magnetic = useMagneticHover({ reduced });

  const setRef = useCallback(
    (node: HTMLButtonElement | null) => {
      magnetic.ref.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, magnetic.ref],
  );

  return (
    <motion.button
      ref={setRef}
      style={magnetic.style}
      onMouseMove={(event) => {
        magnetic.onMouseMove?.(event);
        onMouseMove?.(event);
      }}
      onMouseLeave={(event) => {
        magnetic.onMouseLeave?.();
        onMouseLeave?.(event);
      }}
      whileTap={whileTap ?? (reduced ? undefined : { scale: 0.98 })}
      transition={
        transition ?? { duration: 0.16, ease: [0.22, 1, 0.36, 1] }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
});
