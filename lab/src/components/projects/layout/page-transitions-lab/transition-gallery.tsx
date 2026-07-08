"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  if (definition.engine === "three") {
    return (
      <div className="ptl-card-mini" aria-hidden="true">
        <div className="ptl-card-mini__bars">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <span className="ptl-card-mini__label">Three.js</span>
      </div>
    );
  }

  return (
    <div className="ptl-card-mini" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            definition.id === "editorial-wipe"
              ? "linear-gradient(90deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)"
              : definition.id === "spotlight-iris"
                ? "radial-gradient(circle at 68% 38%, rgba(255,255,255,0.25), transparent 42%)"
                : definition.id === "receipt-lift"
                  ? "linear-gradient(180deg, transparent 55%, rgba(255,255,255,0.12))"
                  : definition.id === "soft-crossfade-blur"
                    ? "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)"
                    : "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%)",
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
          <h1 className="ptl-gallery__title">Page Transitions Lab</h1>
          <Badge variant="outline" className="border-white/15 text-neutral-300">
            {transitionDefinitions.length} route motion patterns
          </Badge>
        </div>
        <p className="ptl-gallery__description">
          Compare page-to-page website transitions, tune practical settings,
          replay one-shot previews, and export starter code for client shopping
          sites — including a Three.js curtain-fall reveal.
        </p>
      </header>

      <div className="ptl-gallery__grid">
        {transitionDefinitions.map((definition) => (
          <Card
            key={definition.id}
            className="border-white/10 bg-neutral-950 text-white ring-white/10"
          >
            <CardHeader className="border-b border-white/5 pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-medium tracking-wide text-white">
                  {definition.title}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="shrink-0 border-white/10 text-[0.65rem] text-neutral-400"
                >
                  {definition.engine === "three" ? "3D" : "CSS"}
                </Badge>
              </div>
              <CardDescription className="text-xs text-neutral-400">
                {definition.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <MiniPreview definition={definition} />
            </CardContent>
            <CardFooter className="border-t border-white/5 bg-black/40 pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-white"
                onClick={() => onEnter(definition.id)}
              >
                Enter transition
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
