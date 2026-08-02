# Sprint 6 — Material System Expansion

## Architecture

`engine/material/` owns procedural material structure. It is **not** a palette alias and does **not** duplicate Color-panel exposure / density sliders.

| Module | Role |
| --- | --- |
| `types.ts` | IDs, families, layer recipe, specific params, uniform payload |
| `catalog.ts` | 11 ready definitions (monochrome + 10 core) with controls, tiers, a11y notes |
| `pack.ts` | Packs material-specific params into `uMatP0–P3` by ID |
| `MaterialController.ts` | Owns config; ticks → uniform payload (no shader recompile on value change) |
| `materialGlsl.ts` | Distinct UV / structure / finish math per material ID |

### Shared vs material-specific

**Shared (other panels):** exposure, palette, master animation speed, light position/shape, dither algorithm, overall opacity.

**Material-specific (Material panel only):** fiber, nap, anisotropy, curl, refraction, scanlines, etc. — keys listed in each definition’s `supportedControls`.

### Layer stack

Default recipe (max 10): Base → Gradient → Structure → Light → Dither → Grain → Interaction → Edge → Bloom → Finish.

Advanced mode: enable / bypass / solo. Bits packed into `uMatLayerBits`. Value changes never rebuild the program.

### Performance tiers

| Tier | Materials | Mobile fallback |
| --- | --- | --- |
| Lightweight | monochrome, paper | default |
| Standard | ink, velvet, metal, fog, glass, chrome | mild |
| Advanced | smoke, cloud, crt | `lowQuality` reduces FBM octaves / layers |

`SurfaceCanvas` sets `lowQuality` when width &lt; 360 or viewport &lt; 640.

### Adding a material

1. Add ID to `ProceduralMaterialId` + `MATERIAL_INDEX`
2. Add catalog entry with `supportedControls` / family / tier
3. Pack slots in `pack.ts`
4. Branch in `materialGlsl.ts` (`applyMaterialUv` / `sampleMaterialField` / `applyMaterialFinish`)
5. Optional preset in `presets/catalog.ts`

## UI

- **Materials page:** family filters, search, **CSS swatch** thumbs (not one WebGL context per card — context budget), favorites, detail with **one** live preview, side/swipe/A-B compare
- **Playground Material panel:** material picker + contextual sliders + Advanced layer recipe
- **Color panel:** palette / gradient only — behavior chips removed (structure is Material panel)

## Agent contracts

- `projects/display/maser-dither-engine/AGENTS.md`
- `engine/AGENTS.md`
- `docs/engine-lessons.md` — Sprint 6 black-screen causes and rules R1–R7

## Presets added

Warm Newsprint, Wet Ink, Black Velvet, Brushed Aluminum, Dense Smoke, Morning Fog, Soft Cloud, Frosted Glass, Liquid Chrome, Green Phosphor CRT.
