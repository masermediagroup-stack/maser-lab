"use client";

import { Suspense, useCallback, useId, useState, type MouseEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DemoBackButton,
  DemoControlMenu,
  LabButton,
  LabControlGroup,
  LabSelect,
  ReducedMotionToggle,
} from "@/components/lab/demo-chrome";
import { TylerGlassNav } from "./tyler-glass-nav";
import type { FrostNavId, FrostNavShell } from "./types";
import "./tyler-glass-nav-demo.css";

const DEMO_PATH = "/demos/tyler-glass-nav";

const SHELL_OPTIONS: { value: string; label: string }[] = [
  { value: "auto", label: "Pointer (auto)" },
  { value: "dim-peek", label: "Dim peek" },
  { value: "glowing-peek", label: "Glowing peek" },
  { value: "expanded-quiet", label: "Expanded quiet" },
  { value: "expanded-slot", label: "Expanded + slot glow" },
  { value: "active-route", label: "Active route (Work)" },
];

function stubFromSearch(raw: string | null): string {
  if (raw === "/work" || raw === "/contact" || raw === "/") return raw;
  return "/";
}

function pageCopy(path: string): { title: string; line: string } {
  if (path === "/work") {
    return { title: "Work", line: "Selected route /work — disc remounts at peek." };
  }
  if (path === "/contact") {
    return { title: "Contact", line: "Selected route /contact — disc remounts at peek." };
  }
  return { title: "Home", line: "Selected route / — disc starts at peek." };
}

function TylerGlassNavDemoInner() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = stubFromSearch(params.get("r"));
  const copy = pageCopy(pathname);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const [forceExpanded, setForceExpanded] = useState(false);
  const [forceReducedTransparency, setForceReducedTransparency] = useState(false);
  const [matrix, setMatrix] = useState("auto");

  const forceShell: FrostNavShell | undefined =
    matrix === "dim-peek" ||
    matrix === "glowing-peek" ||
    matrix === "expanded-quiet" ||
    matrix === "expanded-slot"
      ? matrix
      : matrix === "active-route"
        ? "expanded-quiet"
        : undefined;

  const forceSlotHover: FrostNavId | null = matrix === "expanded-slot" ? "work" : null;
  const matrixPath = matrix === "active-route" ? "/work" : pathname;

  const onNavigate = useCallback(
    (href: string, event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      router.push(`${DEMO_PATH}?r=${encodeURIComponent(href)}`);
    },
    [router],
  );

  return (
    <div className="tv-frost-nav-demo relative min-h-dvh bg-[#05070a] text-[#e8eef6] max-sm:has-[.lab-dock-open]:overflow-visible">
      <DemoControlMenu>
        <DemoBackButton />
        <p className="lab-type-label text-[var(--lab-text-primary)]">Tyler Vea frost disc</p>
        <p className="lab-type-caption text-[var(--lab-text-secondary)]">
          CSS glass only. Locked Elite Pixel Guy fills. Dr Leak marks.
        </p>
        <ReducedMotionToggle
          enabled={forceReducedMotion}
          onToggle={() => setForceReducedMotion((v) => !v)}
        />
        <LabButton
          type="button"
          variant={forceExpanded ? "accent" : "ghost"}
          aria-pressed={forceExpanded}
          onClick={() => setForceExpanded((v) => !v)}
        >
          Force expanded
        </LabButton>
        <LabButton
          type="button"
          variant={forceReducedTransparency ? "accent" : "ghost"}
          aria-pressed={forceReducedTransparency}
          onClick={() => setForceReducedTransparency((v) => !v)}
        >
          Reduced transparency
        </LabButton>
        <LabControlGroup label="State matrix">
          <LabSelect
            id="tv-frost-shell"
            label="Shell"
            value={matrix}
            options={SHELL_OPTIONS}
            onChange={setMatrix}
          />
        </LabControlGroup>
      </DemoControlMenu>

      <div className="tv-frost-nav-demo__field lab-demo-field">
        <div className="tv-frost-nav-demo__wash" aria-hidden="true" />
        <div className="tv-frost-nav-demo__copy lab-demo-inset">
          <p className="lab-type-caption text-white/50">{copy.title}</p>
          <p className="lab-type-body mt-2 max-w-sm text-white/70">{copy.line}</p>
        </div>
        <TylerGlassNav
          key={pathname}
          pathname={matrixPath}
          forceExpanded={forceExpanded}
          forceReducedMotion={forceReducedMotion}
          forceReducedTransparency={forceReducedTransparency}
          forceShell={forceShell}
          forceSlotHover={forceSlotHover}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}

export function TylerGlassNavDemo() {
  const fallbackId = useId();
  return (
    <Suspense
      fallback={
        <div
          id={fallbackId}
          className="min-h-dvh bg-[#05070a]"
          aria-label="Tyler Vea frost disc navigation"
        />
      }
    >
      <TylerGlassNavDemoInner />
    </Suspense>
  );
}
