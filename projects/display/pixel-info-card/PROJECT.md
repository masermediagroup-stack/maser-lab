# Project: Pixel Info Card

**Slug:** `pixel-info-card`  
**Category:** display  
**Status:** building  
**Created:** 2026-08-10  
**Grilling:** complete (2026-08-10)  
**Mode:** Implement (in progress)

## Design reference

- Figma: none (see `FIGMA.md`)
- Demo chrome: [`blobby-rotation-loader`](../../feedback/blobby-rotation-loader/PROJECT.md) layout; Maser blue slider fill (not yellow)
- Export pattern: [`page-transitions-lab`](../../layout/page-transitions-lab/) code-export drawer (usage snippet + settings + Copy)
- Icon: `lucide-react` `Info` + `Sun` / `Moon` for theme toggle
- Pixel assemble refs: Dirck Mulder Pixel Card; lab `tetris-pixel-text` controller (phase/in-out craft only)
- Text: `BlurFocusRevealAnimation` / `tal-blur-focus` (compact, fast, `phase: "out"` on close)

**Loaded skills:** `maser-lab-web` (Shape), `grill-me` / `grilling` (stress-test), `maser-lab-project-scaffold` (Implement wiring).

---

## Brief

### User / trigger

Lab visitors and portfolio viewers tap a compact **Info** control to reveal detail, then tap the expanded card to collapse. Occasional frequency — not high-frequency chrome.

### Job

Communicate “more info available → here is the content” through a reversible open/close: trigger dissipates, pixel snakes assemble a card, copy blur-ins; second click on the card reverses.

### Brand signal

Portable product works on any host background. Lab demo uses Blobby shell (black or white stage via theme toggle), centered stage, back pill top-left, **sun/moon theme pill top-right**, bottom blue sliders + Reset + **Export**.

### Desired outcome

**Dark (default):** black stage, white squircle + white card, Maser blue icon + `Info` label/header, black body text on card.

**Light:** white stage, black squircle + black card, white icon + `Info` on black surfaces, white body text on card.

Pixels match surface polarity (white particles → white card in dark; black particles → black card in light).

### Success signal

- Open/close read as one continuous story: pixels **become** the card (no simultaneous pixel + card fade / double flash).
- Pixel phase feels generative — individual particles burst from behind the squircle on random paths, then lock into a masked grid.
- Content blur-ins only after the card plate is fully opaque (`expanded`).
- Pixel burst is readable (~720ms default assemble); trigger blur stays subtle (≤4px).
- Mid-flight click retargets with ease-out cubic blend.
- Theme toggle inverts colors cleanly.
- Export copies portable usage + current slider values.
- Reduced-motion path toggles without pixel spectacle.

### Non-goals

- Maser Dither Engine / WebGL2 (Canvas 2D v1).
- Disintegrate-style DOM particle libs.
- Multi-card stacks, markdown, CMS.
- localStorage persistence (v1).
- Calibration preset buttons (sliders + Reset only).
- Separate close (X) control — entire card closes.

---

## Product API (portable)

```tsx
<PixelInfoCard
  theme="dark" | "light"   // default "dark"
  title="Info"             // default "Info" — capital I only
  body={string}            // consumer copy; demo uses TypeScript explainer
  className?
/>
```

- **Demo-only:** sliders, Reset, Export drawer, sun/moon theme toggle (drives `theme` state).
- Product has **no** dependency on black lab stage.

### Demo placeholder body (fixed v1)

> TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static types, interfaces, and tooling-friendly checks so teams can catch errors before runtime while still shipping to any browser or Node environment.

---

## Composition

| Slot | Dark demo | Light demo |
| --- | --- | --- |
| Stage bg | `#000000` | `#ffffff` |
| Squircle + card plate | White | Black |
| Icon + `Info` chrome | Maser blue `#10a4ff` | White |
| Body copy | Black on white card | White on black card |
| Assemble pixels | White, varied opacity | Black, varied opacity |
| Slider fill | Maser blue | Maser blue |

| Chrome | Spec |
| --- | --- |
| Back | Top-left pill (Blobby) |
| Title | Centered “Pixel Info Card” |
| Theme | Top-right **40px circle** — **Sun** in dark (tap → light), **Moon** in light (tap → dark) |
| Stage | Centered interaction |
| Controls | Bottom panel: sliders + Reset + Export |

### Trigger

- **64×64px** white (dark) / black (light) squircle, large `border-radius`
- Lucide `Info` centered; **`Info`** label below (capital **I** only)
- `<button type="button">` — “Show info”

### Expanded card

- Centered; ~`min(360px, 92vw)` width
- Top-left: icon + **`Info`** (same casing as trigger)
- Body: theme-appropriate copy color
- **Entire card** is close target — “Hide info”
- Canvas overlay during transition; **DOM card** fades in at ~80% assemble (selectable text)

### Spatial (locked)

Centered card on stage. Pixels **originate from squircle** and snake into centered card silhouette (not anchored offset growth).

---

## Interaction timeline

### Open

```text
t0        pointerdown / Enter on trigger
t0–~80ms  squircle + Info label blur-out (very fast)
~80ms     canvas pixel field; snakes from squircle → card mask
~80–450ms surface-colored pixels, varied opacity, snake chains
~80%      DOM card opacity in (canvas still finishing)
~400ms    card settled
~420–550ms header then body: BlurFocusReveal (~350–450ms, compact)
```

### Close (reverse)

```text
t0        click / Enter on entire card (Escape also collapses)
t0–~120ms text blur-out (phase "out")
~100ms    card dissolves to pixel snakes toward squircle
~350–500ms pixels collapse to squircle footprint
~480ms    squircle + Info label return
```

### Interrupt (locked)

Mid-flight click **retargets** toward opposite resting state from current progress. Blend with **ease-out cubic ~180–220ms** (no snap, no spring).

---

## States

- [ ] default — idle squircle + Info label
- [ ] hover — subtle squircle scale/brightness (pointer fine)
- [ ] focus-visible — accent focus ring (blue dark / white light)
- [ ] active / pressed — brief press scale on trigger
- [ ] expanding — pixels assembling; retargetable
- [ ] expanded — card resting; entire card closes
- [ ] collapsing — reverse; retargetable
- [ ] theme-dark / theme-light — product + demo
- [ ] prefers-reduced-motion — crossfade ≤150ms; no pixels; no blur spectacle

---

## Motion decisions

| Decision | Choice |
| --- | --- |
| Pixels | Canvas 2D + rAF; grid snakes; surface-matched color + opacity |
| Plate | Canvas transition overlay + DOM card at settle |
| Dissipate | ≤80–100ms blur + opacity |
| Assemble | ~300–450ms (slider-tunable) |
| Text | `tal-blur-focus` / BlurFocusReveal, compact, fast |
| Interrupt easing | ease-out cubic ~200ms retarget |
| Reduced motion | Opacity crossfade; skip canvas |

---

## Demo controls

| Control | Maps to |
| --- | --- |
| Pixel size | Cell size (px) |
| Snake density | Particle count / fill |
| Assemble speed | Open duration |
| Dissipate speed | Trigger blur-out |
| Card radius | Corner radius |
| Reset | Default params + collapse to idle |

**Export** (page-transitions-lab pattern): sheet with JSX usage snippet, current slider values as props, dependency list (`lucide-react`), Copy button. Not full canvas source.

---

## Architecture (Implement)

```text
lab/src/components/projects/display/pixel-info-card/
  index.ts                    # PixelInfoCard only
  pixel-info-card.tsx         # trigger + card + theme prop + a11y
  pixel-assemble-canvas.tsx   # rAF snakes
  use-pixel-info-machine.ts   # idle|expanding|expanded|collapsing + retarget
  code-export-drawer.tsx      # usage + settings export
  pixel-info-card-demo.tsx    # Blobby shell + sliders + theme + export
  tokens.css                  # dark/light + Maser blue
  constants.ts
  types.ts
```

Reuse: `LoaderControlSlider` pattern from blobby (or shared slider styles), `page-transitions-lab` export drawer pattern.

---

## Accessibility

- Trigger: button, `aria-expanded`, “Show info”
- Card: focusable close region, “Hide info”; focus moves to card on open, back to trigger on close
- Keyboard: Enter/Space toggle; Escape collapses when expanded
- `prefers-reduced-motion`: non-spectacle path in both themes
- Body in DOM when expanded (not canvas-only)

---

## Acceptance criteria

- [ ] `/demos/pixel-info-card` — all states + both themes
- [ ] Open/close pixel snakes; reverse on card click; mid-flight retarget with easing
- [ ] 64px squircle; `Info` label casing; Maser blue accents in dark only
- [ ] Light mode: inverted stage/surfaces; white chrome on black components
- [ ] Sun/moon toggle top-right; Export copies usage + settings
- [ ] Demo: Blobby layout, blue sliders, Reset
- [ ] `prefers-reduced-motion` verified
- [ ] Product in `index.ts`; works without demo chrome
- [ ] `npm run lint` + `npm run build` pass

---

## Accepted decisions (grilling 2026-08-10)

| Topic | Choice |
| --- | --- |
| Accent blue | Maser `#10a4ff` (dark mode only) |
| Card position | Centered; pixels from squircle |
| Card plate | Canvas overlay + DOM at settle |
| Scope | Portable product + demo + Export |
| Interrupt | Retarget mid-flight, ease-out cubic ~200ms |
| Focus | Card on open; trigger on close |
| Label | `Info` (capital I only) |
| Trigger size | 64px |
| Presets | Sliders + Reset only |
| Theme | `theme` prop + demo sun/moon top-right |
| Light mode | Invert bg/surfaces; white chrome on black; no blue in light |
| Export | Match page-transitions-lab drawer |
| Close | Entire card only |
| Demo body | Fixed TypeScript explainer paragraph |
| Reversibility | Card click reverses to squircle |
| Demo chrome | Blobby + blue sliders |

## Next mode

**Implement** — scaffold, canvas machine, themes, export drawer, demoRegistry, verify rendered demo.
