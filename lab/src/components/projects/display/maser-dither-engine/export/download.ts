/**
 * Sprint 8 — Download / clipboard helpers + ZIP packaging via fflate.
 */

import type { GeneratedFile, PackageFileMap } from "./types";

export function downloadTextFile(
  filename: string,
  content: string,
  mime = "application/json",
): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard?.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Build a simple ZIP (store / deflate) using dynamically imported fflate. */
export async function downloadPackageZip(
  pkg: PackageFileMap,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { zipSync, strToU8 } = await import("fflate");
    const files: Record<string, Uint8Array> = {};
    for (const file of pkg.files) {
      files[`${pkg.name}/${file.path}`] = strToU8(file.content);
    }
    // Manifest for unpackers
    files[`${pkg.name}/.maser-package.json`] = strToU8(
      JSON.stringify(
        {
          name: pkg.name,
          files: pkg.files.map((f) => f.path),
          dependencies: pkg.dependencies,
          estimatedBytes: pkg.estimatedBytes,
        },
        null,
        2,
      ),
    );
    const zipped = zipSync(files, { level: 6 });
    const blob = new Blob([zipped.buffer as ArrayBuffer], {
      type: "application/zip",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pkg.name}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return { ok: true };
  } catch (err) {
    // Fallback: download file-map JSON
    downloadTextFile(
      `${pkg.name}.package.json`,
      JSON.stringify(
        {
          name: pkg.name,
          files: Object.fromEntries(pkg.files.map((f) => [f.path, f.content])),
          dependencies: pkg.dependencies,
        },
        null,
        2,
      ),
    );
    return {
      ok: true,
      error:
        err instanceof Error
          ? `ZIP unavailable (${err.message}); downloaded package JSON instead.`
          : "ZIP unavailable; downloaded package JSON instead.",
    };
  }
}

export function filesToPreview(files: GeneratedFile[]): string {
  return files.map((f) => `// —— ${f.path} ——\n${f.content}`).join("\n\n");
}
