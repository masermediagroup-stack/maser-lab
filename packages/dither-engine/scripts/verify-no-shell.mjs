#!/usr/bin/env node
/** Fail if packaged src/ imports shell or lab editor entry points. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");

if (!fs.existsSync(root)) {
  console.error("src/ missing — run npm run sync first");
  process.exit(1);
}

const bannedName = /^(shell|DitherEngineApp|index\.lab)/i;
/** Only flag real module imports — docs may mention shell/. */
const bannedImport = [
  /\bfrom\s+["'][^"']*\/shell\//,
  /\bimport\s*\(\s*["'][^"']*shell/,
  /\bfrom\s+["'][^"']*DitherEngineApp["']/,
];

let errors = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (bannedName.test(entry.name)) {
      console.error(`banned path: ${path.relative(root, full)}`);
      errors++;
      continue;
    }
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      walk(full);
    } else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8");
      for (const re of bannedImport) {
        if (re.test(text)) {
          console.error(`banned import in ${path.relative(root, full)}`);
          errors++;
          break;
        }
      }
    }
  }
}

walk(root);
if (errors) process.exit(1);
console.log("verify:no-shell ok");
