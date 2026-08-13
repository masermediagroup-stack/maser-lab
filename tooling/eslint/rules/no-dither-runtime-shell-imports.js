/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow Maser Dither Engine runtime/export modules from importing shell/ editor code",
      category: "Architecture",
      recommended: true,
    },
    messages: {
      runtimeImportsShell:
        "Runtime/export code must not import Lab editor modules under shell/ (Sprint 8 boundary).",
    },
    schema: [],
  },
  create(context) {
    const filename = (context.filename || context.getFilename()).replace(
      /\\/g,
      "/",
    );
    const inDither =
      /maser-dither-engine\/(export|engine|react|components\/adapters|surfaces|runtime\.ts|content)\//.test(
        filename,
      ) || /maser-dither-engine\/runtime\.ts$/.test(filename);
    if (!inDither) return {};
    // Allow nothing from shell
    if (filename.includes("/shell/")) return {};

    function checkSource(node, source) {
      if (typeof source !== "string") return;
      if (
        source.includes("/shell/") ||
        source.includes("../shell") ||
        source.includes("./shell") ||
        /(^|\/)shell\//.test(source)
      ) {
        context.report({ node, messageId: "runtimeImportsShell" });
      }
    }

    return {
      ImportDeclaration(node) {
        if (node.source?.type === "Literal") {
          checkSource(node.source, node.source.value);
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source?.type === "Literal") {
          checkSource(node.source, node.source.value);
        }
      },
      ExportAllDeclaration(node) {
        if (node.source?.type === "Literal") {
          checkSource(node.source, node.source.value);
        }
      },
    };
  },
};
