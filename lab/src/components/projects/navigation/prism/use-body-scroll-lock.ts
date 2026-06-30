"use client";

import { useEffect, useRef } from "react";

export function useBodyScrollLock(locked: boolean) {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!locked) return;

    scrollYRef.current = window.scrollY;
    const { style } = document.body;
    const previous = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
    };

    if (scrollYRef.current === 0) {
      style.overflow = "hidden";
      return () => {
        style.overflow = previous.overflow;
      };
    }

    style.overflow = "hidden";
    style.position = "fixed";
    style.top = `-${scrollYRef.current}px`;
    style.width = "100%";

    return () => {
      style.overflow = previous.overflow;
      style.position = previous.position;
      style.top = previous.top;
      style.width = previous.width;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [locked]);
}
