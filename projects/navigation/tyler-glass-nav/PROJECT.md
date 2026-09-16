# Project: Tyler Vea Frost Disc Nav

> **NOT FINISHED — do not treat this merge as done.**  
> Lab demo is incomplete. Landing this on `main` parks the frost disc in maser-lab only.  
> **Live tylervea.com ship is a later PR.** Do not mount, transfer, or mark `ready` from this merge.

**Slug:** `tyler-glass-nav`  
**Category:** navigation  
**Status:** building  
**Created:** 2026-09-13

**Mode:** Implement (brief locked by requester + Elite Pixel Guy state table)  
**Kind:** section / chrome

## Design reference

- Figma: none
- Other: Elite Pixel Guy stills (dim peek, glowing peek, expanded quiet, expanded + slot/rim glow)
- Design spec: `FIGMA.md`

## Brief

### User / trigger
Visitors on tylervea.com reaching Home, Work, or Contact. Occasional (a few times per session). Desktop hover; mobile tap.

### Job
One circular frost disc parked bottom-center. Peek the top rim when idle; ease the same disc up to three icon slots. No visible text.

### Object
CSS `backdrop-filter` frost disc (not vgpu / WebGL / SVG liquid lens).

### Current behavior
Greenfield in maser-lab. Do not ship to tylervea.com in this pass.

### Desired outcome
Four pointer states match the locked token table. Keyboard snap-open. Reduced motion instant. Reduced transparency solid floor.

### Success signal
Peek is the same disc translated up (no morph). Hover gated to fine pointers. Click navigates; next load starts at peek.

### Non-goals
Bloom soup, neon multi-layer rims, labels on glass, morphing peek→arc, ease-in, animating blur, SVG displacement, overflow:hidden on frost ancestors, shader field, stacked glass panes, live-site header socials, computer-use QA, interpolating frost values.

## Compact decision

| Field | Value |
| --- | --- |
| User | Site visitor wayfinding |
| Job | Reach Home / Work / Contact |
| Scope | One disc, three slots |
| Action | Hover/tap peek; activate a slot |
| Consequence | Navigate; disc returns to peek on next load |
| Reversibility | Fine-pointer leave (75ms). Coarse: tap peek again, tap outside, or a link |

## States

- [ ] Dim peek (idle)
- [ ] Glowing peek
- [ ] Expanded quiet
- [ ] Expanded + slot glow (hovered slot)
- [ ] Active route, no hover (expanded quiet + brighter slot, no glow)
- [ ] Desktop hover expand (`(hover: hover) and (pointer: fine)`)
- [ ] Mobile tap peek to pin (220ms ease-out, stay open); tap peek again or outside to close; finger-up does not collapse; tap a slot navigates; peek names Open/Close navigation + aria-expanded
- [ ] Keyboard: peek focus snaps open at 0ms; Tab through Home, Work, Contact; focus-visible ring
- [ ] prefers-reduced-motion (instant expand/collapse)
- [ ] prefers-reduced-transparency (floor fill, no blur)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | CSS transform on wrapper | `rule/gpu-properties-only`; never animate blur |
| Duration | 220ms pointer; 0ms keyboard / reduced motion | 200–250ms lock; `rule/no-keyboard-motion` |
| Easing | `cubic-bezier(0.23, 1, 0.32, 1)` | Never ease-in (`rule/ease-out-enter`) |
| Hover | Gated to fine pointer | `rule/hover-gated` |
| Leave | 75ms delay | Stay open across slot gaps |

## Locked tokens (verbatim — do not interpolate)

Static: `--nav-frost-blur: 12px`; `--nav-frost-saturate: 170%`; `--nav-frost-fill-floor: rgba(12, 14, 18, 0.92)`; `--nav-outer-lift: 0 8px 24px rgba(0, 0, 0, 0.35)`; dual `-webkit-backdrop-filter` + `backdrop-filter`; floor first, then `@supports`.

| State | Fill / slots | Rim | Inset | Extra |
| --- | --- | --- | --- | --- |
| 1 Dim peek | fill `rgba(255,255,255,0.10)` | `1px solid rgba(255,255,255,0.16)` | `inset 0 1px 0 rgba(255,255,255,0.28)` | no outer glow; rim only |
| 2 Glowing peek | fill `rgba(255,255,255,0.14)` | `1px solid rgba(255,255,255,0.28)` | `inset 0 1px 0 rgba(255,255,255,0.45)` | outer `0 0 12px rgba(180, 210, 255, 0.12)` |
| 3 Expanded quiet | shell `rgba(255,255,255,0.14)`; slots `rgba(255,255,255,0.08)` | `1px solid rgba(255,255,255,0.22)` | `inset 0 1px 0 rgba(255,255,255,0.35)` | ghost icon `rgba(255,255,255,0.55)`; lift only |
| 4 Expanded + slot | shell same as 3; active slot `rgba(255,255,255,0.22)` | active edge `rgba(255,255,255,0.32)` | active inset `0 1px 0 rgba(255,255,255,0.55)` | icon `#FFFFFF`; slot only `0 0 12px rgba(180, 210, 255, 0.12)` |
| Active route (no hover) | same as 3 + slot fill `rgba(255,255,255,0.16)` | hair brighter rim (reuse active edge `0.32`) | — | solid white icon; no glow |

## Demo chrome

- `DemoControlMenu` knobs: reduced motion, force-expanded, reduced transparency, force shell state
- No frost α slider (would interpolate locked fills)
- Desktop: opaque left rail; product beside it
- Mobile: product first screen; knobs under the fold
- Lab-only full-bleed forest still on `.lab-demo-field` (`demo/forest-ground.png`); product barrel stays black / host ground

## Acceptance criteria

- [ ] Demo route `/demos/tyler-glass-nav` renders all states above
- [ ] Stub paths Home `/` · Work `/work` · Contact `/contact` (demo query `r`)
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Product barrel has no demo-chrome
- [ ] `prefers-reduced-motion` and `prefers-reduced-transparency` honored
- [ ] aria-label exactly Home, Work, Contact; peek `Open navigation` / `Close navigation`; SVG `aria-hidden`

## Open decisions

- Icon mark pack vs placeholders — **accepted: Dr Leak locked pack** (idle stroke + solid files, viewBox 0 0 24 24, stroke 1.5)
- Live tylervea.com mount — out of scope

## Accepted decisions

- CSS glass only; one frost layer; wrapper transform/opacity only
- Exact Elite Pixel Guy fills/rims — no mid-range interpolation
- Approver: requester lock (this brief)
