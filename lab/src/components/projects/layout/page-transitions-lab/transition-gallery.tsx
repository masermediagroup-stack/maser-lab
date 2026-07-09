"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { transitionDefinitions } from "./transition-definitions";
import type { TransitionDefinition } from "./types";

type TransitionGalleryProps = {
  onEnter: (id: string) => void;
};

function MiniPreview({ definition }: { definition: TransitionDefinition }) {
  if (definition.id === "pixel-wormhole") {
    return (
      <div className="ptl-card-mini" aria-hidden="true">
        <div className="ptl-card-mini__wormhole">
          {Array.from({ length: 16 }, (_, i) => (
            <i key={i} />
          ))}
          <em />
        </div>
        <span className="ptl-card-mini__label">3D</span>
      </div>
    );
  }

  if (definition.engine === "three") {
    return (
      <div className="ptl-card-mini" aria-hidden="true">
        <div className="ptl-card-mini__bars">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <span className="ptl-card-mini__label">3D</span>
      </div>
    );
  }

  return (
    <div className="ptl-card-mini" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            definition.id === "editorial-wipe"
              ? "linear-gradient(90deg, transparent 40%, rgba(16,164,255,0.45) 50%, transparent 60%)"
              : definition.id === "spotlight-iris"
                ? "radial-gradient(circle at 68% 38%, rgba(16,164,255,0.4), transparent 42%)"
                : definition.id === "receipt-lift"
                  ? "linear-gradient(180deg, transparent 55%, rgba(16,164,255,0.22))"
                  : definition.id === "soft-crossfade-blur"
                    ? "linear-gradient(180deg, rgba(16,164,255,0.18), transparent)"
                    : "linear-gradient(105deg, transparent 30%, rgba(16,164,255,0.28) 50%, transparent 70%)",
        }}
      />
      <span className="ptl-card-mini__label">CSS</span>
    </div>
  );
}

export function TransitionGallery({ onEnter }: TransitionGalleryProps) {
  return (
    <div className="ptl-gallery">
      <header className="ptl-gallery__header">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="ptl-gallery__title">Page Transitions</h1>
          <Badge
            variant="outline"
            className="border-[var(--ptl-blue)]/40 text-[var(--ptl-blue)]"
          >
            {transitionDefinitions.length}
          </Badge>
        </div>
      </header>

      <div className="ptl-gallery__grid">
        {transitionDefinitions.map((definition) => (
          <Card
            key={definition.id}
            className="border-[var(--ptl-blue)]/25 bg-black text-white ring-[var(--ptl-blue)]/10"
          >
            <CardHeader className="border-b border-[var(--ptl-blue)]/15 pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-medium tracking-wide text-white">
                  {definition.title}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="shrink-0 border-[var(--ptl-blue)]/40 text-[0.65rem] text-[var(--ptl-blue)]"
                >
                  {definition.engine === "three" ? "3D" : "CSS"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <MiniPreview definition={definition} />
            </CardContent>
            <CardFooter className="border-t border-[var(--ptl-blue)]/15 bg-black/40 pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-[var(--ptl-blue)]/35 bg-transparent text-white hover:border-[var(--ptl-blue)] hover:bg-[var(--ptl-blue)]/10 hover:text-white"
                onClick={() => onEnter(definition.id)}
              >
                Enter
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
