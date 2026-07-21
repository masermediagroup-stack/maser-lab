export type BuiltInFontId =
  | "geist-pixel-square"
  | "geist-pixel-grid"
  | "geist-pixel-circle"
  | "geist-pixel-triangle"
  | "geist-pixel-line"
  | "custom";

export type FontSource = {
  id: BuiltInFontId;
  label: string;
  /** CSS font-family stack used for canvas fillText. */
  family: string;
  /** Primary face name for document.fonts.load / check (no quotes). */
  loadName: string;
  /** Optional stylesheet URL to inject when selecting this font. */
  stylesheetUrl?: string;
};

export const BUILT_IN_FONTS: FontSource[] = [
  {
    id: "geist-pixel-square",
    label: "Geist Pixel Square",
    family: '"Geist Pixel Square", "Geist Pixel", ui-monospace, monospace',
    loadName: "Geist Pixel Square",
    stylesheetUrl:
      "https://fonts.googleapis.com/css2?family=Geist+Pixel+Square:wght@400&display=swap",
  },
  {
    id: "geist-pixel-grid",
    label: "Geist Pixel Grid",
    family: '"Geist Pixel Grid", "Geist Pixel", ui-monospace, monospace',
    loadName: "Geist Pixel Grid",
    stylesheetUrl:
      "https://fonts.googleapis.com/css2?family=Geist+Pixel+Grid:wght@400&display=swap",
  },
  {
    id: "geist-pixel-circle",
    label: "Geist Pixel Circle",
    family: '"Geist Pixel Circle", "Geist Pixel", ui-monospace, monospace',
    loadName: "Geist Pixel Circle",
    stylesheetUrl:
      "https://fonts.googleapis.com/css2?family=Geist+Pixel+Circle:wght@400&display=swap",
  },
  {
    id: "geist-pixel-triangle",
    label: "Geist Pixel Triangle",
    family: '"Geist Pixel Triangle", "Geist Pixel", ui-monospace, monospace',
    loadName: "Geist Pixel Triangle",
    stylesheetUrl:
      "https://fonts.googleapis.com/css2?family=Geist+Pixel+Triangle:wght@400&display=swap",
  },
  {
    id: "geist-pixel-line",
    label: "Geist Pixel Line",
    family: '"Geist Pixel Line", "Geist Pixel", ui-monospace, monospace',
    loadName: "Geist Pixel Line",
    stylesheetUrl:
      "https://fonts.googleapis.com/css2?family=Geist+Pixel+Line:wght@400&display=swap",
  },
  {
    id: "custom",
    label: "Custom Pixel Font",
    family: "inherit",
    loadName: "",
  },
];

const injectedSheets = new Set<string>();
const loadedFaces = new Map<string, FontFace>();

export function getFontSource(id: BuiltInFontId): FontSource {
  return BUILT_IN_FONTS.find((f) => f.id === id) ?? BUILT_IN_FONTS[0]!;
}

function injectStylesheet(url: string) {
  if (typeof document === "undefined" || injectedSheets.has(url)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
  injectedSheets.add(url);
}

export type ResolveFontInput = {
  fontVariant: BuiltInFontId;
  customFontFamily?: string;
  customFontUrl?: string;
  fontWeight?: string;
  fontStyle?: string;
  fontSize: number;
};

export type ResolveFontResult = {
  ok: boolean;
  family: string;
  loadName: string;
  error?: string;
};

/**
 * Resolve and load the active font. Never silently falls back to another face —
 * returns ok:false when the requested face cannot be confirmed.
 */
export async function resolveAndLoadFont(input: ResolveFontInput): Promise<ResolveFontResult> {
  const weight = input.fontWeight || "400";
  const style = input.fontStyle || "normal";

  if (input.fontVariant === "custom") {
    const name = (input.customFontFamily || "").trim();
    if (!name) {
      return { ok: false, family: "", loadName: "", error: "Enter a custom font-family name." };
    }
    const url = (input.customFontUrl || "").trim();
    try {
      if (url) {
        const key = `${name}::${url}`;
        let face = loadedFaces.get(key);
        if (!face) {
          face = new FontFace(name, `url(${url})`, { weight, style });
          await face.load();
          document.fonts.add(face);
          loadedFaces.set(key, face);
        }
      }
      if (document.fonts) {
        await document.fonts.ready;
        await document.fonts.load(`${style} ${weight} ${input.fontSize}px "${name}"`);
        const ok = document.fonts.check(`${style} ${weight} ${input.fontSize}px "${name}"`);
        if (!ok) {
          return {
            ok: false,
            family: `"${name}"`,
            loadName: name,
            error: `Custom font "${name}" did not load. Check the family name or URL.`,
          };
        }
      }
      return { ok: true, family: `"${name}", monospace`, loadName: name };
    } catch (err) {
      return {
        ok: false,
        family: `"${name}"`,
        loadName: name,
        error: err instanceof Error ? err.message : "Failed to load custom font.",
      };
    }
  }

  const source = getFontSource(input.fontVariant);
  if (source.stylesheetUrl) injectStylesheet(source.stylesheetUrl);
  // Lab globals already import Geist Pixel; keep available for Square which often resolves as "Geist Pixel".
  injectStylesheet("https://fonts.googleapis.com/css2?family=Geist+Pixel&display=swap");

  try {
    if (document.fonts) {
      await document.fonts.ready;
      const candidates =
        source.id === "geist-pixel-square"
          ? [source.loadName, "Geist Pixel"]
          : [source.loadName];

      let loadedName: string | null = null;
      for (const name of candidates) {
        await document.fonts.load(`${style} ${weight} ${input.fontSize}px "${name}"`);
        if (document.fonts.check(`${style} ${weight} ${input.fontSize}px "${name}"`)) {
          loadedName = name;
          break;
        }
      }

      if (!loadedName) {
        return {
          ok: false,
          family: source.family,
          loadName: source.loadName,
          error: `Font "${source.loadName}" is not available. Keeping the previous working font.`,
        };
      }

      const family =
        loadedName === "Geist Pixel"
          ? '"Geist Pixel", ui-monospace, monospace'
          : source.family;
      return { ok: true, family, loadName: loadedName };
    }
  } catch (err) {
    return {
      ok: false,
      family: source.family,
      loadName: source.loadName,
      error: err instanceof Error ? err.message : "Font load failed.",
    };
  }

  return { ok: false, family: source.family, loadName: source.loadName, error: "Fonts API unavailable." };
}
