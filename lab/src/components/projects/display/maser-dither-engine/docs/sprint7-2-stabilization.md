# Sprint 7.2 — Engine Stabilization, UI Consistency & Feature Audit

**Mode:** Harden · **Engine:** `0.7.2`  
**Skills loaded:** `maser-lab-web` (Harden), `maser-lab-responsive-qa`, `maser-lab-acceptance-audit` (partial)

## Intent

Stabilize after rapid Sprint 7 feature work. No pipeline rewrite. Fix broken or incomplete adapters, reconnect color/animation controls, enforce monochrome editor chrome, and document known limits.

## Issues discovered → fixed

| Area | Issue | Fix |
| --- | --- | --- |
| UI chrome | Blue dock accents / cool thumbs | Monochrome tokens — white active, neutral borders/hovers |
| Scrollbar | Static ~12px GL mock, no interaction | Interactive pane + track/thumb drag, V/H, progress meter, a11y role |
| Avatar | Initials-only circle | Shape / size / mode / presence / border / glow / image upload |
| Image frame | Upload only in Content panel; no aspects | In-frame drag/drop + click, replace/remove, aspect + fit + overlay |
| Colors | Slots gated / labels weak / no HSL | All 14 slots + HEX/RGB/HSL editors; behavior chips restored |
| Interaction lights | Color tint disconnected | Light Color / Interaction Color sliders restored |
| Animation | Weak UV/luma composition | `anim.xy * 2.15`, `anim.z * 0.42` (+ w); no behavior speed compounding |
| Snapshots | Missing new content keys | Merge `DEFAULT_COMPONENT_CONTENT` on apply |
| Registry | Scrollbar/avatar preview status | Marked `ready` with accurate descriptions |

## Components repaired

- **Scrollbar** — premium interactive demo
- **Avatar** — true identity chrome
- **Image Frame** — upload + aspect/fit workflow
- Content editor fields for all three

## Animations

GLSL modes were already distinct; composition scale made UV offset and luminance modulation readable again so mode switches (wave vs aurora vs lava vs orbit, etc.) read differently with Play on and reduced-motion off.

## Materials / presets

No material shader rewrite. CSS studio thumbs desaturated for chrome consistency; procedural preview retains palette color. Preset load/save path unchanged — blob source URLs still dropped on save (documented limitation).

## Color system

- Material: Background, Primary/Highlight, Secondary/Accent, Shadow, Dither, Bloom, Glow, Ambient, Gradient Start/Mid/End/4th, Overlay/Edge, Noise Tint
- Live `input[type=color]` + HEX / RGB / HSL channel editors
- Palette presets + gradient modes/behaviors (including hue-cycle) + blend + color behavior
- Interaction: Light Color / Interaction Color as 0–1 tint strength (RGB from material)

## Performance

- No extra WebGL contexts for thumbs
- Animation gain is ALU-only in existing FRAG
- Blob revoke owned by playground `handleSourceChange`

## Mobile / desktop

- Mobile FitStage + thicker scrollbar targets
- Desktop playground layout unchanged
- Verify at 320 / 768 / 1280 on `/demos/maser-dither-engine`

## Known limitations (debt)

- Canvas2D fallback still lacks full algorithm parity
- Project JSON cannot persist blob image URLs
- Interaction light “color” remains grayscale strength by design
- Live Material Dock WebGL thumbs deferred (context budget)
- Some chrome adapters still `preview` status (nav, button, badge, input, progress, loader)

## Sprint 8 recommendations

1. Persist uploaded images as data URLs or IndexedDB for projects
2. Visual regression suite: algorithm × matrix × material × animation
3. Shared offscreen blit for dock thumbs (still one context)
4. Component inspector as first-class dock target
5. Canvas2D Bayer+ parity or explicit “WebGL only” badge
6. Optional RGB interaction lights if chroma-per-light is required
