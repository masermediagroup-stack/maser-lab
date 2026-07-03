"use client";

import type { AnimationDefinition, AnimationSettings } from "./types";

type AnimationPreviewProps = {
  definition: AnimationDefinition;
  text: string;
  settings: AnimationSettings;
  playKey: number;
  compact?: boolean;
  embeddedScroll?: boolean;
};

export function AnimationPreview({
  definition,
  text,
  settings,
  playKey,
  compact = false,
  embeddedScroll = false,
}: AnimationPreviewProps) {
  const Component = definition.component;

  return (
    <Component
      text={text}
      playKey={playKey}
      compact={compact}
      {...settings}
      {...(definition.id === "scroll-line-reveal" && embeddedScroll
        ? { embedded: true }
        : {})}
    />
  );
}
