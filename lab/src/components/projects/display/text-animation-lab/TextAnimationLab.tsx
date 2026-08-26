"use client";

import { useEffect, useState } from "react";
import {
  DemoBackButton,
  DemoControlMenu,
} from "@/components/lab/demo-chrome";
import { AnimationGallery } from "./AnimationGallery";
import { AnimationDetail } from "./AnimationDetail";
import { getAnimationById } from "./animation-registry";
import "./tokens.css";

export function TextAnimationLab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [galleryPlayKey, setGalleryPlayKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setGalleryPlayKey((k) => k + 1), 8000);
    return () => clearInterval(interval);
  }, []);

  const handleEnter = (id: string) => {
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleBack = () => {
    setSelectedId(null);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const selected = selectedId ? getAnimationById(selectedId) : undefined;

  return (
    <div className="text-animation-lab min-h-screen bg-black text-white">
      {selected ? (
        <AnimationDetail
          key={selected.id}
          definition={selected}
          onBack={handleBack}
        />
      ) : (
        <>
          <DemoControlMenu>
            <DemoBackButton />
            <p className="font-mono text-xs text-[var(--lab-text-secondary)]">
              Text Animation Lab
            </p>
          </DemoControlMenu>
          <div className="lab-demo-inset">
            <AnimationGallery playKey={galleryPlayKey} onEnter={handleEnter} />
          </div>
        </>
      )}
    </div>
  );
}
