import type { BrandAsset, CaseStudy, CaseStudySection, NormalizedCaseStudy } from "./types";

const SECTION_ORDER: CaseStudySection["type"][] = [
  "overview",
  "challenge",
  "approach",
  "results",
  "custom",
];

function pickAccentColor(palette: string[]): string {
  const valid = palette.filter((hex) => /^#[0-9A-Fa-f]{3,8}$/.test(hex.trim()));
  if (valid.length >= 2) return valid[1] ?? valid[0] ?? "#1E5F74";
  if (valid.length === 1) return valid[0] ?? "#1E5F74";
  return "#1E5F74";
}

function sortSections(sections: CaseStudySection[]): CaseStudySection[] {
  return [...sections].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a.type);
    const bi = SECTION_ORDER.indexOf(b.type);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function dedupePalette(palette: string[]): string[] {
  const seen = new Set<string>();
  return palette
    .map((c) => c.trim().toUpperCase())
    .filter((c) => {
      if (!/^#[0-9A-F]{3,8}$/.test(c) || seen.has(c)) return false;
      seen.add(c);
      return true;
    });
}

function featuredAssets(assets: BrandAsset[]): BrandAsset[] {
  return assets.filter((a) => a.title.trim() || a.src);
}

/** Validates and optimizes raw intake data for the presentation layer. */
export function normalizeCaseStudy(raw: CaseStudy): NormalizedCaseStudy {
  const palette = dedupePalette(raw.palette.length ? raw.palette : ["#0B1F33", "#E8E4DC"]);
  const sections = sortSections(
    raw.sections.filter((s) => s.title.trim() || s.body.trim()),
  );

  return {
    ...raw,
    client: raw.client.trim() || "Untitled client",
    projectTitle: raw.projectTitle.trim() || raw.client.trim() || "Brand case study",
    tagline: raw.tagline.trim(),
    summary: raw.summary.trim(),
    services: raw.services.map((s) => s.trim()).filter(Boolean),
    palette,
    sections,
    assets: raw.assets.filter((a) => a.title.trim() || a.src),
    typography: raw.typography.filter((t) => t.role.trim() || t.family.trim()),
    displayTitle: raw.projectTitle.trim() || raw.client.trim(),
    accentColor: pickAccentColor(palette),
    sectionOrder: sections,
    featuredAssets: featuredAssets(raw.assets),
    updatedAt: raw.updatedAt || Date.now(),
  };
}

export function createEmptyCaseStudy(): CaseStudy {
  const id = `case-${crypto.randomUUID().slice(0, 8)}`;
  const now = Date.now();
  return {
    id,
    client: "",
    projectTitle: "",
    tagline: "",
    summary: "",
    year: String(new Date().getFullYear()),
    services: [],
    hero: { src: "", alt: "" },
    palette: ["#0B1F33", "#E8E4DC"],
    typography: [],
    assets: [],
    sections: [
      { id: `${id}-overview`, type: "overview", title: "Overview", body: "" },
      { id: `${id}-challenge`, type: "challenge", title: "Challenge", body: "" },
      { id: `${id}-approach`, type: "approach", title: "Approach", body: "" },
      { id: `${id}-results`, type: "results", title: "Results", body: "" },
    ],
    updatedAt: now,
  };
}
