"use client";

import { useCallback, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { useTornTransition } from "../hooks/use-torn-transition";
import type {
  TransitionDirection,
  TransitionOrigin,
} from "../lib/transition-types";

export type TornTransitionLinkProps =
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    /** Overrides the provider direction for this link only. */
    direction?: TransitionDirection;
    /**
     * Runs instead of a browser navigation once the sheet covers the screen.
     * Pass your router's `push` here, or a local state setter.
     */
    onNavigate?: (href: string) => void;
    /** Element focused after the swap, so keyboard users are not stranded. */
    focusTargetId?: string;
    /** Start radial and pointer sweeps from the click position. */
    originFromPointer?: boolean;
  };

function isModifiedEvent(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function isExternal(href: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//");
}

/**
 * A real anchor first, a transition trigger second.
 *
 * Modifier-clicks, middle-clicks, `target` and external URLs all fall through
 * to the browser untouched — the transition only takes over the plain
 * left-click case it can actually complete.
 */
export function TornTransitionLink({
  href,
  direction,
  onNavigate,
  focusTargetId,
  originFromPointer = false,
  onClick,
  target,
  ...rest
}: TornTransitionLinkProps) {
  const { startTransition } = useTornTransition();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (isModifiedEvent(event)) return;
      if (target && target !== "_self") return;
      if (isExternal(href)) return;

      event.preventDefault();

      let origin: TransitionOrigin | undefined;
      if (originFromPointer) {
        const host =
          event.currentTarget.closest<HTMLElement>(".tgt-root") ??
          document.documentElement;
        const rect = host.getBoundingClientRect();
        if (rect.width && rect.height) {
          origin = {
            x: (event.clientX - rect.left) / rect.width,
            y: 1 - (event.clientY - rect.top) / rect.height,
          };
        }
      }

      startTransition({
        direction,
        origin,
        onCovered: () => {
          if (onNavigate) onNavigate(href);
          else window.location.assign(href);
        },
        onComplete: () => {
          if (!focusTargetId) return;
          const node = document.getElementById(focusTargetId);
          node?.focus({ preventScroll: true });
        },
      });
    },
    [
      direction,
      focusTargetId,
      href,
      onClick,
      onNavigate,
      originFromPointer,
      startTransition,
      target,
    ],
  );

  return <a href={href} target={target} onClick={handleClick} {...rest} />;
}
