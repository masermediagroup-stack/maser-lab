"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { OverviewPage } from "./OverviewPage";
import { ComponentPlayground } from "./ComponentPlayground";
import { MaterialsPage } from "./MaterialsPage";
import { PresetsPage } from "./PresetsPage";
import { DocsPage } from "./DocsPage";
import { ComponentsIndex } from "./ComponentsIndex";
import type { AppRoute, ComponentId } from "../types";
import {
  loadFavorites,
  loadRecent,
  parseHash,
  pushRecent,
  routeToHash,
  saveFavorites,
  toggleFavorite,
} from "../lib/persistence";
import { ComponentCatalog } from "../components/registry";
import "../tokens.css";

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

/**
 * Maser Dither Engine lab shell — creative-software navigation over a shared renderer.
 */
export function DitherEngineApp() {
  const osReduced = useOsReducedMotion();
  const [forceReduced, setForceReduced] = useState(false);
  const reducedMotion = osReduced || forceReduced;

  const [route, setRoute] = useState<AppRoute>(() =>
    typeof window !== "undefined"
      ? parseHash(window.location.hash)
      : { view: "overview" },
  );
  const [favorites, setFavorites] = useState<ComponentId[]>(() =>
    typeof window !== "undefined" ? loadFavorites() : [],
  );
  const [recent, setRecent] = useState<ComponentId[]>(() =>
    typeof window !== "undefined" ? loadRecent() : [],
  );

  useEffect(() => {
    const sync = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const navigate = useCallback((next: AppRoute) => {
    const hash = routeToHash(next);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      setRoute(next);
    }
    if (next.view === "component") {
      setRecent(pushRecent(next.id));
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const map: Record<string, AppRoute> = {
        "1": { view: "overview" },
        "2": { view: "components" },
        "3": { view: "materials" },
        "4": { view: "presets" },
        "5": { view: "playground" },
        "6": { view: "docs" },
      };
      const next = map[e.key];
      if (next) {
        e.preventDefault();
        navigate(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const openComponent = useCallback(
    (id: ComponentId) => navigate({ view: "component", id }),
    [navigate],
  );

  const onToggleFavorite = useCallback((id: ComponentId) => {
    setFavorites((prev) => {
      const next = toggleFavorite(id, prev);
      saveFavorites(next);
      return next;
    });
  }, []);

  let main: ReactNode = null;
  if (route.view === "overview") {
    main = (
      <OverviewPage
        onOpenComponent={openComponent}
        onNavigate={navigate}
      />
    );
  } else if (route.view === "components") {
    main = <ComponentsIndex onOpen={openComponent} />;
  } else if (route.view === "component") {
    const exists = ComponentCatalog.get(route.id);
    main = exists ? (
      <ComponentPlayground
        key={route.id}
        componentId={route.id}
        reducedMotion={reducedMotion}
        onBack={() => navigate({ view: "components" })}
      />
    ) : (
      <div className="mde-page">
        <p>Unknown component.</p>
      </div>
    );
  } else if (route.view === "materials") {
    main = <MaterialsPage onNavigate={navigate} />;
  } else if (route.view === "presets") {
    main = <PresetsPage onNavigate={navigate} />;
  } else if (route.view === "playground") {
    main = (
      <ComponentPlayground
        componentId="card"
        reducedMotion={reducedMotion}
        onBack={() => navigate({ view: "overview" })}
      />
    );
  } else if (route.view === "docs") {
    main = <DocsPage topic={route.topic} />;
  }

  return (
    <div className="mde-app" aria-label="Maser Dither Engine">
      <div className="mde-app__chrome">
        <Link href="/" className="mde-app__back">
          ← Maser-Lab
        </Link>
      </div>
      <div className="mde-app__body">
        <Sidebar
          route={route}
          onNavigate={navigate}
          favorites={favorites}
          recent={recent}
          onToggleFavorite={onToggleFavorite}
          reducedMotion={reducedMotion}
          onToggleReducedMotion={() => setForceReduced((v) => !v)}
        />
        <main className="mde-app__main">{main}</main>
      </div>
    </div>
  );
}
