"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TypeWorld } from "./TypeWorld";
import { TYPE_WORLD_DEFAULTS, TYPE_WORLD_QUOTE } from "./constants";
import { usePrefersReducedMotion } from "./useScrollReveal";
import "./type-world-demo.css";

export function TypeWorldDemo() {
  const osReduced = usePrefersReducedMotion();
  const [reducedPreview, setReducedPreview] = useState(false);
  const [forceFallback, setForceFallback] = useState(false);
  const [quote, setQuote] = useState<string>(TYPE_WORLD_QUOTE);
  const [textColor, setTextColor] = useState<string>(TYPE_WORLD_DEFAULTS.textColor);
  const [dragSensitivity, setDragSensitivity] = useState<number>(
    TYPE_WORLD_DEFAULTS.dragSensitivity,
  );
  const [inertia, setInertia] = useState<number>(TYPE_WORLD_DEFAULTS.inertia);
  const [pitchLimit, setPitchLimit] = useState<number>(TYPE_WORLD_DEFAULTS.pitchLimit);
  const [revealEnd, setRevealEnd] = useState<number>(TYPE_WORLD_DEFAULTS.revealEnd);

  const reducedMotion = osReduced || reducedPreview;

  const reset = () => {
    setQuote(TYPE_WORLD_QUOTE);
    setTextColor(TYPE_WORLD_DEFAULTS.textColor);
    setDragSensitivity(TYPE_WORLD_DEFAULTS.dragSensitivity);
    setInertia(TYPE_WORLD_DEFAULTS.inertia);
    setPitchLimit(TYPE_WORLD_DEFAULTS.pitchLimit);
    setRevealEnd(TYPE_WORLD_DEFAULTS.revealEnd);
    setForceFallback(false);
    setReducedPreview(false);
  };

  const sensitivityLabel = useMemo(
    () => dragSensitivity.toFixed(4),
    [dragSensitivity],
  );

  return (
    <div className="type-world-demo">
      <header className="type-world-demo__bar">
        <Link href="/" className="type-world-demo__back">
          ← Lab
        </Link>
        <div className="type-world-demo__identity">
          <p className="type-world-demo__eyebrow">Scroll</p>
          <h1 className="type-world-demo__title">TYPE WORLD</h1>
        </div>
        <button
          type="button"
          className="type-world-demo__toggle"
          aria-label="Toggle reduced motion"
          aria-pressed={reducedPreview || osReduced}
          onClick={() => setReducedPreview((value) => !value)}
        >
          Reduced motion: {reducedMotion ? "on" : "off"}
        </button>
      </header>

      <div className="type-world-demo__lead">
        <p>An editorial sphere.</p>
        <p>Scroll until the sentence arrives.</p>
      </div>

      <TypeWorld
        quote={quote}
        textColor={textColor}
        dragSensitivity={dragSensitivity}
        inertia={inertia}
        pitchLimit={pitchLimit}
        revealEnd={revealEnd}
        reducedMotion={reducedMotion}
        forceFallback={forceFallback}
      />

      <footer className="type-world-demo__after">
        <p>The same sentence exists on the far side of the world.</p>
      </footer>

      <details className="type-world-demo__tune">
        <summary>Parameters</summary>
        <div className="type-world-demo__tune-grid">
          <label className="type-world-demo__field">
            <span>Quote</span>
            <textarea
              rows={4}
              value={quote}
              onChange={(event) => setQuote(event.target.value)}
            />
          </label>
          <label className="type-world-demo__field">
            <span>Ink</span>
            <input
              type="color"
              value={textColor}
              onChange={(event) => setTextColor(event.target.value)}
            />
          </label>
          <label className="type-world-demo__field">
            <span>Drag {sensitivityLabel}</span>
            <input
              type="range"
              min={0.002}
              max={0.012}
              step={0.0002}
              value={dragSensitivity}
              onChange={(event) =>
                setDragSensitivity(Number(event.target.value))
              }
            />
          </label>
          <label className="type-world-demo__field">
            <span>Inertia {inertia.toFixed(2)}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={inertia}
              onChange={(event) => setInertia(Number(event.target.value))}
            />
          </label>
          <label className="type-world-demo__field">
            <span>Pitch {pitchLimit}°</span>
            <input
              type="range"
              min={8}
              max={28}
              step={1}
              value={pitchLimit}
              onChange={(event) => setPitchLimit(Number(event.target.value))}
            />
          </label>
          <label className="type-world-demo__field">
            <span>Reveal {(revealEnd * 100).toFixed(0)}%</span>
            <input
              type="range"
              min={0.16}
              max={0.4}
              step={0.01}
              value={revealEnd}
              onChange={(event) => setRevealEnd(Number(event.target.value))}
            />
          </label>
          <label className="type-world-demo__check">
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(event) => setForceFallback(event.target.checked)}
            />
            Static fallback
          </label>
          <button
            type="button"
            className="type-world-demo__reset"
            onClick={reset}
          >
            Reset
          </button>
        </div>
        <p className="type-world-demo__api">
          Product:{" "}
          <code>{`import { TypeWorld } from "@/components/projects/scroll/type-world"`}</code>
        </p>
      </details>
    </div>
  );
}
