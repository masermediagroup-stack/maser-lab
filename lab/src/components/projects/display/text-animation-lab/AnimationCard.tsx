"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnimationDefinition } from "./types";
import { AnimationPreview } from "./AnimationPreview";

type AnimationCardProps = {
  definition: AnimationDefinition;
  playKey: number;
  onEnter: (id: string) => void;
};

export function AnimationCard({ definition, playKey, onEnter }: AnimationCardProps) {
  return (
    <Card className="tal-card border-white/10 bg-neutral-950 text-white ring-white/10">
      <CardHeader className="border-b border-white/5 pb-3">
        <CardTitle className="text-sm font-medium tracking-wide text-white">
          {definition.title}
        </CardTitle>
        <CardDescription className="text-xs text-neutral-400">
          {definition.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-28 items-center justify-center py-8">
        {definition.id === "scroll-line-reveal" ? (
          <div
            className="h-28 w-full overflow-y-auto rounded-md border border-white/5 bg-black/50 p-3"
            data-tal-scroll-host
          >
            <AnimationPreview
              definition={definition}
              text={definition.defaultText}
              settings={definition.defaultSettings}
              playKey={playKey}
              compact
              embeddedScroll
            />
          </div>
        ) : (
          <AnimationPreview
            definition={definition}
            text={definition.defaultText}
            settings={definition.defaultSettings}
            playKey={playKey}
            compact
          />
        )}
      </CardContent>
      <CardFooter className="border-t border-white/5 bg-black/40 pt-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-white"
          onClick={() => onEnter(definition.id)}
        >
          Enter Animation
        </Button>
      </CardFooter>
    </Card>
  );
}
