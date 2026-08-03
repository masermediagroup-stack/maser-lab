"use client";

import { useMemo, useState } from "react";
import { SurfaceCanvas } from "../react/SurfaceCanvas";
import { useLiveThumbCache } from "../react/useLiveThumbCache";
import {
  createDefaultLayers,
  DEFAULT_MATERIAL_PARAMS,
  type EngineMaterialId,
  type MaterialEngineConfig,
  type MaterialFamilyId,
} from "../engine/material";
import {
  MATERIAL_FAMILIES,
  PROCEDURAL_MATERIALS,
  getMaterialDefinition,
  applyMaterialDefaults,
} from "../engine/material/catalog";
import { MONOCHROME_DEFAULTS } from "../constants";
import { DEFAULT_LIGHT_SHAPE } from "../engine/lighting";
import { DEFAULT_DITHER_CONFIG } from "../engine/dither";
import { DEFAULT_COLOR_MATERIAL } from "../engine/color/types";
import { DEFAULT_ANIMATION_CONFIG } from "../engine/animation/types";
import type { AppRoute } from "../types";
import { cn } from "@/lib/utils";

type MaterialsPageProps = {
  onNavigate: (route: AppRoute) => void;
};

type CompareMode = "side" | "swipe" | "toggle";
type LayoutMode = "grid" | "rail";
type BrowseFilter = "all" | "favorites" | "recent";

function configFor(id: EngineMaterialId): MaterialEngineConfig {
  return {
    materialId: id,
    params: {
      ...DEFAULT_MATERIAL_PARAMS,
      ...applyMaterialDefaults(id),
    },
    layers: createDefaultLayers(id),
    lowQuality: false,
  };
}

function loadFavorites(): EngineMaterialId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("mde-material-favorites");
    return raw ? (JSON.parse(raw) as EngineMaterialId[]) : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: EngineMaterialId[]) {
  try {
    localStorage.setItem("mde-material-favorites", JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function loadRecent(): EngineMaterialId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("mde-material-recent");
    return raw ? (JSON.parse(raw) as EngineMaterialId[]) : [];
  } catch {
    return [];
  }
}

function pushRecent(id: EngineMaterialId, current: EngineMaterialId[]) {
  const next = [id, ...current.filter((x) => x !== id)].slice(0, 12);
  try {
    localStorage.setItem("mde-material-recent", JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function MaterialsPage({ onNavigate }: MaterialsPageProps) {
  const [family, setFamily] = useState<MaterialFamilyId | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<EngineMaterialId>("paper");
  const [favorites, setFavorites] = useState<EngineMaterialId[]>(loadFavorites);
  const [recent, setRecent] = useState<EngineMaterialId[]>(loadRecent);
  const [browse, setBrowse] = useState<BrowseFilter>("all");
  const [layout, setLayout] = useState<LayoutMode>("grid");
  const [hoverId, setHoverId] = useState<EngineMaterialId | null>(null);
  const [compare, setCompare] = useState(false);
  const [compareB, setCompareB] = useState<EngineMaterialId>("chrome");
  const [compareMode, setCompareMode] = useState<CompareMode>("side");
  const [toggleShowA, setToggleShowA] = useState(true);
  const [swipe, setSwipe] = useState(50);

  const materialIds = useMemo(
    () => PROCEDURAL_MATERIALS.map((m) => m.id) as EngineMaterialId[],
    [],
  );

  const thumbScene = useMemo(
    () => ({
      params: {
        ...MONOCHROME_DEFAULTS,
        contrast: 1.25,
        bloom: 0.45,
        grainAmount: 0.07,
      },
      color: {
        ...DEFAULT_COLOR_MATERIAL,
        colorEnabled: true,
        paletteId: "pearl",
      },
      light: { ...DEFAULT_LIGHT_SHAPE },
      dither: { ...DEFAULT_DITHER_CONFIG, algorithm: "bayer" as const },
      animation: {
        ...DEFAULT_ANIMATION_CONFIG,
        modeId: "wave" as const,
        blendDuration: 0,
      },
    }),
    [],
  );

  const thumbs = useLiveThumbCache(materialIds, thumbScene, "materials-v1");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROCEDURAL_MATERIALS.filter((m) => {
      if (family !== "all" && m.family !== family) return false;
      if (browse === "favorites" && !favorites.includes(m.id)) return false;
      if (browse === "recent" && !recent.includes(m.id)) return false;
      if (!q) return true;
      return (
        m.label.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.useCases.some((u) => u.toLowerCase().includes(q))
      );
    });
  }, [family, query, browse, favorites, recent]);

  const detail = getMaterialDefinition(selected)!;
  const previewId = hoverId ?? selected;
  const materialA = useMemo(() => configFor(previewId), [previewId]);
  const materialB = useMemo(() => configFor(compareB), [compareB]);

  const sharedPreviewProps = {
    params: {
      ...MONOCHROME_DEFAULTS,
      contrast: 1.2,
      bloom: 0.4,
      grainAmount: 0.08,
    },
    color: { ...DEFAULT_COLOR_MATERIAL, colorEnabled: true },
    light: { ...DEFAULT_LIGHT_SHAPE },
    dither: { ...DEFAULT_DITHER_CONFIG, algorithm: "bayer" as const },
    animation: {
      ...DEFAULT_ANIMATION_CONFIG,
      modeId: "wave" as const,
    },
    reducedMotion: false,
  };

  const toggleFavorite = (id: EngineMaterialId) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      saveFavorites(next);
      return next;
    });
  };

  const selectMaterial = (id: EngineMaterialId) => {
    setSelected(id);
    setHoverId(null);
    setRecent((prev) => pushRecent(id, prev));
  };

  return (
    <div className="mde-page mde-materials">
      <header className="mde-page__header">
        <h1>Materials</h1>
        <p>
          Live procedural previews from the shared renderer — material,
          animation, lighting, palette, and dither in every thumb.
        </p>
      </header>

      <div className="mde-mat-toolbar">
        <input
          type="search"
          className="mde-mat-search"
          placeholder="Search materials…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search materials"
        />
        <div className="mde-preset-row" role="group" aria-label="Browse">
          {(
            [
              ["all", "All"],
              ["favorites", "Favorites"],
              ["recent", "Recent"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={cn("mde-chip", browse === id && "mde-chip--active")}
              aria-pressed={browse === id}
              onClick={() => setBrowse(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mde-preset-row" role="group" aria-label="Layout">
          <button
            type="button"
            className={cn("mde-chip", layout === "grid" && "mde-chip--active")}
            aria-pressed={layout === "grid"}
            onClick={() => setLayout("grid")}
          >
            Grid
          </button>
          <button
            type="button"
            className={cn("mde-chip", layout === "rail" && "mde-chip--active")}
            aria-pressed={layout === "rail"}
            onClick={() => setLayout("rail")}
          >
            Rail
          </button>
        </div>
        <div className="mde-preset-row" role="group" aria-label="Family filter">
          <button
            type="button"
            className={cn("mde-chip", family === "all" && "mde-chip--active")}
            aria-pressed={family === "all"}
            onClick={() => setFamily("all")}
          >
            All families
          </button>
          {MATERIAL_FAMILIES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={cn("mde-chip", family === f.id && "mde-chip--active")}
              aria-pressed={family === f.id}
              title={f.description}
              onClick={() => setFamily(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={cn("mde-btn", compare && "mde-chip--active")}
          aria-pressed={compare}
          onClick={() => setCompare((c) => !c)}
        >
          {compare ? "Exit compare" : "Compare materials"}
        </button>
        <button
          type="button"
          className="mde-btn"
          onClick={() => onNavigate({ view: "animations" })}
        >
          Animation compare
        </button>
      </div>

      <div className="mde-mat-browser">
        <div
          className={cn(
            "mde-mat-grid",
            layout === "rail" && "mde-mat-grid--rail",
          )}
        >
          {filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              className={cn(
                "mde-mat-thumb",
                selected === m.id && "mde-mat-thumb--active",
              )}
              aria-pressed={selected === m.id}
              onClick={() => selectMaterial(m.id)}
              onMouseEnter={() => setHoverId(m.id)}
              onMouseLeave={() => setHoverId(null)}
              onFocus={() => setHoverId(m.id)}
              onBlur={() => setHoverId(null)}
            >
              <div className="mde-mat-thumb__preview" aria-hidden>
                {thumbs[m.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- live blit data URL
                  <img
                    className="mde-mat-thumb__live"
                    src={thumbs[m.id]}
                    alt=""
                  />
                ) : (
                  <div
                    className="mde-mat-thumb__swatch mde-mat-thumb__swatch--loading"
                    data-material={m.id}
                  />
                )}
              </div>
              <div className="mde-mat-thumb__meta">
                <span className="mde-mat-thumb__title">{m.label}</span>
                <span className="mde-pill" title="Performance tier">
                  {m.performanceTier}
                </span>
              </div>
              <p className="mde-mat-thumb__desc">{m.description}</p>
              <p className="mde-mat-thumb__recs">
                {m.recommendedComponents.slice(0, 2).join(" · ")}
                {m.recommendedAnimations[0]
                  ? ` · ${m.recommendedAnimations[0]}`
                  : ""}
              </p>
              <span className="mde-mat-thumb__fav">
                <button
                  type="button"
                  className={cn(
                    "mde-chip mde-chip--tiny",
                    favorites.includes(m.id) && "mde-chip--active",
                  )}
                  aria-label={
                    favorites.includes(m.id)
                      ? `Unfavorite ${m.label}`
                      : `Favorite ${m.label}`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(m.id);
                  }}
                >
                  ★
                </button>
              </span>
            </button>
          ))}
        </div>

        <aside className="mde-mat-detail" aria-label="Material detail">
          {compare ? (
            <div className="mde-mat-compare">
              <div className="mde-preset-row" role="group" aria-label="Compare mode">
                {(
                  [
                    ["side", "Side-by-side"],
                    ["swipe", "Swipe"],
                    ["toggle", "A/B"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={cn(
                      "mde-chip",
                      compareMode === id && "mde-chip--active",
                    )}
                    aria-pressed={compareMode === id}
                    onClick={() => setCompareMode(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mde-field">
                <span className="mde-field__label">Material B</span>
                <div className="mde-preset-row">
                  {PROCEDURAL_MATERIALS.filter((m) => m.id !== "monochrome").map(
                    (m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={cn(
                          "mde-chip",
                          compareB === m.id && "mde-chip--active",
                        )}
                        onClick={() => setCompareB(m.id)}
                      >
                        {m.label}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <p className="mde-field__hint">
                Identical shared settings — only material structure differs.
              </p>
              {compareMode === "side" ? (
                <div className="mde-compare">
                  <div className="mde-compare__pane">
                    <span className="mde-compare__label">A · {detail.label}</span>
                    <div className="mde-mat-detail__preview">
                      <SurfaceCanvas
                        {...sharedPreviewProps}
                        material={configFor(selected)}
                      />
                    </div>
                  </div>
                  <div className="mde-compare__pane">
                    <span className="mde-compare__label">
                      B · {getMaterialDefinition(compareB)?.label}
                    </span>
                    <div className="mde-mat-detail__preview">
                      <SurfaceCanvas
                        {...sharedPreviewProps}
                        material={materialB}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
              {compareMode === "toggle" ? (
                <div>
                  <button
                    type="button"
                    className="mde-btn"
                    onClick={() => setToggleShowA((v) => !v)}
                  >
                    Show {toggleShowA ? "B" : "A"}
                  </button>
                  <div className="mde-mat-detail__preview mde-mat-detail__preview--lg">
                    <SurfaceCanvas
                      {...sharedPreviewProps}
                      material={toggleShowA ? configFor(selected) : materialB}
                    />
                  </div>
                </div>
              ) : null}
              {compareMode === "swipe" ? (
                <div className="mde-mat-swipe">
                  <div className="mde-mat-detail__preview mde-mat-detail__preview--lg">
                    <SurfaceCanvas
                      {...sharedPreviewProps}
                      material={configFor(selected)}
                    />
                    <div
                      className="mde-mat-swipe__overlay"
                      style={{ width: `${100 - swipe}%` }}
                    >
                      <SurfaceCanvas
                        {...sharedPreviewProps}
                        material={materialB}
                      />
                    </div>
                  </div>
                  <label className="mde-field">
                    <span className="mde-field__label">Divider</span>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      value={swipe}
                      onChange={(e) => setSwipe(Number(e.target.value))}
                    />
                  </label>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <div className="mde-mat-detail__preview mde-mat-detail__preview--lg">
                <SurfaceCanvas
                  {...sharedPreviewProps}
                  material={materialA}
                  aria-label={`${getMaterialDefinition(previewId)?.label ?? "Material"} large preview`}
                />
              </div>
              {hoverId && hoverId !== selected ? (
                <p className="mde-field__hint">
                  Hover preview · {detail.label} stays selected
                </p>
              ) : null}
              <h2>{detail.label}</h2>
              <p>{detail.description}</p>
              <p>
                <span className="mde-pill">{detail.performanceTier}</span>{" "}
                <span className="mde-pill">{detail.family}</span>
              </p>
              <h3>Use cases</h3>
              <ul>
                {detail.useCases.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
              <h3>Recommended components</h3>
              <p>{detail.recommendedComponents.join(" · ") || "—"}</p>
              <h3>Recommended animations</h3>
              <p>{detail.recommendedAnimations.join(" · ") || "—"}</p>
              {detail.poorFitComponents.length > 0 ? (
                <>
                  <h3>Poor fits</h3>
                  <p>{detail.poorFitComponents.join(" · ")}</p>
                </>
              ) : null}
              <h3>Dither</h3>
              <p>
                {detail.recommendedDither.join(", ")} — {detail.ditherNotes}
              </p>
              <h3>Accessibility</h3>
              <p>{detail.accessibilityNotes}</p>
              <p className="mde-field__hint">{detail.reducedMotionNotes}</p>
              <h3>Mobile</h3>
              <p>{detail.mobileNotes}</p>
              <button
                type="button"
                className="mde-btn"
                onClick={() =>
                  onNavigate({
                    view: "component",
                    id: detail.recommendedComponents[0] ?? "card",
                  })
                }
              >
                Open in playground
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
