# Heatmap poster

Lab tool. Not the Dallas meetup. One file, this project only.

## Reader and job

A designer in maser-lab uploads a picture and gets a poster where heat follows the subject. They judge on the public preview by throwing random images at it. If a photo of a person heats the shadows, it failed.

Format: 9:16 or A4. Lives as a maser-lab PR. Audience is us.

## Facts vs decisions

Facts: Paper greyscales, packs contour + two blurs, and treats dark pixels as hot. Depth Anything V2 Small (`onnx-community/depth-anything-v2-small` via transformers.js) is the primary read. Luma + edge is the no-WebGPU fallback. Model is ~100MB and must not gate first paint.

Decisions below are the look.

## Accepted copy (verbatim, Copy)

- Button: Upload a picture.
- Then: Replace picture.
- Empty: No image yet. Upload one and the heat follows the subject.
- Reading: Reading the image.
- Error: That file won't open. Use a JPG or PNG.
- Too big: Too large. Under 20 MB.
- Knobs: Heat, Mid, Ground / Speed / Wave.
- Size toggle: 9:16 · A4.

No "drag and drop your file here to get started." No exclamation points.

## Observable decisions

- Map heat to subject mass, not to dark pixels. Near depth is hot. Depth discontinuity is magenta. Far field is indigo ground.
- Use three IR stops only: Heat (white/yellow on mass), Mid (magenta at the edge), Ground (indigo). Knobs retint those three. They do not add stops.
- Keep type out of the LUT. Labels, empty, error, and legal sit on Ground or on the rail, paper-white or ink, never rainbow.
- Treat grain as sensor noise on the field, not a second layer of decoration.
- Hold one diagnostic frame over the hot zone if a HUD earns a read. Never scatter grids, flags, or data tables.
- Render poster and Upload a picture before the model exists. Show fallback heat while depth computes.
- Swap as soon as depth lands. Cross-fade the mask so it settles. Do not hold the fallback to hide the shift. No spinner. No remount.
- Move only the heat field on that swap. Crop, frame, and the three stops stay put.
- Discard a low-variance depth field outright and stay on luma+edge. Never blend a weak field in at half strength; a flat input (logo, type, line drawing) is not a subject.
- Resolve Reading the image every time. Silent to fallback on no-WebGPU or a discarded field; on a model error the poster still renders and the label reads Rough read. Depth is off on this browser.
- Set every state label on Ground or the rail at one size and weight. A downgrade is not a warning: no badge, no amber, no icon.
- Run the model once per upload, cached. Not per frame.
- Keep 9:16 and A4 as the only sizes. Same lock on both. Crop changes, the LUT does not.
- Leave knobs in the demo rail. Never on the poster.

## Primitives Spark may name

`--heatmap-heat` white/yellow mass
`--heatmap-mid` magenta edge
`--heatmap-ground` indigo field
`--heatmap-type` paper-white on ground, ink on paper rail
`--heatmap-grain` sensor, low
`--heatmap-wave` frequency of the wash through the three stops
`--heatmap-speed` rate of that wash

No other color names. No Geist, vbg, triangle, or shared studio sheet.

## Generated-design refusals

- Paper's seven-color rainbow.
- Dark-as-hot / greyscale contour heat.
- Thermal-painted type or thermal-painted marks.
- HUD chrome all over (Style 03 window collage).
- Generated-face-as-hero. The upload is the subject.
- Drag-and-drop slop, fake urgency, exclamation points.
- Spinner, skeleton, or remount while the model loads.
- Knobs on the poster.
- Cafe orange, Cursor paper, Dallas meetup assets.
