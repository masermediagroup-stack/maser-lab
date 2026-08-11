/**
 * Product export surface for Brand Case Studio.
 * Lab demo chrome lives in `brand-case-studio-demo.tsx` and is registered
 * from `lab/src/components/projects/registry.ts` — do not re-export it here.
 */
export { BrandCaseStudioApp } from "./brand-case-studio";
export type {
  AppMode,
  BrandAsset,
  BrandAssetKind,
  BrandCaseStudioAppProps,
  BrandMedia,
  CaseStudy,
  CaseStudySection,
  CaseStore,
  NormalizedCaseStudy,
  TypographySpec,
} from "./types";
export { SAMPLE_CASES } from "./data";
export { normalizeCaseStudy, createEmptyCaseStudy } from "./normalize";
export {
  loadCaseStore,
  saveCaseStore,
  exportCasesJson,
  importCasesJson,
} from "./storage";
