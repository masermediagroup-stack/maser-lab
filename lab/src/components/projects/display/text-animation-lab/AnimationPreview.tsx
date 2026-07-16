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

  const phase =
    typeof settings.phase === "string" &&
    (settings.phase === "in" || settings.phase === "out")
      ? settings.phase
      : "in";

  return (
    <Component
      text={text}
      playKey={playKey}
      compact={compact}
      {...settings}
      phase={phase}
      {...(definition.id === "scroll-line-reveal" && embeddedScroll
        ? { embedded: true }
        : {})}
    />
  );
}
