# Maser-Lab Project: SummitPath — Sign Up

## 1. Maser-Lab project identity

| Field | Value |
| --- | --- |
| **Lab** | Maser-Lab (Tyler Vea / MaserMedia) |
| **Project name** | SummitPath — Sign Up |
| **Type** | Sign-up / onboarding section (dual breakpoint) |
| **Source** | Figma static frames + motion node |
| **Target** | Reusable auth/onboarding pattern |
| **Intended use** | Lab showcase, portfolio section, client onboarding flows (outdoor / wellness / SaaS) |

**Slug:** `summitpath-sign-up`  
**Category:** `sign-up`  
**Status:** `review`  
**Created:** 2026-06-29

---

## 2. Project overview

SummitPath sign-up is a portfolio-grade, client-adaptable registration section rebuilt for **1:1 static parity** with Figma at desktop **1920×1080** (`19:2`) and mobile **452×1168** (`56:570`), then layered with motion (hikelogo keyframes, staggered entrance, interaction states). The section uses a light outdoor palette; the **Maser-Lab dark shell** wraps demos and gallery only.

---

## 3. Source reference

| Asset | Figma node | Dimensions | Lab path |
| --- | --- | --- | --- |
| Desktop frame | `19:2` | 1920×1080 | `summitpath-sign-up-desktop` composition |
| Mobile frame | `56:570` | 452×1168 | `summitpath-sign-up-mobile` composition |
| Hikelogo motion | `45:16` | 8×14 | `signup-header.tsx` → `HikeLogo` |
| Hero (desktop) | `48:39` | — | `lab/public/images/summitpath-signup-hero.png` |
| Hero (mobile) | `56:571` | 425×322 | `summitpath-mobile-hero-a.png` |
| Vector overlays | `48:59`, `50:15` | — | `summitpath-vector-2.png`, `summitpath-vector-3.png` |
| Social icons | `40:777`, `40:778` | — | `summitpath-google-icon.png`, `summitpath-apple-icon.png` |
| Hikelogo layer | `45:17` | — | `summitpath-hikelogo-layer.png` |

**Figma file:** [web-component-and-interaction-playground](https://www.figma.com/design/f2TLFWW5Eg8aqczRjuZ403/web-component-and-interaction-playground)

**Demo route:** `/demos/summitpath-sign-up`

---

## 4. Business usage potential

- **Tyler portfolio** — demonstrates design-engineering rigor (Figma parity, motion, a11y)
- **MaserMedia case studies** — outdoor/wellness/SaaS onboarding pattern
- **Client sites** — swappable copy, tokens, and imagery without re-architecting layout
- **Reusable auth flows** — sign-up → login, CTA blocks, feature gates

---

## 5. Design system notes (SummitPath tokens)

Scoped in `lab/src/components/projects/sign-up/summitpath-sign-up/tokens.css` — **not** mixed with `--lab-*` shell tokens.

| Token | Value | Usage |
| --- | --- | --- |
| `--summitpath-signup-text` | `#17261d` | Headings, body |
| `--summitpath-signup-label` | `#799886` | Uppercase field labels |
| `--summitpath-signup-input-border` | `#17666d` | 2px field border |
| `--summitpath-signup-cta-from/to` | `#799886` → `#176d3b` | CTA gradient |
| `--summitpath-signup-bg` (mobile) | `#fdfcf9` | Mobile page base |
| `--summitpath-font` | Instrument Sans | Scoped via `--font-instrument-sans` |

**Typography:** Instrument Sans — desktop title 64px/0.9, mobile 40px/1.1; labels 12px bold uppercase; inputs 16px.

**Layout constants:** Desktop form panel 960px; inputs/CTA 475×56 (12px radius); CTA 64px; social 223×35 side-by-side (no OR). Mobile content 390px; inputs/CTA 342px; social 342×52 stacked with OR divider.

---

## 6. Maser-Lab dark UI notes

Shell tokens in `lab/src/styles/maser-lab-tokens.css` (class `.maser-lab`):

| Token | Hex |
| --- | --- |
| `--lab-text-primary` | `#F8F8F8` |
| `--lab-accent-primary` | `#10A4FF` |
| `--lab-accent-secondary` | `#0097F5` |
| `--lab-accent-soft` | `#0065A3` |

**Brand assets:** `lab/public/brand/masermedia-logo-bold-blue.png`, `masermedia-colorway.png`

**Shell surfaces:** gallery (`page.tsx`), demo chrome (`demo-chrome.tsx`), demo page wrapper (`demos/[slug]/page.tsx`). SummitPath section stays light.

---

## 7. Motion system notes

| Element | Implementation | Reduced motion |
| --- | --- | --- |
| Hikelogo `45:16` | Framer Motion opacity + x keyframes (3.505s loop) | Static image |
| Section entrance | Staggered opacity/y on header → fields → CTA → social | Instant |
| CTA press | `whileTap` scale 0.98 | Disabled |
| Field focus | CSS border + ring via tokens | Preserved (no motion) |
| Loading/success | Icon swap + 700ms simulated submit | 0ms when reduced |

Demo toggle + `prefers-reduced-motion` + `data-reduced-motion` on section root.

---

## 8. UX notes (improvements vs static)

- Live validation on submit with per-field `aria-invalid` / `aria-describedby`
- `autocomplete` + `required` on fields
- Status region `aria-live="polite"` for submit feedback
- QA controls (disabled, reduced motion, viewport frames) **only in demo shell** — section renders clean in frame mode
- Viewport scaler fits 1920/452 frames on smaller screens for pixel review

---

## 9. Reuse instructions

| From | To | What transfers |
| --- | --- | --- |
| Sign-up | Login | Form shell, fields, CTA gradient, social row |
| Sign-up | CTA band | CTA button styles + press motion |
| Sign-up | Feature gate | Header + single field + CTA pattern |

Copy `tokens.css`, decompose `signup-field.tsx` / `signup-social-buttons.tsx`, swap copy in `signup-header.tsx`.

---

## 10. Client adaptation notes

- **Content:** Replace title, tagline, placeholders, footer link in `signup-header.tsx` / `signup-form.tsx`
- **Brand:** Override `--summitpath-*` tokens; keep layout dimensions unless art direction changes
- **Imagery:** Swap `SUMMITPATH_ASSETS` paths in `constants.ts`
- **Motion:** Hikelogo is optional — remove `HikeLogo` for non-outdoor brands
- **Social:** Button labels and providers are data-driven candidates for future refactor

---

## 11. Missing items checklist

- [ ] Code Connect mapping (`.figma.ts` not started)
- [ ] Real auth backend / OAuth wiring (non-goal)
- [ ] Mobile Figma used component placeholders (`Label` / `Input-lg`) — lab uses SummitPath field styling from desktop spec
- [ ] Pixel diff sign-off at exact 1920×1080 and 452×1168 in browser (manual QA recommended)

---

## 12. Quality loop notes

| Loop | Result |
| --- | --- |
| MaserLabShellQA | Pass — dark gallery + demo chrome, COLORWAY accents |
| StaticDesignQA | Pass (code) — frame dimensions match Figma; ±2px manual verify recommended |
| ResponsiveQA | Pass — breakpoint 960px; frame modes Desktop 1920 / Mobile 452 |
| AccessibilityQA | Pass — labels, focus rings, 44px+ targets, contrast on light section |
| MotionQA | Pass — hikelogo keyframes, stagger, reduced-motion guards |
| CodeQualityQA | Pass — `npm run lint`, `npm run build` |
| HallucinationQA | Pass — assets traced to Figma exports or `constants.ts` |
| ClientReadinessQA | Pass — token/content swappability documented |
| ReuseQA | Pass — decomposition documented above |

---

## 13. Skills used

| Skill | Use |
| --- | --- |
| `micro-interaction-lab` | Harden mode, QA gates, project lifecycle |
| `figma-design-workflow` | Design context, asset export, motion context |
| `figma-implement-motion` | Hikelogo keyframes from `get_motion_context` |
| `web-design-guidelines` | A11y patterns (labels, focus, live regions) |
| `vercel-react-best-practices` | Derived state, no unnecessary effects |
| `verification` | Lint/build gates |

---

## 14. Future component ideas

- Login variant (shared shell, inverted footer)
- Password strength meter (trail metaphor)
- Email magic-link flow (single field + CTA)
- Onboarding step indicator (summit elevation steps)
- Social-only sign-up compact row for modals

---

## States (demo)

- [x] default
- [x] hover (pointer fine)
- [x] focus
- [x] active / pressed (CTA)
- [x] loading
- [x] success
- [x] error
- [x] disabled (demo control)
- [x] prefers-reduced-motion (OS + demo toggle)

## Acceptance criteria

- [x] Demo route renders all states
- [x] `npm run lint` and `npm run build` pass
- [x] Motion review complete (hikelogo + stagger + guards)
- [x] `prefers-reduced-motion` honored
- [x] Exported from `index.ts`
