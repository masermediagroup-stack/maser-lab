export type BrandAssetKind =
  | "logo"
  | "color"
  | "typography"
  | "photo"
  | "guideline"
  | "video";

export type BrandMedia = {
  src: string;
  alt: string;
};

export type BrandAsset = {
  id: string;
  kind: BrandAssetKind;
  title: string;
  src?: string;
  alt?: string;
  meta?: Record<string, string>;
};

export type CaseStudySection = {
  id: string;
  type: "overview" | "challenge" | "approach" | "results" | "custom";
  title: string;
  body: string;
};

export type TypographySpec = {
  id: string;
  role: string;
  family: string;
  sample: string;
  weight?: string;
};

export type CaseStudy = {
  id: string;
  client: string;
  projectTitle: string;
  tagline: string;
  summary: string;
  year?: string;
  services: string[];
  hero: BrandMedia;
  logo?: BrandMedia;
  palette: string[];
  typography: TypographySpec[];
  assets: BrandAsset[];
  sections: CaseStudySection[];
  comparison?: {
    before: BrandMedia;
    after: BrandMedia;
  };
  /** Public URL slug — set when published to cloud */
  shareSlug?: string;
  published?: boolean;
  cloudSyncedAt?: number;
  updatedAt: number;
};

/** Normalized, presentation-ready case study derived from intake data. */
export type NormalizedCaseStudy = CaseStudy & {
  displayTitle: string;
  accentColor: string;
  sectionOrder: CaseStudySection[];
  featuredAssets: BrandAsset[];
};

export type AppMode = "index" | "intake" | "present";

export type BrandCaseStudioAppProps = {
  initialCases?: CaseStudy[];
  forceReducedMotion?: boolean;
  defaultMode?: AppMode;
  className?: string;
};

export type CaseStore = Record<string, CaseStudy>;
