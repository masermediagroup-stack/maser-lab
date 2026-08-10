# Project: Pixel Info Card

**Slug:** `pixel-info-card`  
**Category:** display  
**Status:** draft  
**Created:** 2026-08-10

## Design reference

- Figma: none (see `FIGMA.md`)
- Other: Blobby Rotation Loader demo chrome (layout/style); Lucide/Heroicons-style circular info glyph; canvas pixel-card / particle-reveal references (Dirck Mulder Pixel Card, Disintegrate-style particle morph)
- Adjacent lab patterns: `feedback/blobby-rotation-loader` (demo shell), `lab/src/components/text-animations/BlurFocusRevealAnimation.tsx` (card body blur-in), optional craft cues from `tetris-pixel-text` / `page-transitions-lab` pixel wormhole (not direct ports)

## Mode

**Shape** (this document). No product implementation until Implement is requested.

**Loaded skills / refs:** `maser-lab-web` (Shape), `maser-lab-section-shape`, `maser-lab-project-scaffold` (wiring when Implement starts), `references/decision-template.md`, `references/motion-judgment.md`.

---

## Brief

### User / trigger

Lab visitors and portfolio viewers tap/click a compact info control to reveal detail, then tap the expanded card to collapse. Occasional / demo frequency (not a high-frequency chrome control).

### Job

Communicate “more info available → here is the content” through a memorable open/close: trigger dissipates, white pixels snake-assemble into a card, copy blur-ins; reverse plays on second click.

### Brand signal

Demo stage matches Blobby Rotation Loader: black field, centered stage, fixed back pill + title, bottom control strip. Accent fill is **blue** (not yellow). Product surface is white card + blue info chrome + black body copy — readable without the lab shell.

### Current behavior

Greenfield — no pixel-assemble info card in `display/`.

### Desired outcome

One composition on a black stage: idle squircle trigger → press → fast blur-out → white multi-opacity pixel snakes coalesce into a rounded white info card → header + body text blur in. Second press reverses the sequence back to the squircle. Bottom sliders (blue tracks) tune pixel/motion params like Blobby.

### Success signal

- Open and close each read as one continuous story (not a hard cut).
- Pixel phase feels generative / snake-like, not a simple scale morph.
- Card content is legible within ~150–250ms of card settle.
- Reduced-motion path still toggles content without the pixel spectacle.
- Demo chrome is recognizably Blobby-family with blue accents.

### Non-goals

- Maser Dither Engine / WebGL2 pipeline (Canvas 2D only for v1).
- Live HTML-under-shader dissolve libraries.
- Multi-card stacks, markdown rich text, or CMS content.
- Persisting slider prefs to localStorage (v1).
- Yellow Blobby fill anywhere in this demo.

---

## First viewport / composition

| Slot | Content |
| --- | --- |
| Shell | Black `#000` full-bleed demo (Blobby layout) |
| Header | Centered title “Pixel Info Card”; back pill top-left |
| Stage | Single interaction: idle squircle **or** expanded card (never both as solid DOM) |
| Controls | Bottom panel: blue-fill sliders + optional Reset |

Idle trigger (product):

- White squircle (~56–72px, large radius / near-square rounded square)
- Blue circular **info** icon centered (standard “i” in circle)
- Blue label `info` under the squircle (sentence or lowercase per copy decision — default: lowercase `info` under trigger; card header uses `INFO` all-caps)

Expanded card (product):

- White rounded rectangle, normal card size (~min(360px, 92vw) × content)
- Top-left: blue info icon + blue `INFO` all-caps
- Body: black text (short placeholder paragraph in demo)
- Entire card is the hit target to reverse

---

## Interaction timeline

### Open (trigger → card)

```text
t0        pointerdown / Enter on trigger (pressed feedback optional)
t0–~80ms  squircle + label blur-out / opacity collapse (very fast dissipate)
~80ms     canvas pixel field active over stage bounds
~80–450ms white pixels at varied opacities move in short snake-like chains,
          coalescing into the card silhouette (rounded rect mask)
~400ms    card DOM (or canvas-backed plate) reaches opacity/shape settle
~420–600ms header (icon + INFO) then body text: fast blur-in + slight Y offset
          (reuse BlurFocusReveal timing, sped up ~2× for card body)
```

### Close (card → trigger) — reverse

```text
t0        click / Enter on expanded card
t0–~120ms body + header blur-out / fade (fast, reverse of enter)
~100ms    card plate dissolves into pixel snakes (outward / scatter toward
          trigger origin), white multi-opacity squares
~350–500ms pixels collapse toward squircle footprint
~480ms    squircle + `info` label blur/snap back in
```

Interruptibility: if user re-triggers mid-flight, retarget toward the opposite resting state from current progress (no double-DOM flash).

---

## States

- [ ] default — idle white squircle + blue icon + `info` label
- [ ] hover (pointer fine) — subtle scale or brightness on squircle only
- [ ] focus-visible — blue focus ring on trigger / card
- [ ] active / pressed — brief press scale on trigger
- [ ] expanding — pixel assemble in progress (inert to second open)
- [ ] expanded — card resting; clickable to close
- [ ] collapsing — reverse pixel dissolve in progress
- [ ] prefers-reduced-motion — instant or crossfade toggle; no pixel snakes; text appears without blur spectacle

---

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Canvas 2D + `requestAnimationFrame` for pixels; CSS/WAAPI for blur dissipate + text | Controllable particle snakes without WebGL/engine coupling; matches Blobby’s canvas tuning culture |
| Pixel model | Grid cells / small squares; white `#fff` at ~0.15–1.0 opacity; short correlated paths (“snakes”) that settle into card AABB with rounded mask | Matches brief; inspired by pixel-card / particle-reveal patterns, not Bayer dither engine |
| Dissipate | ≤80–100ms blur + opacity on trigger | “Really, really fast” per brief |
| Assemble | ~300–450ms (demo-tunable) | Occasional delight; still interruptible |
| Text | Port `tal-blur-focus` / `BlurFocusRevealAnimation` with shorter speed (~350–450ms) + small Y offset | Existing lab text pack; supports `phase: "out"` for reverse |
| Reverse | Same systems, reversed timeline | Explicit product requirement |
| Reduced motion | Skip pixel phase; opacity crossfade ≤150ms | `rule` a11y / motion-judgment |

### Alternatives considered (Shape)

| Approach | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| A. Canvas 2D pixel snakes | Tunable, portable, no engine sacred contracts | Hand-authored particle logic | **Chosen for v1** |
| B. Maser Dither Engine surface | Shared material language | Overkill; wrong pipeline for morphing card chrome | Reject for v1 |
| C. CSS-only scale/blur morph | Tiny bundle | No generative pixel feel | Reject as primary |
| D. Three.js wormhole particles | Existing lab scene | Heavy for a card micro-interaction | Reject for v1 |

---

## Demo chrome (Blobby match, blue accent)

Mirror [`blobby-rotation-loader`](../../feedback/blobby-rotation-loader/PROJECT.md) structure:

| Element | Spec |
| --- | --- |
| Background | `#000000` |
| Text | `#ffffff` |
| Track | `#2a2a2a` |
| Fill (was yellow) | Blue — proposed `--pic-fill: #3b82f6` (tunable in controls) |
| Thumb | `#ffffff` |
| Panel | `rgba(0,0,0,0.96)` + top hairline |
| Layout | `grid-template-rows: 1fr auto`; fixed back + title; stage centered; controls bottom |

### Proposed demo controls (blue sliders)

| Control | Maps to |
| --- | --- |
| Pixel size | Canvas cell size (px) |
| Snake density | Active particle count / fill probability |
| Assemble speed | Open pixel-phase duration |
| Dissipate speed | Trigger blur-out duration |
| Card radius | Final card corner radius |
| Reset | Return params + collapse to idle |

Optional v1.1: accent blue color picker (like Blobby’s color panel).

---

## Architecture (Implement preview)

```text
projects/display/pixel-info-card/
  PROJECT.md          ← this Shape brief
  FIGMA.md
  TRANSFER.md         ← later

lab/src/components/projects/display/pixel-info-card/
  index.ts            # product exports only
  pixel-info-card.tsx # trigger + card shell + a11y
  pixel-assemble-canvas.tsx  # rAF snake assemble/dissolve
  use-pixel-info-machine.ts  # idle|expanding|expanded|collapsing
  pixel-info-card-demo.tsx   # Blobby-like shell + blue sliders
  tokens.css
  constants.ts
  types.ts
```

Wire: `projects/registry.json` → `lab/.../registry.ts` demoRegistry → `/demos/pixel-info-card` via DemoHost.

Reuse:

- Demo layout/CSS patterns from `blobby-rotation-loader/tokens.css` + demo structure (swap fill to blue).
- Text from `BlurFocusRevealAnimation` / `text-animations.css` (`tal-blur-focus`), configured compact + fast; `phase="out"` on close.
- Icon: `lucide-react` `Info` (lab standard) unless a static SVG is preferred for transfer weight.

---

## Accessibility

- Trigger: `<button type="button">` with accessible name e.g. “Show info”.
- Expanded card: button or focusable region named “Hide info”; `aria-expanded` on the control pair.
- Focus moves to card on open and back to trigger on close (or stays logical with `aria-controls`).
- Keyboard: Enter/Space toggle; Escape collapses when expanded.
- `prefers-reduced-motion: reduce` honors non-spectacle path.
- Body copy remains in the accessibility tree when expanded (not canvas-only text).

---

## Acceptance criteria

- [ ] Demo route `/demos/pixel-info-card` renders idle, expanding, expanded, collapsing, reduced-motion
- [ ] Click/keyboard open assembles via white multi-opacity pixel snakes; close reverses
- [ ] Trigger: white squircle, blue info icon, blue `info` label
- [ ] Card: white rounded plate, blue icon + `INFO`, black body text with fast blur-in
- [ ] Demo chrome matches Blobby layout; slider fill is blue not yellow
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Motion review: no open P0/P1 findings
- [ ] `prefers-reduced-motion` verified in browser
- [ ] Product exported from `lab/src/components/projects/display/pixel-info-card/index.ts`

---

## Open decisions

Record with decision template before Implement if still unresolved:

1. **Exact blue** — default `#3b82f6` vs brand Maser blue from page-transitions-lab; confirm in Implement.
2. **Card body copy** — demo placeholder vs user-supplied string prop (recommend `title` + `children`/`body` props).
3. **Canvas vs DOM card plate** — pixels only as transition overlay vs pixels drawing the plate until text mounts (recommend: canvas overlay + DOM card fade-in at settle for selectable text).
4. **Squircle radius** — CSS `border-radius` ~28–32% of size vs `corner-shape` (stick to `border-radius` for support).

## Accepted decisions (human)

| Decision | Choice | Approver |
| --- | --- | --- |
| Reversibility | Second click on card plays reverse back to squircle | User (2026-08-10) |
| Demo chrome | Match Blobby Rotation Loader; control fill blue not yellow | User (2026-08-10) |
| Category / slug | `display` / `pixel-info-card` | Shape default |
| Pixel pipeline | Canvas 2D snakes (not dither engine) | Shape default |
| Text | Reuse BlurFocusReveal / `tal-blur-focus` | Shape default |

## Next mode

When ready to build: switch to **Implement** — scaffold component folder, demoRegistry entry, canvas machine, blue Blobby chrome, then Harden + Motion-review.
