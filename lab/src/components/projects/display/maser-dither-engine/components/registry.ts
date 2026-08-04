import type { ComponentDefinition, ComponentId } from "../types";
import { DitherCard } from "./adapters/DitherCard";
import { DitherNavigation } from "./adapters/DitherNavigation";
import { DitherButton } from "./adapters/DitherButton";
import { DitherScrollbar } from "./adapters/DitherScrollbar";
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
    description:
      "Interactive vertical/horizontal track with live material thumb and scroll progress.",
    purpose: "Premium system chrome demo — drag thumb, scroll pane, material rides the thumb.",
    bestUses: ["Panels", "Code drawers", "Sidebars", "Studio demos"],
    performanceNotes: "One small WebGL thumb surface; pane uses native scroll.",
    a11yNotes: "role=scrollbar with valuemin/max/now; pane remains keyboard-scrollable.",
    mobileNotes: "Thick touch target; FitStage scales the stage; native overflow still works.",
    status: "ready",
    defaultPresetId: "hard-ink",
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
    mobileNotes: "Keep padding ≥ 8px; SM–XL size tokens.",
    status: "preview",
    defaultPresetId: "ui-chrome",
  },
  {
    id: "avatar",
    label: "Avatar",
    category: "media",
    description:
      "True identity mark — circle / rounded / square with initials, image, placeholder, presence.",
    purpose: "User or brand avatar with procedural material fill and optional photo.",
    bestUses: ["User lists", "Comments", "Teams", "Profile chrome"],
    performanceNotes: "Small clipped SurfaceCanvas; border/glow are CSS overlays.",
    a11yNotes: "Accessible name from initials or image; presence has aria-label.",
    mobileNotes: "sm–xl size tokens; image upload overlay when mode=image.",
    status: "ready",
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
    description: "Wide atmospheric plane for one-job content blocks (heroes & sections).",
    purpose: "Separate sections with material atmosphere, not cards.",
    bestUses: ["Marketing sections", "Feature bands", "Above-the-fold stages"],
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
    description:
      "Drag/drop or click upload, aspect ratios, fit modes, caption, and material overlay.",
    purpose: "Present photography through ordered dither + material language.",
    bestUses: ["Galleries", "Case studies", "Brand stills"],
    performanceNotes: "One source texture (unit 6); cover/contain via content; no per-thumb contexts.",
    a11yNotes: "Canvas aria-label reflects sourced vs empty; caption below; replace/remove controls.",
    mobileNotes: "In-frame upload works on touch; aspect updates live; FitStage scales preview.",
    status: "ready",
    defaultPresetId: "print-density",
  },
  {
    id: "progress-bar",
    label: "Progress Bar",
    category: "feedback",
    description: "Determinate bar with auto 0→100 loop and dithered fill.",
    purpose: "Loading / completion feedback in material voice.",
    bestUses: ["Uploads", "Onboarding", "Installers"],
    performanceNotes: "Tiny; fill width via CSS; auto loop without React setState thrash.",
    a11yNotes: "role=progressbar with valuemin/max/now.",
    mobileNotes: "Full width of container; SM–XL heights.",
    status: "ready",
    defaultPresetId: "hard-ink",
  },
  {
    id: "loader",
    label: "Loader",
    category: "feedback",
    description: "Indeterminate spinning dither ring for waiting states.",
    purpose: "Alive waiting indicator — rotating material arc, not a static orb.",
    bestUses: ["Suspense", "Async panels"],
    performanceNotes: "Single small surface; honor reduced motion.",
    a11yNotes: "role=status; aria-busy on parent when needed.",
    mobileNotes: "SM–XL ring sizes; center in viewport or panel.",
    status: "ready",
    defaultPresetId: "ambient-glow",
  },
];

const adapters: Record<ComponentId, AdapterComponent> = {
  card: DitherCard,
  navigation: DitherNavigation,
  button: DitherButton,
  scrollbar: DitherScrollbar,
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
