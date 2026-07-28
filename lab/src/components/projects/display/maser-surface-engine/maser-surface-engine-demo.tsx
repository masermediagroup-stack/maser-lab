"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DemoLabBrand,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { MONOCHROME_DEFAULTS } from "./constants";
import { MaterialRegistry } from "./engine/materials/MaterialRegistry";
import { createMonochromeMaterial } from "./engine/materials/MonochromeMaterial";
import { SurfaceCard } from "./surfaces/SurfaceCard";
import type { MonochromeParams } from "./types";
import { MaterialControls } from "./ui/MaterialControls";
import "./tokens.css";

function useOsReducedMotion(): boolean {
  const [os, setOs] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setOs(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return os;
}

export function MaserSurfaceEngineDemo() {
  const osReduced = useOsReducedMotion();
  const [forceReduced, setForceReduced] = useState(false);
  const reducedMotion = osReduced || forceReduced;
  const [params, setParams] = useState<MonochromeParams>(() =>
    createMonochromeMaterial(),
  );

  const readyMaterials = useMemo(
    () => MaterialRegistry.list().filter((m) => m.status === "ready"),
    [],
  );

  return (
    <div className="mse-root">
      <div className="mse-demo">
        <div className="mse-demo__main">
          <div className="mse-demo__brand">
            <DemoLabBrand />
            <ReducedMotionToggle
              enabled={reducedMotion}
              onToggle={() => setForceReduced((v) => !v)}
            />
          </div>

          <header className="mse-demo__identity">
            <p className="mse-demo__eyebrow">Maser Lab · Display</p>
            <h1 className="mse-demo__title">Maser Surface Engine</h1>
            <p className="mse-demo__support">
              Procedural monochrome materials for interfaces — engineered tonal
              density, not nostalgia.
            </p>
          </header>

          <div className="mse-demo__stage">
            <SurfaceCard
              title="Print Density"
              description="Ordered dither, blue-noise, bloom, and grain as a reusable material system."
              buttonLabel="Explore"
              params={params}
              reducedMotion={reducedMotion}
              onButtonClick={() =>
                setParams(createMonochromeMaterial(MONOCHROME_DEFAULTS))
              }
            />
          </div>
        </div>

        <aside className="mse-demo__aside">
          <h2 className="mse-demo__aside-title">Material · Monochrome</h2>
          <MaterialControls value={params} onChange={setParams} />
          <p className="mse-demo__note">
            Ready materials: {readyMaterials.map((m) => m.label).join(", ")}.
            Future ids reserved in MaterialRegistry ({MaterialRegistry.stubIds.length} stubs).
          </p>
        </aside>
      </div>
    </div>
  );
}
