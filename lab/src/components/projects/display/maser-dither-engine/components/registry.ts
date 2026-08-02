import type { ComponentDefinition, ComponentId } from "../types";
import { DitherCard } from "./adapters/DitherCard";
import { DitherNavigation } from "./adapters/DitherNavigation";
import { DitherButton } from "./adapters/DitherButton";
import { DitherScrollbar } from "./adapters/DitherScrollbar";
import { DitherHeroBackground } from "./adapters/DitherHeroBackground";
import { DitherBadge } from "./adapters/DitherBadge";
import { DitherAvatar } from "./adapters/DitherAvatar";
import { DitherInput } from "./adapters/DitherInput";
import { DitherSectionBackground } from "./adapters/DitherSectionBackground";
import { DitherImageFrame } from "./adapters/DitherImageFrame";
import { DitherProgressBar } from "./adapters/DitherProgressBar";
import { DitherLoader } from "./adapters/DitherLoader";
import type { AdapterComponent } from "../types";

export const COMPONENTS: ComponentDefinition[] = [
  {
    id: "card",
    label: "Card",
    category: "surfaces",
    description: "Editorial card with a large procedural media plane.",
    purpose: "Showcase dither materials as product imagery or content cards.",
    bestUses: ["Feature grids", "Case studies", "Portfolio tiles"],
    performanceNotes: "One WebGL surface; prefer DPR ≤ 2.",
    a11yNotes: "Media has role=img; CTA is a real button.",
    mobileNotes: "Full-width card; controls stack below preview.",
    status: "ready",
    defaultPresetId: "print-density",
  },
  {
    id: "navigation",
    label: "Navigation",
    category: "chrome",
    description: "Top nav strip with dithered brand mark and link row.",
    purpose: "Apply material language to site chrome without competing with content.",
    bestUses: ["Marketing sites", "Lab shells", "Docs headers"],
    performanceNotes: "Small canvas footprint — cheap on mobile.",
    a11yNotes: "Links are focusable; mark is decorative aria-hidden when text present.",
    mobileNotes: "Collapses to brand + menu affordance.",
    status: "preview",
    defaultPresetId: "ui-chrome",
  },
  {
    id: "button",
    label: "Button",
    category: "chrome",
    description: "CTA with dithered fill and clear label contrast.",
    purpose: "Primary actions that feel material, not flat fill.",
    bestUses: ["Hero CTAs", "Form submits", "Empty states"],
    performanceNotes: "Tiny surface; safe to mount several.",
    a11yNotes: "Uses native button; ensure 4.5:1 label contrast.",
    mobileNotes: "Min 44px touch target.",
    status: "preview",
    defaultPresetId: "ui-chrome",
  },
  {
    id: "scrollbar",
    label: "Scrollbar",
    category: "chrome",
    description: "Custom track/thumb with dithered thumb material.",
    purpose: "Subtle system chrome that matches the engine aesthetic.",
    bestUses: ["Panels", "Code drawers", "Sidebars"],
    performanceNotes: "Static until scroll; low draw cost.",
    a11yNotes: "Prefer native scroll; this is visual augmentation.",
    mobileNotes: "Hidden on touch — OS scrollbars preferred.",
    status: "preview",
    defaultPresetId: "hard-ink",
  },
  {
    id: "hero-background",
    label: "Hero Background",
    category: "surfaces",
    description: "Full-bleed dither field for above-the-fold stages.",
    purpose: "Brand-forward atmospheric plane behind type and CTAs.",
    bestUses: ["Landing heroes", "Launch pages"],
    performanceNotes: "Largest surface — clamp DPR and grain when mobile.",
    a11yNotes: "Treat as decorative; keep text in DOM with contrast.",
    mobileNotes: "Simplify bloom / grain under reduced motion.",
    status: "ready",
    defaultPresetId: "ambient-glow",
  },
  {
    id: "badge",
    label: "Badge",
    category: "chrome",
    description: "Compact status chip with dithered backdrop.",
    purpose: "Labels and counts that inherit the material system.",
    bestUses: ["Status", "Counts", "Tags"],
    performanceNotes: "Negligible GPU cost.",
    a11yNotes: "Text must remain readable; don’t rely on material alone.",
    mobileNotes: "Keep padding ≥ 8px.",
    status: "preview",
    defaultPresetId: "ui-chrome",
  },
  {
    id: "avatar",
    label: "Avatar",
    category: "media",
    description: "Circular frame with procedural dither fill.",
    purpose: "Placeholder or brand avatar when photos are unavailable.",
    bestUses: ["User lists", "Comments", "Teams"],
    performanceNotes: "Small circular clip of shared canvas.",
    a11yNotes: "Provide alt text / accessible name.",
    mobileNotes: "32–40px common sizes.",
    status: "preview",
    defaultPresetId: "soft-film",
  },
  {
    id: "input",
    label: "Input",
    category: "chrome",
    description: "Text field with dithered field background.",
    purpose: "Form surfaces aligned to the engine look.",
    bestUses: ["Auth", "Search", "Settings"],
    performanceNotes: "Static until focus; pause grain on typing if needed.",
    a11yNotes: "Label association required; focus ring outside material.",
    mobileNotes: "16px font minimum to avoid iOS zoom.",
    status: "preview",
    defaultPresetId: "ui-chrome",
  },
  {
    id: "section-background",
    label: "Section Background",
    category: "surfaces",
    description: "Wide section plane for one-job content blocks.",
    purpose: "Separate sections with material atmosphere, not cards.",
    bestUses: ["Marketing sections", "Feature bands"],
    performanceNotes: "Large; consider intersection-based pause.",
    a11yNotes: "Decorative; content contrast independent.",
    mobileNotes: "Reduce pixel density on narrow viewports.",
    status: "ready",
    defaultPresetId: "soft-film",
  },
  {
    id: "image-frame",
    label: "Image Frame",
    category: "media",
    description: "Framed media slot with dithered matte surround.",
    purpose: "Present photography inside the dither language.",
    bestUses: ["Galleries", "Case studies"],
    performanceNotes: "Material is matte only — photo stays CSS/img.",
    a11yNotes: "Real img with alt; frame is decorative.",
    mobileNotes: "Stack caption below.",
    status: "preview",
    defaultPresetId: "print-density",
  },
  {
    id: "progress-bar",
    label: "Progress Bar",
    category: "feedback",
    description: "Determinate bar with dithered fill track.",
    purpose: "Loading / completion feedback in material voice.",
    bestUses: ["Uploads", "Onboarding", "Installers"],
    performanceNotes: "Tiny; update via CSS width, not shader rebuild.",
    a11yNotes: "role=progressbar with valuemin/max/now.",
    mobileNotes: "Full width of container.",
    status: "preview",
    defaultPresetId: "hard-ink",
  },
  {
    id: "loader",
    label: "Loader",
    category: "feedback",
    description: "Indeterminate dither orb for waiting states.",
    purpose: "Alive waiting indicator without gimmicky spin theater.",
    bestUses: ["Suspense", "Async panels"],
    performanceNotes: "Single small surface; honor reduced motion.",
    a11yNotes: "aria-busy / live region on parent.",
    mobileNotes: "Center in viewport or panel.",
    status: "preview",
    defaultPresetId: "ambient-glow",
  },
];

const adapters: Record<ComponentId, AdapterComponent> = {
  card: DitherCard,
  navigation: DitherNavigation,
  button: DitherButton,
  scrollbar: DitherScrollbar,
  "hero-background": DitherHeroBackground,
  badge: DitherBadge,
  avatar: DitherAvatar,
  input: DitherInput,
  "section-background": DitherSectionBackground,
  "image-frame": DitherImageFrame,
  "progress-bar": DitherProgressBar,
  loader: DitherLoader,
};

export { adapters };

export function getComponent(id: ComponentId): ComponentDefinition | undefined {
  return COMPONENTS.find((c) => c.id === id);
}

export function getAdapter(id: ComponentId): AdapterComponent {
  return adapters[id];
}

export const ComponentCatalog = {
  list: () => COMPONENTS.slice(),
  get: getComponent,
  adapter: getAdapter,
  ready: () => COMPONENTS.filter((c) => c.status === "ready"),
};
