# Heatmap poster

Lab tool. Not the Dallas meetup. One file, this project only.

## Reader and job

A designer in maser-lab uploads a photo or a logo and gets a poster where heat follows the **silhouette shape**. Image goes in as a shape; inner glow, outer glow, and contour push a wave through it. They judge on the public preview by throwing random files at it.

Do not heat a person. Do not find a subject. If a JPEG is fed in as-is and shadows go hot, it failed. If a logo mark is ignored and the plate stays Ground, it failed.

Format: 9:16 or A4. Lives as a maser-lab PR. Audience is us.

## Facts vs decisions

Facts: Paper greyscales, packs contour + two blurs into RGB once on the CPU, then a shader drives an intensity wave through that pack. Dark ink on white paper is the shape. The lab runs that field on **vgpu** (Canvas 2D if the adapter fails). Not raw WebGL. Not `@paper-design/shaders-react`. Do not `npm i` that package.

The LUT is ours: three IR stops, Heat / Mid / Ground (`--heatmap-heat` `--heatmap-mid` `--heatmap-ground`). Ground is the cold field and colorBack. Type stays out of the LUT.

Decisions below are the look.

## Steal (Paper’s field, not their rainbow skin)

Paper heats a SHAPE.

- Image-as-shape
- Contour on the edge
- Glow in and out
- Animated intensity wave
- CPU pack once (contour + two blurs in RGB), then the shader
- vgpu, not raw WebGL, not their React package

Defaults (not extra knobs): contour 0.5, innerGlow 0.5, outerGlow 0.5. Wave and Speed already drive the wash.

Steal the heat formula. Do not steal the seven-color rainbow, the apple-logo easter egg, Geist, or their component.

## Keep (poster, ramp, type, knobs)

- The poster card (9:16 / A4, image plate + caption plate, one hairline, black page vs indigo Ground)
- Three IR stops as the ramp: Heat / Mid / Ground. Ground is the cold field and colorBack.
- Type out of the LUT. Knobs stay Heat, Mid, Ground / Speed / Wave in the demo rail.
- Caption: PROMPT. Empty caption: Describe the image or add your own line.

Do not move the poster.

## Two inputs, same field

- Logo: the mark is already the shape (alpha or dark ink). Run the field on it.
- Photo: SILHOUETTE FIRST — ink on Ground — then the same wave. Never feed a JPEG in as-is. That’s shadow-as-hot, the horrible look.

Same pack, same shader. A full-bleed photo with no hole in the frame is still a shape (the plate stamp). It is not a person.

## Accepted copy (verbatim, Copy)

- Button: Upload a picture.
- Then: Replace picture.
- Empty: No image yet. Upload a photo or a logo.
- Reading: Reading the image.
- Error: That file won't open. Use a JPG or PNG.
- Too big: Too large. Under 20 MB.
- Knobs: Heat, Mid, Ground / Speed / Wave.
- Size toggle: 9:16 · A4.

- Caption label: PROMPT
- Caption placeholder: Describe the image or add your own line.

No "drag and drop your file here to get started." No exclamation points. Never auto-write a description. No generated caption, no filename echo, no "Untitled". If the user writes nothing, there is no line.

There is no Rough read line. Depth is gone. That state died with it. No replacement.

## Named refusal — subject-read is OFF

Parked. Do not put this back on the look.

Do not heat a person. Heat the silhouette shape.

Torn out of the look: Depth Anything, luma-mass, seatbelt, centre-bias, compactness winner, nearest-band. No depth swap. No winner blob. No “find the body.”

The locked mass numbers below are historical so nobody “fixes” the selfie by turning subject-read back on. They do not drive the field.

### Historical subject-mass (do not implement)

**The subject is the largest compact coherent mass** was the previous job. It is refused.

Depth, luma-mass, frame-contact 0.40, centre-bias 15%, nearest-band 30%, skip floor 0.05 (`FLAT_MASS_COMPACTNESS`) — all off the look. 0.05 stays a named refusal if someone tries to restore winner-blob: do not raise it, and do not restore the pipeline.

Centre-bias is not a prior. Hue is never heat. No saliency model. None of that is the field.

## Observable decisions

- Pack the upload once as a silhouette: logo ink, or photo flood-from-border remainder as solid ink, then Paper’s RGB pack (R contour, G outer, B inner). Never pack JPEG texture.
- Run that pack through Paper’s inner / outer / contour heat, then our three-stop LUT. Heat ≈ 0 is Ground.
- Hold contour, innerGlow, and outerGlow at 0.5 in the shader. Do not add knobs or CSS tokens for them.
- Let Wave and Speed drive the traveling wash through the packed shape. Reduced motion freezes the wash.
- Keep type out of the LUT. Labels, empty, error, and legal sit on Ground or on the rail, paper-white or ink, never rainbow.
- Treat grain as sensor noise on the field, not a second layer of decoration.
- Hold one diagnostic frame over the hot zone if a HUD earns a read. Never scatter grids, flags, or data tables.
- Render poster and Upload a picture before the GPU exists. The plate fills to Ground. The field starts as soon as the pack and a driver exist. No spinner. No remount.
- Resolve Reading the image every time. It is the silhouette + pack pass only. Silent Canvas 2D if vgpu fails. On a pack error the poster still renders Ground. No Rough read line.
- Set every state label on Ground or the rail at one size and weight. A downgrade is not a warning: no badge, no amber, no icon.
- Pack once per upload, cached. Caption length, size toggle, and knobs are layout events: they recrop nothing and never re-read the image, so Reading the image never comes back.
- Keep 9:16 and A4 as the only sizes. Same lock on both. The card's shape changes, the LUT does not.
- Read transparency as paper (white) in the pack, then Ground in the shader. Alpha is absence of ink, not a second subject.
- Set the page to black. Black is the page, indigo Ground is the coldest stop inside the field. They are not the same surface and the poster must not bleed into the page.
- Keep Ground clearly lighter than the page. The poster reads as a lit plate on a dead page, so the hairline confirms the edge rather than carrying it alone. If the two fuse on a dim screen, lift Ground, never lighten the page.
- Build the poster as one card on that black: image plate on top, caption plate directly under it, both inside a single hairline frame. No gap, no shadow, no floating panels.
- Give the image plate the field and the caption plate the words. Type never sits on the heat.
- Set the caption plate on black with a mono label above the line, both in --heatmap-type. It reads as a specimen slug, not a UI card.
- Give the card the named ratio. 9:16 or A4 is the poster you export, so the card is that shape and the caption plate is inside it, never overflowing it.
- Let the caption plate take the height its text needs and give the image plate the remainder.
- Show the caption placeholder while composing and collapse the plate on export. The prompt to write is editing chrome; an empty poster carries no placeholder and the image plate takes the full card. The frame does not move either way.
- Keep the placeholder out of card layout. It floats as chrome and takes no caption-plate height, so an empty caption collapses the same in compose and in export and the card geometry never differs between them.
- Render the poster one way. What is on screen is the file; the export flag hides the placeholder and changes nothing else. No second renderer.
- Draw the whole card on one surface: image plate, caption type, divider, and frame. Caption type is part of the poster, not chrome layered over it, so it wraps at the same words at any export scale. Only the input and the placeholder stay outside the card.
- Enter the reading state the instant a file lands. The plate fills to Ground, the reading line shows, and the silhouette pack runs. A blank card is never a legal state: it either reads, or it shows the error line. Never nothing.
- Leave knobs in the demo rail. Never on the poster.
- Steal the field on vgpu. Never lock the heat canvas to Canvas 2D first — WebGPU cannot take over a 2D context. GPU on a virgin canvas; 2D only if init/compile fails.

## Primitives Spark may name

`--heatmap-heat` white/yellow mass
`--heatmap-mid` magenta edge
`--heatmap-ground` indigo field
`--heatmap-type` paper-white on ground, ink on paper rail
`--heatmap-grain` sensor, low
`--heatmap-wave` frequency of the wash through the three stops
`--heatmap-speed` rate of that wash
`--heatmap-page` black, the page behind the poster
`--heatmap-frame` hairline around the card

No other color names. No Geist, vbg, triangle, or shared studio sheet.

## Generated-design refusals

- Paper's seven-color rainbow.
- Dark-as-hot JPEG / greyscale photo as the pack (shadow-as-hot).
- Thermal-painted type or thermal-painted marks that were not first a silhouette.
- HUD chrome all over (Style 03 window collage).
- Generated-face-as-hero. The upload is the shape.
- Drag-and-drop slop, fake urgency, exclamation points.
- Spinner, skeleton, or remount while the pack or GPU loads.
- Knobs on the poster.
- Contour / innerGlow / outerGlow as rail knobs.
- Cafe orange, Cursor paper, Dallas meetup assets.
- Poster floating on a gradient, drop shadow, or device mockup.
- Caption plate styled as a UI card: no rounded chips, no button, no border radius fighting the frame.
- `@paper-design/shaders-react`.
- Raw WebGL (new lab shaders stay on vgpu).
- Depth Anything, luma-mass, seatbelt, centre-bias, compactness winner, nearest-band — subject-read is OFF.

## Last-ten-corrections

1. **Field swap (this pass).** Steal Paper’s shape field (image-as-shape, contour, inner/outer glow, intensity wave, CPU RGB pack once, vgpu). Keep the poster card, the three IR stops, type out of the LUT, and the rail knobs. Photos silhouette first. Subject-read is a named refusal. Empty copy stays: No image yet. Upload a photo or a logo.
