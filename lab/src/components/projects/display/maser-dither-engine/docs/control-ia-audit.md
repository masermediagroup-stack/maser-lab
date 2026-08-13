# Control IA Audit — Lab Shell (v0.8)

Extends [sprint5-control-audit.md](./sprint5-control-audit.md). **Shell-only** — do not reintroduce Sprint 5 ownership duplicates.

## Panel owners (current)

| Category (UI label) | `ControlGroupId` / chrome | Owns | Must not own |
| --- | --- | --- | --- |
| Presets | `presets` | Look snapshot chips | Structure packing |
| Content | `content` | Copy, layout, source image, inspector | Engine uniforms |
| Structure | `material` → `ProceduralMaterialPanel` | Material ID + structure params + layer recipe | Palette chroma |
| Palette | `colors` strip → `MaterialPanel` (file name legacy) | Palettes, HEX/RGB/HSL, color enable | Structure / behavior chips |
| Color tone | `colors` accordion fields | Brightness / contrast / gradient tone | Palette picker |
| Dither | `dither` | Algorithm, matrix, pattern, posterize | Material ID |
| Lighting | `lighting` | Light shape + bloom family | Chroma |
| Animation | `animation` | Modes + master time | Material ID |
| Interaction | `interaction` | Pointer physics / influence | Material fiber params |
| Finish | `finish` | Grain, UV soft clamp, opacity | Dither algorithm |
| Export | `export` | Snippet + link to Export workspace | Runtime packing |

## Rename map (human labels)

| Was | Now |
| --- | --- |
| “Color materials” / palette strip “Palette & colors” | **Palette** |
| Accordion “Material” | **Structure** |
| Mobile tab “Color” (`materials`) | **Look** (Palette + Structure) |
| “Color tone” | unchanged (tone sliders only) |

Engine API (`material` prop, `uMatId`) stays — labels only.

## Desktop IA target

- Right rail: **category list** (single-select) + **one** open panel body.
- Categories: Presets · Content · Structure · Palette · Dither · Lighting · Animation · Interaction · Finish · Export
- Exclusive-open: selecting a category closes others (Debug/Advanced may offer “Expand all”).
- Base plate strip may stay pinned; do not pin full Palette body on every category.
- Material Dock remains a structure **picker** on the stage, not a second inspector.

## Mobile IA target

≤5 bottom destinations:

| Tab | Focuses |
| --- | --- |
| Preview | Sheet closed |
| Look | Palette + Structure (`colors`, `material`) |
| Light | Lighting |
| Content | Content / inspector |
| More | Animation · Interaction · Finish · Export (+ Projects action) |

## Preset thumb policy

- System / null `thumbnailDataUrl` → **no** empty image frame.
- List/row: title + material/family chip (CSS tint OK) + meta.
- Real `<img>` only when `thumbnailDataUrl` is set (user save / blit).
- Do not require generating thumbs for every system preset.

## Storage

Panel open state key bumped to `mde:panels:v3` with exclusive defaults (one primary open).
