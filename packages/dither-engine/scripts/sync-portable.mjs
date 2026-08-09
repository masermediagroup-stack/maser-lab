#!/usr/bin/env node
/**
 * Sync portable Maser Dither Engine sources into this package for local
 * development and `npm pack`. Does not copy shell/, project store, or demos.
 *
 * Usage: node scripts/sync-portable.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, "..");
const LAB_ROOT = path.resolve(
  PKG_ROOT,
  "../../lab/src/components/projects/display/maser-dither-engine",
);
const OUT = path.join(PKG_ROOT, "src");

/** Relative paths under LAB_ROOT to copy (files or directories). */
const ALLOWLIST = [
  "engine",
  "react",
  "surfaces",
  "components/adapters",
  "components/registry.ts",
  "content",
  "materials",
  "presets",
  "export",
  // skip export/__tests__ — lab vitest only; filtered after copy
  "projects/types.ts",
  "runtime.ts",
  "constants.ts",
  "types.ts",
  "tokens.css",
];

/** Paths under engine/ that stay lab-only. */
const ENGINE_EXCLUDE = new Set(["preview"]);

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function shouldSkipEngineRel(relFromEngineRoot) {
  const top = relFromEngineRoot.split(path.sep)[0];
  return ENGINE_EXCLUDE.has(top);
}

function copyDir(srcDir, destDir, filterFromRoot) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const from = path.join(srcDir, entry.name);
    const to = path.join(destDir, entry.name);
    const rel = path.relative(srcDir, from);
    if (filterFromRoot && filterFromRoot(rel)) continue;
    if (entry.isDirectory()) {
      copyDir(from, to, (child) =>
        filterFromRoot ? filterFromRoot(path.join(rel, child)) : false,
      );
    } else if (entry.isFile()) {
      copyFile(from, to);
    }
  }
}

function assertNoShell(root) {
  const bannedDirs = new Set(["shell"]);
  const bannedFiles = /DitherEngineApp|index\.lab/;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (bannedDirs.has(entry.name)) {
          throw new Error(`Packaged tree must not include ${full}`);
        }
        stack.push(full);
      } else if (bannedFiles.test(entry.name)) {
        throw new Error(`Packaged tree must not include ${full}`);
      }
    }
  }
}

function rewriteLabAliases(root) {
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (!/\.(ts|tsx|js|jsx|css)$/.test(entry.name)) continue;
      let text = fs.readFileSync(full, "utf8");
      const before = text;
      const relToLib = path
        .relative(path.dirname(full), path.join(root, "lib/utils"))
        .replaceAll(path.sep, "/");
      const libImport = relToLib.startsWith(".") ? relToLib : `./${relToLib}`;
      text = text.replaceAll(`from "@/lib/utils"`, `from "${libImport}"`);
      text = text.replaceAll(`from '@/lib/utils'`, `from '${libImport}'`);
      if (text !== before) fs.writeFileSync(full, text, "utf8");
    }
  }
}

function writeBarrels() {
  const index = `/**
 * @maser/dither-engine — portable public API
 * Synced from lab product barrel. Does not export Lab editor shell.
 */

export * from "./runtime";
export * from "./export";
export { PACKAGE_NAME, PACKAGE_VERSION } from "./package-meta";
`;
  fs.writeFileSync(path.join(OUT, "index.ts"), index, "utf8");

  const pkgMeta = `/** Locked package identity (see docs/roadmap/06-EXPORT-SYSTEM.md). */
export const PACKAGE_NAME = "@maser/dither-engine" as const;
export const PACKAGE_VERSION = "0.8.0" as const;
`;
  fs.writeFileSync(path.join(OUT, "package-meta.ts"), pkgMeta, "utf8");
}

function main() {
  if (!exists(LAB_ROOT)) {
    console.error(`Lab source not found at ${LAB_ROOT}`);
    process.exit(1);
  }

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  for (const rel of ALLOWLIST) {
    const src = path.join(LAB_ROOT, rel);
    if (!exists(src)) {
      console.warn(`skip missing: ${rel}`);
      continue;
    }
    const dest = path.join(OUT, rel);
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      if (rel === "engine") {
        copyDir(src, dest, shouldSkipEngineRel);
      } else if (rel === "export") {
        copyDir(src, dest, (r) => r.split(path.sep)[0] === "__tests__");
      } else {
        copyDir(src, dest);
      }
    } else {
      copyFile(src, dest);
    }
  }

  // Drop lab-only React helpers that depend on excluded preview engine.
  const liveThumb = path.join(OUT, "react/useLiveThumbCache.ts");
  if (exists(liveThumb)) fs.unlinkSync(liveThumb);

  const utilsShim = path.join(OUT, "lib/utils.ts");
  fs.mkdirSync(path.dirname(utilsShim), { recursive: true });
  fs.writeFileSync(
    utilsShim,
    `/** Minimal cn helper for packaged adapters (no lab dependency). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
`,
    "utf8",
  );

  writeBarrels();
  rewriteLabAliases(OUT);
  assertNoShell(OUT);

  console.log(`Synced portable sources → ${path.relative(process.cwd(), OUT)}`);
}

main();
