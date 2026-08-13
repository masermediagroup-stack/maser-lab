"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ReducedMotionToggle } from "@/components/lab/demo-chrome";
import { LogoMaterialGallery } from "./logo-material-gallery";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LogoMaterialGalleryDemo() {
  const systemReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const [previewReduced, setPreviewReduced] = useState(false);
  const reducedMotion = systemReduced || previewReduced;

  return (
    <LogoMaterialGallery
      reducedMotion={reducedMotion}
      headerStart={
        <Link href="/" className="lmg-back">
          ← Lab
        </Link>
      }
      headerEnd={
        <ReducedMotionToggle
          enabled={reducedMotion}
          onToggle={() => setPreviewReduced((value) => !value)}
          className="lmg-motion"
        />
      }
    />
  );
}
