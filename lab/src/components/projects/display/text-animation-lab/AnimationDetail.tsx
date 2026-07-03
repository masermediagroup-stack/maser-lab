"use client";

import { useEffect, useCallback, useState } from "react";
import { ArrowLeft, Code2, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnimationDefinition, AnimationSettings } from "./types";
import { getDefaultSettings } from "./animation-registry";
import { AnimationControls } from "./AnimationControls";
import { AnimationPreview } from "./AnimationPreview";
import { CodeExportDrawer } from "./CodeExportDrawer";

type AnimationDetailProps = {
  definition: AnimationDefinition;
  onBack: () => void;
};

export function AnimationDetail({ definition, onBack }: AnimationDetailProps) {
  const [text, setText] = useState(definition.defaultText);
  const [settings, setSettings] = useState<AnimationSettings>(
    getDefaultSettings(definition),
  );
  const [playKey, setPlayKey] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [definition.id]);

  const handleSettingChange = useCallback((key: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReplay = () => setPlayKey((k) => k + 1);

  const handleReset = () => {
    setText(definition.defaultText);
    setSettings(getDefaultSettings(definition));
    setPlayKey((k) => k + 1);
  };

  const isScrollReveal = definition.id === "scroll-line-reveal";

  return (
    <div className="tal-detail">
      <div className="tal-detail__top">
        <Button
          variant="ghost"
          size="sm"
          className="text-neutral-300 hover:bg-white/5 hover:text-white"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          Back to all animations
        </Button>

        <div className="mt-4 space-y-2">
          <h1 className="tal-detail__title">{definition.title}</h1>
          <p className="tal-detail__description">{definition.description}</p>
        </div>
      </div>

      <div className="tal-detail__layout">
        <div className="tal-detail__main">
          <div
            className="tal-detail__preview"
            data-tal-scroll-host={isScrollReveal ? "" : undefined}
          >
            <AnimationPreview
              definition={definition}
              text={text}
              settings={settings}
              playKey={playKey}
              embeddedScroll={isScrollReveal}
            />
          </div>

          <div className="tal-detail__actions">
            <Button
              variant="outline"
              className="border-white/15 bg-transparent text-white hover:bg-white/5"
              onClick={handleReplay}
            >
              <RotateCw className="size-4" />
              Replay
            </Button>
            <Button
              variant="outline"
              className="border-white/15 bg-transparent text-white hover:bg-white/5"
              onClick={handleReset}
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
            <Button
              className="bg-white text-black hover:bg-neutral-200"
              onClick={() => setExportOpen(true)}
            >
              <Code2 className="size-4" />
              Load / Export Code
            </Button>
          </div>
        </div>

        <aside className="tal-detail__panel">
          <AnimationControls
            definition={definition}
            text={text}
            settings={settings}
            onTextChange={setText}
            onSettingChange={handleSettingChange}
          />
        </aside>
      </div>

      <CodeExportDrawer
        open={exportOpen}
        onOpenChange={setExportOpen}
        definition={definition}
        text={text}
        settings={settings}
      />
    </div>
  );
}
