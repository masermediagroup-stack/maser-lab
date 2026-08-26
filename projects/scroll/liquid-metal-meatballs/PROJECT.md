# Project: Liquid Metal Meatballs

**Slug:** `liquid-metal-meatballs`  
**Category:** scroll  
**Status:** building  
**Created:** 2026-08-26  
**Kind:** section (decorative background canvas)

## Design reference

- Figma: none
- Other: Elite Pixel Guy locked thesis (Mercury, not jelly). Visual research for morph + travel only — see Accepted decisions.
- Design spec: `FIGMA.md` (no file)

## Brief

### User / trigger
Lab visitor scrolling a long page. Occasional — once per pass through a defined trigger zone, then a finite sequence. Not a high-frequency control.

### Job
Read page copy while a decorative Maser-blue mercury field crosses the viewport: spawn off random edges, arc, sticky-merge, exit a different edge. Copy stays readable; the canvas does not eat pointer events.

### Object
`LiquidMetalMeatballs` — fullscreen WebGL2 2D field (SDF + quadratic smin), CPU trajectories.

### Current behavior
Greenfield.

### Desired outcome
Chrome meatballs (albedo `#10a4ff`, creases `#0065a3`, near-white spec). Color is a shared UV/IDW wet-mercury wash on the merged SDF. Isolated discs are a continuous wet wash (spec lifted equally in every IDW stop — no radial field-depth, no `length(p-c)` sheen, no per-ball lamp, no nipple). Deep crease from smin; grazing spec from `dFdx/dFdy` of the smin crease (neck walls only — not `normalize(dFdx(d))`).

### Success signal
Scroll into the marked trigger zone → balls spawn from edges, arc, neck/swallow when they pass, exit off a different edge, then die. Sitting still after leaving the zone lets remaining balls finish. Reduced motion shows a frozen cluster. Hidden tab pauses. Type on top remains readable.

### Non-goals
- Client-site port in this drop
- 3D raymarch hero / env-mapped PBR blob
- Pointer-follow goo, marching squares, idle lava-lamp loops
- Surface noise that reads as organic flesh
- Restyling lab chrome

### Scope
One scroll-category lab section + demo route. Lab chrome OK.

### Action
Scroll into the trigger area (demo also exposes Replay).

### Consequence
A finite meatball sequence runs on the decorative canvas behind copy.

### Reversibility
Leave the trigger (majority out of view, or section bottom past): spawning stops, in-flight balls finish and die. Reduced-motion toggle / OS `prefers-reduced-motion` freezes a still cluster; turning RM off restarts the rAF loop. Replay force-restarts the sim. Tab hide pauses the loop.

## States

- [x] idle (trigger majority not in view — empty field)
- [x] sequence (majority of trigger in view — spawn + travel)
- [x] finishing (left trigger / section bottom past — no new spawns, balls complete arcs)
- [x] prefers-reduced-motion (still cluster, no travel)
- [x] reduced-motion off (rAF + sim restart; Replay force-restarts regardless of state)
- [x] light ground / dark ground (demo bar; same metal, two page grounds)
- [x] tab hidden (rAF paused)
- [x] WebGL unavailable (static CSS cluster)
- [ ] hover (N/A — decorative, `pointer-events: none`)
- [ ] focus (N/A — no interactive product controls)
- [ ] loading / success / error / disabled (N/A)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | WebGL2 fullscreen triangle + CPU sim | 2D field shader; merge in SDF — not DOM blobs |
| Merge | IQ quadratic polynomial smin | Neck then swallow; `k` is tension ([smin](https://iquilezles.org/articles/smin/)) |
| Stretch | None on isolated balls (circle SDF) | Screen-space discs stay circular; neck comes only from smin |
| Travel | Cubic bezier, spawn≠exit edge | Weight ∝ radius; no sine/cos orbits |
| Duration | ~1.7–5.2s per ball | Sequence / delight, not UI chrome (`rule/ui-duration-cap` exception) |
| Reduced motion | Freeze still cluster | `rule/reduced-motion-required` |
| Pause | `visibilitychange` cancels rAF | Hidden tab only — scroll through the trigger does not remount GL |

## Three.js / 3D (optional)

| Field | Value |
| --- | --- |
| Target type | shader background (2D field, not a 3D scene) |
| Renderer | WebGL2 (raw, `gl_VertexID` triangle — dither-engine craft reference only) |
| Decorative? | yes — page works without canvas (CSS still cluster) |
| Fallback | static CSS radial cluster in product colors |
| Mobile strategy | DPR cap 1.25; same shader |
| Reduced motion | static cluster |
| Research docs checked | [IQ smin](https://iquilezles.org/articles/smin/); [Spoto 2D metaballs](https://salvatorespoto.github.io/post/meta-balls/); [4rknova CPU/GPU split](http://www.4rknova.com/blog/2025/09/21/blob-3d) (split only, not 3D PBR); Codrops droplet stretch (travel stretch only) |
| CloudAI-X skills used | `threejs-shaders` as GLSL craft reference; no Three.js scene |

## Acceptance criteria

- [x] Demo route `/demos/liquid-metal-meatballs` exists via DemoHost
- [x] `npm run build` passes in `lab/` (project files lint clean; repo `npm run lint` still fails on pre-existing `pixel-info-card` setState-in-effect)
- [x] Scroll trigger starts the sequence only when a **majority** of the zone is in view; section bottom stops new spawns; leftover balls finish (rendered). Charges spawn fully off-canvas and clip in on the weighted arc (no full-size pop, no scale/fade substitute). Peek at ~28% still does not spawn. Crossing the gate ramps new charges in/out — no spawn burst, no canvas remount, no hitch/flash (rendered).
- [x] Edge spawn / different-edge exit / sticky merge / shared mercury wash match the thesis (rendered) — no central belly/nipple on white or black; merged blobs share one continuous color field; isolated balls stay circular in screen space (neck only while smin-merging)
- [x] Demo reduced-motion toggle freezes a still cluster; toggling RM off and Replay both restart the sim without a full reload (rendered)
- [x] Demo Light / Dark grounds let the same metal be judged on white and black (rendered)
- [x] Mobile lab chrome is a compact chip that does not cover the hero headline or the meatball field (rendered)
- [x] Hidden tab pauses rAF (source + visibility handler)
- [x] Copy sits on the canvas with no frosted/dimmed plate (`pointer-events: none` on canvas; glyph ink halo on Light and Dark; rendered)
- [x] Component exported from `lab/src/components/projects/scroll/liquid-metal-meatballs/index.ts` (product-only)

## Open decisions

- Texture-packed 1×N centers (4rknova) vs `uniform vec4 uBalls[16]` — uniforms are enough at this charge count. Revisit only if charge count grows.
- Exact `k` (merge tension) is locked from the timed canvas pass (`LMM_MERGE_K = 24`). Coloring is IDW in object UV after smin (Paper MeshGradient structure, Maser palette). No per-ball facing spec.

## Accepted decisions

# Decision: 2D SDF field + quadratic smin (not CSS goo, not 3D raymarch)

Status: accepted (locked by brief)

Scope: `scroll/liquid-metal-meatballs`

Decision:
CPU owns ball trajectories. GPU evaluates a 2D SDF of charges, merged with Inigo Quilez **quadratic polynomial smin**. Isolated balls are circles in screen space; the merge neck is smin only (no velocity trail charge). Color is sampled **after** merge from a shared 5-stop Maser-blue palette in object UV via Shepard/IDW (`dist^2`, weight `1/(dist+eps)`). Every stop gets the same spec lift and the exponent stays broad so a solo reads as continuous wet mercury, not a UV cone and not matte plastic. No contour lighting from `max(-d,0)` or `length(p-c)` (that plants a pin at the disc origin). Deep crease from smin blend. Grazing spec uses `dFdx/dFdy` of the smin **crease** (neck walls only). Do not light with `normalize(dFdx(d), dFdy(d))` — on each lobe that is still `p-c` and plants a facing pin. Colors locked: albedo `#10a4ff`, creases `#0065a3`, spec near-white. No per-ball Blinn-Phong, no `N = p - ballCenter`.

Rationale:
Spark build note + Elite Pixel Guy thesis. 3D PBR blob and mouse-trail goo were researched and refused.

Evidence:
IQ smin article; Spoto 2D metaballs; 4rknova CPU/GPU split (positions, not their 3D material); Codrops droplet stretch (stretch only).

Exceptions:
If 2D metal cannot read as chrome after a rendered pass, a 3D raymarch fallback is allowed by the brief. Do not start there.

Assumptions:
Quadratic smin (circular primaries) reads as mercury, not jelly, when `k` stays in the neck-thickness range and there is no idle orbit.

Open decisions:
`k` is locked. Coloring structure is locked to combined-field IDW.

Approver:
Locked design brief (Elite Pixel Guy / Spark) — lab experiment, not a new visual system.
