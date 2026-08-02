/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow imports across lab project slugs under components/projects/{category}/{slug}",
      category: "Architecture",
      recommended: true,
    },
    messages: {
      crossProjectImport:
        "Do not import from project '{{fromSlug}}' into '{{toSlug}}' (rule/project-isolation). Extract shared types to lab chrome or a shared module outside either slug.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    const fromProject = parseProjectPath(filename);
    if (!fromProject) return {};

    function checkSource(node, source) {
      if (typeof source !== "string") return;
      const target = resolveImportProject(filename, source);
      if (!target) return;
      if (
        target.category === fromProject.category &&
        target.slug === fromProject.slug
      ) {
        return;
      }
      context.report({
        node,
        messageId: "crossProjectImport",
        data: {
          fromSlug: `${target.category}/${target.slug}`,
          toSlug: `${fromProject.category}/${fromProject.slug}`,
        },
      });
    }

    return {
      ImportDeclaration(node) {
        if (node.source && node.source.type === "Literal") {
          checkSource(node.source, node.source.value);
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source && node.source.type === "Literal") {
          checkSource(node.source, node.source.value);
        }
      },
      ExportAllDeclaration(node) {
        if (node.source && node.source.type === "Literal") {
          checkSource(node.source, node.source.value);
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === "Import" &&
          node.arguments[0] &&
          node.arguments[0].type === "Literal"
        ) {
          checkSource(node.arguments[0], node.arguments[0].value);
        }
      },
    };
  },
};

const PROJECT_RE =
  /(?:^|\/)(?:lab\/)?src\/components\/projects\/([^/]+)\/([^/]+)\//;

/**
 * @param {string} filePath
 * @returns {{ category: string, slug: string } | null}
 */
function parseProjectPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  const match = normalized.match(PROJECT_RE);
  if (!match) return null;
  const category = match[1];
  const slug = match[2];
  // Shared project-root files (registry, demo-host) are not a slug package
  if (
    category === "registry.ts" ||
    slug === "registry.ts" ||
    slug.endsWith(".ts") ||
    slug.endsWith(".tsx")
  ) {
    return null;
  }
  return { category, slug };
}

/**
 * @param {string} importerPath
 * @param {string} source
 * @returns {{ category: string, slug: string } | null}
 */
function resolveImportProject(importerPath, source) {
  const normalizedImporter = importerPath.replace(/\\/g, "/");

  if (source.startsWith("@/components/projects/")) {
    return parseProjectPath(`/src/${source.slice(2)}`);
  }

  if (source.startsWith("@/")) {
    return null;
  }

  if (!source.startsWith(".")) {
    return null;
  }

  const importerDir = normalizedImporter.replace(/\/[^/]+$/, "");
  const joined = resolveRelative(importerDir, source);
  return parseProjectPath(joined);
}

/**
 * @param {string} fromDir
 * @param {string} relative
 */
function resolveRelative(fromDir, relative) {
  const parts = fromDir.split("/").filter(Boolean);
  const segs = relative.split("/");
  for (const seg of segs) {
    if (seg === "." || seg === "") continue;
    if (seg === "..") {
      parts.pop();
      continue;
    }
    parts.push(seg);
  }
  return `/${parts.join("/")}`;
}
