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
import { ProjectBrowser, useProjectLibrary } from "./studio";
import type { AppRoute, ComponentId } from "../types";
import type { ProjectRecord } from "../projects";
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
import { cn } from "@/lib/utils";
import "../tokens.css";

const MOBILE_WORKSPACE_MQ = "(max-width: 900px)";

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
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  const libraryApi = useProjectLibrary();

  useEffect(() => {
    const sync = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_WORKSPACE_MQ);
    const sync = () => setIsCompactViewport(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const isMobileEditor =
    isCompactViewport &&
    (route.view === "component" || route.view === "playground");

  useEffect(() => {
    if (!isMobileEditor) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [isMobileEditor]);

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
        "4": { view: "projects" },
        "5": { view: "presets" },
        "6": { view: "playground" },
        "7": { view: "docs" },
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

  const openProject = useCallback(
    (project: ProjectRecord) => {
      setPendingProjectId(project.id);
      libraryApi.setLastOpened(project.id);
      navigate({ view: "component", id: project.snapshot.componentId });
    },
    [libraryApi, navigate],
  );

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
        key={`${route.id}:${pendingProjectId ?? "default"}`}
        componentId={route.id}
        reducedMotion={reducedMotion}
        onBack={() => navigate({ view: "components" })}
        projectId={pendingProjectId}
        library={libraryApi.library}
        onLibraryChange={libraryApi.setLibrary}
        onOpenStudio={() => navigate({ view: "projects" })}
        onProjectConsumed={() => setPendingProjectId(null)}
      />
    ) : (
      <div className="mde-page">
        <p>Unknown component.</p>
      </div>
    );
  } else if (route.view === "materials") {
    main = <MaterialsPage onNavigate={navigate} />;
  } else if (route.view === "projects") {
    main = (
      <ProjectBrowser
        library={libraryApi.library}
        onOpen={openProject}
        onDuplicate={libraryApi.duplicate}
        onDelete={libraryApi.removeProject}
        onRename={libraryApi.rename}
        onFavorite={libraryApi.favorite}
        onImport={(raw) => {
          try {
            libraryApi.importRaw(raw);
          } catch (err) {
            window.alert(
              err instanceof Error ? err.message : "Import failed.",
            );
          }
        }}
        onExport={(project) => {
          const blob = new Blob([libraryApi.exportOne(project)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.mde.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        onNavigate={navigate}
        onViewChange={libraryApi.setView}
      />
    );
  } else if (route.view === "presets") {
    main = <PresetsPage onNavigate={navigate} />;
  } else if (route.view === "playground") {
    main = (
      <ComponentPlayground
        componentId="card"
        reducedMotion={reducedMotion}
        onBack={() => navigate({ view: "overview" })}
        projectId={pendingProjectId}
        library={libraryApi.library}
        onLibraryChange={libraryApi.setLibrary}
        onOpenStudio={() => navigate({ view: "projects" })}
        onProjectConsumed={() => setPendingProjectId(null)}
      />
    );
  } else if (route.view === "docs") {
    main = <DocsPage topic={route.topic} />;
  }

  return (
    <div
      className={cn("mde-app", isMobileEditor && "mde-app--mobile-editor")}
      aria-label="Maser Dither Engine"
    >
      {!isMobileEditor ? (
        <div className="mde-app__chrome">
          <Link href="/" className="mde-app__back">
            ← Maser-Lab
          </Link>
        </div>
      ) : null}
      <div className="mde-app__body">
        {!isMobileEditor ? (
          <Sidebar
            route={route}
            onNavigate={navigate}
            favorites={favorites}
            recent={recent}
            onToggleFavorite={onToggleFavorite}
            reducedMotion={reducedMotion}
            onToggleReducedMotion={() => setForceReduced((v) => !v)}
          />
        ) : null}
        <main className="mde-app__main">{main}</main>
      </div>
    </div>
  );
}
