/**
 * Sprint 8 — Export validation (Ready / Warning / Blocked).
 */

import { isExportableComponent } from "./schema";
import { estimateDataUrlBytes, isBlobUrl, isDataUrl } from "./assets";
import type {
  ExportValidationIssue,
  ExportValidationResult,
  MaserDitherExport,
  MaserDitherRuntimeConfig,
  PackageFileMap,
} from "./types";

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function push(
  issues: ExportValidationIssue[],
  issue: ExportValidationIssue,
): void {
  issues.push(issue);
}

export function validateRuntimeConfig(
  runtime: MaserDitherRuntimeConfig,
): ExportValidationResult {
  const issues: ExportValidationIssue[] = [];

  if (!isExportableComponent(runtime.componentId)) {
    push(issues, {
      code: "component-not-exportable",
      severity: "error",
      message: `Component "${runtime.componentId}" is not exportable.`,
      fix: "Choose a production component (card, button, navigation, …).",
      path: "runtime.componentId",
    });
  }

  if (isBlobUrl(runtime.sourceUrl)) {
    push(issues, {
      code: "blob-source",
      severity: "error",
      message: "Source image uses a non-portable blob: URL.",
      fix: "Use Reference, Include, Placeholder, or Base64 asset strategy.",
      path: "runtime.sourceUrl",
    });
  }

  if (isBlobUrl(runtime.content.cardCtaSourceUrl)) {
    push(issues, {
      code: "blob-cta",
      severity: "error",
      message: "Card CTA photo uses a non-portable blob: URL.",
      fix: "Remove the CTA photo or export with an Include/Reference strategy.",
      path: "runtime.content.cardCtaSourceUrl",
    });
  }

  if (
    runtime.componentId === "image-frame" &&
    !runtime.sourceUrl &&
    !runtime.content.imageCaption
  ) {
    push(issues, {
      code: "image-alt-missing",
      severity: "warning",
      message: "Image Frame has no source and weak caption/alt guidance.",
      fix: "Set a caption or provide an external image path before export.",
      path: "runtime.content.imageCaption",
    });
  }

  if (runtime.componentId === "image-frame" && runtime.sourceUrl) {
    if (!runtime.content.imageCaption?.trim()) {
      push(issues, {
        code: "image-alt-required",
        severity: "warning",
        message: "Content images should have meaningful alt/caption text.",
        fix: "Fill Image caption in Content, or set accessibility.ariaLabel.",
        path: "runtime.content.imageCaption",
      });
    }
  }

  if (runtime.componentId === "card" && !runtime.content.cardTitle?.trim()) {
    push(issues, {
      code: "card-title-missing",
      severity: "warning",
      message: "Card has no title.",
      fix: "Add a card title in Content, or accept empty for decorative use.",
      path: "runtime.content.cardTitle",
    });
  }

  if (runtime.componentId === "button" && !runtime.content.buttonLabel?.trim()) {
    push(issues, {
      code: "button-label-missing",
      severity: "error",
      message: "Button requires accessible label text.",
      fix: "Set buttonLabel in Content.",
      path: "runtime.content.buttonLabel",
    });
  }

  if (runtime.componentId === "input" && !runtime.content.inputLabel?.trim()) {
    push(issues, {
      code: "input-label-missing",
      severity: "error",
      message: "Input requires a form label.",
      fix: "Set inputLabel in Content.",
      path: "runtime.content.inputLabel",
    });
  }

  if (runtime.content.labelColor && !HEX_RE.test(runtime.content.labelColor)) {
    push(issues, {
      code: "invalid-label-color",
      severity: "error",
      message: `Invalid label color "${runtime.content.labelColor}".`,
      fix: "Use a #RGB, #RRGGBB, or #RRGGBBAA hex color.",
      path: "runtime.content.labelColor",
    });
  }

  const contrast = runtime.params.contrast;
  if (typeof contrast !== "number" || Number.isNaN(contrast) || contrast < 0) {
    push(issues, {
      code: "invalid-contrast",
      severity: "error",
      message: "Contrast must be a finite non-negative number.",
      fix: "Reset contrast in the Material / Finish controls.",
      path: "runtime.params.contrast",
    });
  }

  if (!runtime.accessibility?.reducedMotionPolicy) {
    push(issues, {
      code: "missing-reduced-motion",
      severity: "error",
      message: "Reduced-motion policy is missing.",
      fix: "Set accessibility.reducedMotionPolicy to honor (recommended).",
      path: "runtime.accessibility.reducedMotionPolicy",
    });
  }

  if (
    runtime.animation &&
    typeof (runtime.animation as { modeA?: string }).modeA === "undefined" &&
    typeof (runtime.animation as { primaryMode?: string }).primaryMode ===
      "undefined" &&
    !("mode" in (runtime.animation as object))
  ) {
    // Animation configs vary — only warn if completely empty object somehow
  }

  const bytes =
    estimateDataUrlBytes(runtime.sourceUrl) +
    estimateDataUrlBytes(runtime.content.cardCtaSourceUrl);
  if (bytes > 1_500_000) {
    push(issues, {
      code: "large-base64",
      severity: "warning",
      message: `Embedded image data is ~${Math.round(bytes / 1024)}KB.`,
      fix: "Prefer Reference or Include-as-file for large assets.",
      path: "runtime.sourceUrl",
    });
  }

  if (runtime.sourceUrl && isDataUrl(runtime.sourceUrl)) {
    push(issues, {
      code: "base64-embedded",
      severity: "warning",
      message: "Source image is embedded as base64.",
      fix: "Confirm Base64 strategy intentionally, or switch to Reference.",
      path: "runtime.sourceUrl",
    });
  }

  return finalize(issues);
}

export function validateExportDoc(
  doc: MaserDitherExport,
): ExportValidationResult {
  const issues: ExportValidationIssue[] = [];

  if (!doc.schemaVersion) {
    push(issues, {
      code: "missing-schema",
      severity: "error",
      message: "schemaVersion is required.",
      fix: "Re-export from Maser Dither Engine 0.8+.",
    });
  }

  if (!doc.engineVersion) {
    push(issues, {
      code: "missing-engine-version",
      severity: "warning",
      message: "engineVersion is missing.",
      fix: "Stamp ENGINE_VERSION on export.",
    });
  }

  if (!doc.runtime) {
    push(issues, {
      code: "missing-runtime",
      severity: "error",
      message: "runtime configuration is required.",
      fix: "Include a valid runtime block.",
    });
    return finalize(issues);
  }

  const runtimeResult = validateRuntimeConfig(doc.runtime);
  issues.push(...runtimeResult.issues);

  if (doc.kind === "project" && !doc.project?.name?.trim()) {
    push(issues, {
      code: "project-name-missing",
      severity: "warning",
      message: "Project export has no name.",
      fix: "Set a project name before exporting.",
      path: "project.name",
    });
  }

  return finalize(issues);
}

export function validateGeneratedPackage(
  pkg: PackageFileMap,
): ExportValidationResult {
  const issues: ExportValidationIssue[] = [];

  for (const file of pkg.files) {
    if (
      /from\s+["'][^"']*shell[^"']*["']/.test(file.content) ||
      file.content.includes("DitherEngineApp") ||
      /from\s+["'][^"']*demo-chrome[^"']*["']/.test(file.content)
    ) {
      push(issues, {
        code: "editor-import",
        severity: "error",
        message: `Generated file ${file.path} appears to import editor/lab shell code.`,
        fix: "Use shared-runtime export or regenerate the package.",
        path: file.path,
      });
    }
  }

  const labOnlyRequired = pkg.dependencies.dependencies.filter(
    (d) =>
      d.classification === "maser-lab-only" &&
      // Only block if somehow marked required — listing exclusions is intentional
      false,
  );
  void labOnlyRequired;

  // Ensure package.json / generated files do not require lab-only packages
  for (const file of pkg.files) {
    if (file.path === "package.json") {
      try {
        const parsed = JSON.parse(file.content) as {
          dependencies?: Record<string, string>;
          peerDependencies?: Record<string, string>;
        };
        const names = {
          ...parsed.dependencies,
          ...parsed.peerDependencies,
        };
        for (const name of Object.keys(names)) {
          if (
            name.includes("leva") ||
            name.includes("demo-chrome") ||
            name === "three"
          ) {
            push(issues, {
              code: "lab-only-deps",
              severity: "error",
              message: `Package.json includes Maser-Lab-only dependency: ${name}`,
              fix: "Remove lab-only deps from the production package.",
            });
          }
        }
      } catch {
        // ignore
      }
    }
  }

  if (!pkg.dependencies.dependencies.some((d) => d.name === "react")) {
    push(issues, {
      code: "missing-react",
      severity: "warning",
      message: "Dependency manifest does not list React.",
      fix: "Ensure the host app provides React 19.",
    });
  }

  return finalize(issues);
}

function finalize(issues: ExportValidationIssue[]): ExportValidationResult {
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarning = issues.some((i) => i.severity === "warning");
  return {
    status: hasError ? "blocked" : hasWarning ? "warning" : "ready",
    issues,
  };
}
