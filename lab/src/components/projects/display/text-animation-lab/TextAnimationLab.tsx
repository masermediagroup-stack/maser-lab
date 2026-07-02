"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      <div className="text-animation-lab__chrome">
        <Link
          href="/"
          className="text-xs tracking-wide text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← Maser-Lab
        </Link>
      </div>

      {selected ? (
        <AnimationDetail definition={selected} onBack={handleBack} />
      ) : (
        <AnimationGallery playKey={galleryPlayKey} onEnter={handleEnter} />
      )}
    </div>
  );
}
