/**
 * Sprint 8 — Component-specific TRANSFER.md generator.
 */

import { ENGINE_NAME, ENGINE_VERSION } from "../constants";
import { getComponent } from "../components/registry";
import { buildDependencyManifest } from "./dependencies";
import { buildCssVariables } from "./tokens";
import type {
  Completeness,
  MaserDitherExport,
  ReactExportStrategy,
} from "./types";

export function generateTransferMarkdown(
  doc: MaserDitherExport,
  options: {
    strategy?: ReactExportStrategy;
    completeness?: Completeness;
  } = {},
): string {
  const runtime = doc.runtime;
  const def = getComponent(runtime.componentId);
  const strategy = options.strategy ?? "shared-runtime";
  const deps = buildDependencyManifest(strategy);
  const cssVars = Object.keys(buildCssVariables(runtime)).join(", ");
  const wrapper = `MaserDither${(def?.label ?? runtime.componentId).replace(/\s+/g, "")}`;

  const required = deps.dependencies
    .filter((d) => d.classification === "required-runtime")
    .map((d) => `- **${d.name}** — ${d.reason}`)
    .join("\n");

  const excluded = deps.dependencies
    .filter((d) => d.classification === "maser-lab-only")
    .map((d) => `- ${d.name}: ${d.reason}`)
    .join("\n");

  return `# Transfer — ${def?.label ?? runtime.componentId}

**Source:** ${ENGINE_NAME} v${doc.engineVersion || ENGINE_VERSION}  
**Schema:** ${doc.schemaVersion}  
**Component:** \`${runtime.componentId}\`  
**Material:** \`${runtime.material.materialId}\`  
**Strategy:** ${strategy === "shared-runtime" ? "Shared Runtime" : "Standalone Bundle"}  
**Exported:** ${doc.createdAt}

## What was exported

- Component type: **${def?.label ?? runtime.componentId}**
- Editable content (titles, labels, chrome)
- Material recipe: \`${runtime.material.materialId}\`
- Palette / color: enabled=${runtime.color.colorEnabled}
- Lighting shape + interaction mode \`${runtime.interaction.modeId}\`
- Animation mode \`${runtime.animation.modeId}\`
- Dither algorithm \`${runtime.dither.algorithm}\`
- Accessibility reduced-motion policy: \`${runtime.accessibility.reducedMotionPolicy}\`
${doc.project ? `- Project: **${doc.project.name}**` : ""}

## Required dependencies

${required}

## Do not transfer

${excluded}

## File structure

\`\`\`text
${wrapper.toLowerCase()}/
├── components/${wrapper}.tsx
├── config/material-config.ts
├── styles/maser-dither.css
├── types/
├── README.md
├── package.json
└── TRANSFER.md
${
  strategy === "standalone"
    ? "└── engine/   (copy required runtime modules)\n"
    : ""
}
\`\`\`

## Installation

1. ${
    strategy === "shared-runtime"
      ? "Ensure the host app includes the Maser Dither runtime barrel (`engine/` + `SurfaceCanvas` + adapters)."
      : "Copy the listed runtime modules from the lab package into your app (see engine/README.md)."
  }
2. Copy the generated component + \`config/material-config.*\` + CSS tokens.
3. Import \`tokens.css\` / \`maser-dither.css\` if using adapter chrome styles.
4. Do **not** copy \`shell/\`, Preset Studio, or Lab navigation.

## Usage

\`\`\`tsx
import { ${wrapper} } from "./components/${wrapper}";

export function Example() {
  return (
    <${wrapper}
      className="w-full"
      ${
        runtime.componentId === "image-frame"
          ? 'src="/images/project-image.jpg"\n      alt="Project description"'
          : ""
      }
    />
  );
}
\`\`\`

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| \`className\` | \`string\` | Host layout styling |
| \`content\` | \`Partial<ComponentContent>\` | Override copy / chrome |
| \`reducedMotion\` | \`boolean\` | Force reduced motion; default honors OS |
| \`src\` | \`string \\| null\` | Image Frame / Avatar public path |
| \`alt\` | \`string\` | Accessible name / caption |

## Configuration

Runtime configuration lives in \`config/material-config.ts\` (completeness: ${options.completeness ?? "minimal"}).  
Shader-internal uniforms are **not** exposed as CSS variables.

CSS-safe tokens: ${cssVars}

## Responsive / mobile

${def?.mobileNotes ?? "Contain width; prefer DPR ≤ 2; pause offscreen when possible."}

## Accessibility

${def?.a11yNotes ?? "Preserve semantic elements and focus visibility."}

- Reduced motion policy: \`${runtime.accessibility.reducedMotionPolicy}\`
- SurfaceCanvas pauses animation timeline and interaction motion when reduced motion is active.

## Performance

${def?.performanceNotes ?? "One WebGL surface; prefer a single live context."}

- Target: 120 FPS desktop / 60 FPS mobile (engine guidance).
- Dispose on unmount (handled by SurfaceCanvas).

## Asset replacement

${
  runtime.componentId === "image-frame" || runtime.componentId === "avatar"
    ? `Pass \`src\` to a public path. Do not ship \`blob:\` URLs. Alt text is required for content images.`
    : runtime.sourceUrl
      ? `Primary source: \`${runtime.sourceUrl}\`. Replace if this path is environment-specific.`
      : "No primary source image embedded."
}

## Customization

- Edit \`material-config\` for material / color / dither / animation.
- Override \`content\` props for copy without re-exporting.
- Re-open the project in ${ENGINE_NAME} and re-export to refresh the look.

## Known limitations

- Canvas2D fallback does not fully match every dither algorithm.
- Nested Lab editor chrome is intentionally excluded.
- Large base64 images inflate bundles — prefer public paths.

## Updating later

1. Open the project in ${ENGINE_NAME} (import \`.maser-dither.json\` if needed).
2. Adjust material / content.
3. Re-run Export → Component Package / React Component.
4. Replace the transferred files — keep host \`className\` / routing wrappers.
`;
}
