"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoBackButton } from "@/components/lab/demo-chrome";
import { SVG3DRotator } from "./SVG3DRotator";
import { CasualQuestLogo } from "./placeholder-logo";
import { SVG3D_DEFAULTS } from "./types";
import "./demo.css";

export function SVG3DRotatorDemo() {
  const [autoRotate, setAutoRotate] = useState(true);
  const [motionOn, setMotionOn] = useState(true);

  return (
    <div className="svg3d-demo">
      <div className="svg3d-demo__chrome">
        <DemoBackButton />
        <button
          type="button"
          className="svg3d-demo__motion-toggle"
          onClick={() => {
            setMotionOn((v) => !v);
            setAutoRotate((v) => !v);
          }}
          aria-pressed={motionOn}
        >
          Motion {motionOn ? "On" : "Off"}
        </button>
      </div>

      <main className="svg3d-demo__main">
        <span className="svg3d-demo__tag">casual__quest</span>

        <SVG3DRotator
          svg={CasualQuestLogo}
          width={420}
          height={420}
          depth={18}
          strokeColor="#ffffff"
          strokeWidth={2}
          faceColor="#050505"
          backColor="#0d0d0d"
          rotationSpeed={18}
          direction="clockwise"
          gradientMode="radial"
          gradientCenter="#3D71FF"
          gradientEdge="#B86ACF"
          ambientGlow="#4F82FF"
          autoRotate={autoRotate}
          enableHoverEffects
          hoverPause={false}
          aria-label="Casual quest rotating logo sculpture"
        />

        <p className="svg3d-demo__caption">
          LAID-BACK COMPETITIVE SERIES DRIVEN BY PERSONALITIES AND SHARED
          MOMENTS. FUN COMES FIRST.
        </p>
      </main>

      <footer className="svg3d-demo__footer">
        <p className="svg3d-demo__hint">
          Hover to accelerate · Upload any SVG via{" "}
          <code className="svg3d-demo__code">&lt;SVG3DRotator svg=&#123;Logo&#125; /&gt;</code>
        </p>
        <Link href="/" className="svg3d-demo__link">
          ← All projects
        </Link>
      </footer>
    </div>
  );
}

export function SVG3DRotatorExampleMinimal() {
  return (
    <SVG3DRotator
      svg={CasualQuestLogo}
      width={SVG3D_DEFAULTS.width}
      height={SVG3D_DEFAULTS.height}
    />
  );
}
