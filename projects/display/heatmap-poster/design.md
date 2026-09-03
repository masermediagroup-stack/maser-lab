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

- Caption label: PROMPT
- Caption placeholder: Describe the image or add your own line.

No "drag and drop your file here to get started." No exclamation points. Never auto-write a description. No generated caption, no filename echo, no "Untitled". If the user writes nothing, there is no line.

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
- Read the upload once and cache the focal point with it. Caption length, size toggle, and knobs are layout events: they recrop against that cached point and never re-read the image, so the subject holds still and Reading the image never comes back.
- Keep 9:16 and A4 as the only sizes. Same lock on both. The card's shape changes, the LUT does not.
- Read transparency as Ground. Alpha is absence, not cold and never heat; composite the upload onto Ground before any read so a cutout PNG cannot grow a fake subject.
- Keep noise off the heat read. Texture and grain are surface, not mass; a noisy flat input stays on Ground.
- Set the page to black. Black is the page, indigo Ground is the coldest stop inside the read. They are not the same surface and the poster must not bleed into the page.
- Keep Ground clearly lighter than the page. The poster reads as a lit plate on a dead page, so the hairline confirms the edge rather than carrying it alone. If the two fuse on a dim screen, lift Ground, never lighten the page.
- Build the poster as one card on that black: image plate on top, caption plate directly under it, both inside a single hairline frame. No gap, no shadow, no floating panels.
- Give the image plate the crop and the caption plate the words. Type never sits on the heat.
- Set the caption plate on black with a mono label above the line, both in --heatmap-type. It reads as a specimen slug, not a UI card.
- Give the card the named ratio. 9:16 or A4 is the poster you export, so the card is that shape and the caption plate is inside it, never overflowing it.
- Let the caption plate take the height its text needs and give the image plate the remainder. The image plate's aspect follows that remainder; the crop stays centered on the hot mass so the subject never slides out of frame.
- Show the caption placeholder while composing and collapse the plate on export. The prompt to write is editing chrome; an empty poster carries no placeholder and the image plate takes the full card. The frame does not move either way.
- Keep the placeholder out of card layout. It floats as chrome and takes no caption-plate height, so an empty caption collapses the same in compose and in export and the card geometry never differs between them.
- Render the poster one way. What is on screen is the file; the export flag hides the placeholder and changes nothing else. No second renderer.
- Draw the whole card on one surface: image plate, caption type, divider, and frame. Caption type is part of the poster, not chrome layered over it, so it wraps at the same words at any export scale. Only the input and the placeholder stay outside the card.
- Enter the reading state the instant a file lands. The plate fills to Ground, the reading line shows, and the luma pass paints immediately. The depth cross-fade arrives on top. A blank card is never a legal state: it either reads, or it shows the error line. Never nothing.
- Leave knobs in the demo rail. Never on the poster.

## Subject mass (Elite Pixel Guy, locked)

**The subject is the largest compact coherent mass.**

Depth, when it runs, is the near-field gate: threshold the nearest band, keep the biggest blob, score area × compactness. A seatbelt is near and long and has no area; it loses. Then normalize the ramp *inside* the winner, not across the frame.

On luma+edge: `|luma − borderMean|` is the bug in the look, not just a weak signal. "Unlike the frame edge" is how you find a window and a ceiling. Same mass rule, different stand-in for near-field: drop blobs whose contact with the frame is a large fraction of their own perimeter (ground planes, sky, ceiling, the window). Shoulders touching the bottom edge stay — they kiss one side, they don't *be* the frame. Largest compact remainder is the body. Then normalize inside it.

**Refusals, also verbatim:**
- Centre-bias is a tiebreak between two masses of comparable size. Not a prior. It would rescue this selfie and lie on a valid off-centre subject.
- Do not discount fingers, glasses, or hair after the region is chosen. They belong to the mass. Thinness only kills a *competing* region (the strap), not detail inside the winner.
- No saliency model. That's the true subject-mass answer and it is out of scope for a lab poster. Depth × area × compactness is the cheap version of the same idea.
- Hue is never heat. Sunset on skin stays structure.

This applies to **both** paths. This test had no adapter, so a depth-only rule would leave the window hot.

### Named checks (re-weight off the live canvas)

Compactness is `4π · area / perimeter²` (1 for a disk, ~0 for a long thin strap). Formula, not a knob. Relative score, no cutoff. Do not expose it as a slider. Engineering pick of EPG's "compactness."

Frame-contact fraction is `perimeter-on-image-edge / blob-perimeter`. Drop a blob when that fraction is **≥ 0.40** (`FRAME_CONTACT_MAX`). One full-side kiss survives (~0.25–0.30). A window or ceiling that eats two sides still dies. Do not add a second test (no "which sides" heuristic, no "bottom edge is allowed" special case).

**0.25 is a refusal** (`FRAME_CONTACT_REFUSAL`). It drops a valid 9:16 portrait whose body fills the bottom edge — the "shoulders kiss one side, they stay" case. Do not ship 0.25.

If dropping frame-contact blobs leaves nothing, fall back to the largest compact blob even if it touched the frame — a full-bleed subject is legal. Report when this fallback fires.

Centre-bias at **15%** (`CENTRE_TIEBREAK`) is the definition of "comparable": if the top two remaining blobs score within 15% of each other, prefer the one whose centroid is closer to frame centre. Tiebreak only. Never a prior. Never a weight on a clear winner.

Nearest-band starts at **30%** of the valid depth range (`NEAR_FIELD_BAND_START`) — first experiment, not a hard floor. If that band contains only a thin structure, do not crown it. Widen the band (`NEAR_BAND_STEP`) until a compact mass appears, or fall through to the luma mass. A 30% slice that is nothing but the belt is not a subject. Thin-structure for this widening test only: compactness **< 0.15** (`NEAR_BAND_THIN_COMPACTNESS`). That constant is not a cutoff when scoring blobs against each other. Do not crown a 100% band — that is the whole field, not a near mass.

Find-field binarize (luma path): Otsu on `|luma − borderMean| + Sobel`. Named, parameter-free. That field finds blobs. It is never the whole-frame ramp.

Winner centroid is the cached focal point, once per upload. Normalize the LUT inside the winner only. No morphological opening on the winner.

Mass selection is a photograph rule. A flat mark (logo, type, line) has no mass — compactness 0.012 is the tell, not a failed subject. Skip the winner-blob and paint luma+edge across the ink. Crowning an outline fragment would make the rest of the lockup Ground, which is the wrong read.

If the real file still hands Heat to the head and leaves the torso as an Otsu outline, bring that blob map. Don't invent a shoulder fill to make this selfie work.

After a would-be winner from area × compactness:

- If that winner's compactness is below **0.05** (`FLAT_MASS_COMPACTNESS`), this is a flat input. Skip winner-blob entirely. Do not normalize the LUT inside that outline. Paint luma+edge across the ink of the mark (the actual non-Ground pixels of the upload, after the usual Ground composite). The rest of the lockup must not fall to Ground just because an outline fragment scored highest.
- 0.05 is the named check of the 0.012 tell (`FLAT_MASS_EVIDENCE`). Logo compactness was 0.012; the reconstruction's head fill was 0.182. The floor has to catch outlines and miss filled masses. 0.05 is a re-weightable check. 0.012 stays in this file as the evidence, not the cutoff.
- If compactness is at or above 0.05, this is a photograph: keep the winner, normalize inside it, competing thin regions stay Ground, internal detail of the winner stays.

Do not use centre-bias, a second model, or morphological fill to "rescue" a torso. If Otsu only traces an outline on a real photograph, that is a blob-map case, not a skip case.

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
- Dark-as-hot / greyscale contour heat.
- Thermal-painted type or thermal-painted marks.
- HUD chrome all over (Style 03 window collage).
- Generated-face-as-hero. The upload is the subject.
- Drag-and-drop slop, fake urgency, exclamation points.
- Spinner, skeleton, or remount while the model loads.
- Knobs on the poster.
- Cafe orange, Cursor paper, Dallas meetup assets.
- Poster floating on a gradient, drop shadow, or device mockup.
- Caption plate styled as a UI card: no rounded chips, no button, no border radius fighting the frame.
