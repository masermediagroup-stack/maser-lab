"use client";

import { Badge } from "@/components/ui/badge";
import { animationRegistry } from "./animation-registry";
import { AnimationCard } from "./AnimationCard";

type AnimationGalleryProps = {
  playKey: number;
  onEnter: (id: string) => void;
};

export function AnimationGallery({ playKey, onEnter }: AnimationGalleryProps) {
  return (
    <div className="tal-gallery">
      <header className="tal-gallery__header">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="tal-gallery__title">Text Animation Lab</h1>
          <Badge variant="outline" className="border-white/15 text-neutral-300">
            10 reusable Maser-Lab text effects
          </Badge>
        </div>
        <p className="tal-gallery__description">
          Preview monochrome text animation effects, enter any animation to tune
          settings, replay, reset, and export production-ready component code.
        </p>
      </header>

      <div className="tal-gallery__grid">
        {animationRegistry.map((definition) => (
          <AnimationCard
            key={definition.id}
            definition={definition}
            playKey={playKey}
            onEnter={onEnter}
          />
        ))}
      </div>
    </div>
  );
}
