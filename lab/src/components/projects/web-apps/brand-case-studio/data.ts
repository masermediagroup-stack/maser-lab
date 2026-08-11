import type { CaseStudy } from "./types";

/** Sample case study — replace via intake or pass `initialCases` to the app. */
export const SAMPLE_CASES: CaseStudy[] = [
  {
    id: "summitpath-trail-co",
    client: "SummitPath Trail Co.",
    projectTitle: "SummitPath Brand Identity",
    tagline: "Built for the long climb",
    summary:
      "A complete brand system for an outdoor apparel startup — logo suite, color palette, typography, and launch photography direction.",
    year: "2026",
    services: ["Brand Strategy", "Visual Identity", "Art Direction"],
    hero: {
      src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80",
      alt: "Mountain ridge at golden hour",
    },
    logo: {
      src: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=400&q=80",
      alt: "SummitPath wordmark on dark background",
    },
    palette: ["#0B1F33", "#1E5F74", "#4A9B8E", "#E8E4DC", "#F5A623"],
    typography: [
      {
        id: "tp-display",
        role: "Display",
        family: "Instrument Serif",
        sample: "SummitPath",
        weight: "400",
      },
      {
        id: "tp-body",
        role: "Body",
        family: "Instrument Sans",
        sample: "Every trail tells a story. We make gear that keeps up.",
        weight: "400",
      },
    ],
    assets: [
      {
        id: "asset-logo-primary",
        kind: "logo",
        title: "Primary wordmark",
        src: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=80",
        alt: "SummitPath primary logo",
      },
      {
        id: "asset-logo-mark",
        kind: "logo",
        title: "Mountain mark",
        src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
        alt: "SummitPath icon mark",
      },
      {
        id: "asset-photo-1",
        kind: "photo",
        title: "Campaign hero",
        src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        alt: "Trail runner on ridge",
      },
      {
        id: "asset-photo-2",
        kind: "photo",
        title: "Product flat lay",
        src: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80",
        alt: "Outdoor gear flat lay",
      },
    ],
    sections: [
      {
        id: "sec-overview",
        type: "overview",
        title: "Overview",
        body: "SummitPath needed a brand that felt earned — not performative. The identity balances technical credibility with the emotional pull of open trail.",
      },
      {
        id: "sec-challenge",
        type: "challenge",
        title: "Challenge",
        body: "Competing in a crowded outdoor market with a limited launch budget. The brand had to read premium at a glance and scale across web, packaging, and retail without a full re-shoot every season.",
      },
      {
        id: "sec-approach",
        type: "approach",
        title: "Approach",
        body: "We anchored the system in a deep alpine palette and a serif display paired with a clean sans for UI. Photography direction favors natural light, negative space, and human scale against landscape.",
      },
      {
        id: "sec-results",
        type: "results",
        title: "Results",
        body: "Launch site conversion improved 34% in the first month. The client team uses the asset kit for all partner decks without design support.",
      },
    ],
    comparison: {
      before: {
        src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80",
        alt: "Previous generic outdoor brand look",
      },
      after: {
        src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
        alt: "SummitPath brand direction applied",
      },
    },
    updatedAt: Date.now(),
  },
];
