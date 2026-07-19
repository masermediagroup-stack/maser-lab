"use client";

import { useState } from "react";
import Link from "next/link";
import { getTransitionDefinition } from "./transition-definitions";
import { TransitionDetail } from "./transition-detail";
import { TransitionGallery } from "./transition-gallery";
import type { TransitionId } from "./types";
import "./tokens.css";

export function PageTransitionsLab() {
  const [selectedId, setSelectedId] = useState<TransitionId | null>(null);
  const selected = selectedId ? getTransitionDefinition(selectedId) : undefined;

  const handleEnter = (id: string) => {
    setSelectedId(id as TransitionId);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleBack = () => {
    setSelectedId(null);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <div className="page-transitions-lab min-h-screen bg-black text-white">
      <div className="page-transitions-lab__chrome">
        <Link href="/" className="text-xs tracking-wide">
          ← Maser-Lab
        </Link>
      </div>

      {selected ? (
        <TransitionDetail
          key={selected.id}
          definition={selected}
          onBack={handleBack}
        />
      ) : (
        <TransitionGallery onEnter={handleEnter} />
      )}
    </div>
  );
}
