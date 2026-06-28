/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow transition: all and Tailwind transition-all in motion code",
      category: "Motion",
      recommended: true,
    },
    messages: {
      noTransitionAll:
        "Avoid transition: all / transition-all (rule/no-transition-all). List properties explicitly: transform, opacity, etc.",
    },
    schema: [],
  },
  create(context) {
    function checkLiteral(node, value) {
      if (typeof value !== "string") return;
      if (/transition\s*:\s*all\b/i.test(value) || /\btransition-all\b/.test(value)) {
        context.report({ node, messageId: "noTransitionAll" });
      }
    }

    return {
      Literal(node) {
        checkLiteral(node, node.value);
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          checkLiteral(node, quasi.value.cooked);
        }
      },
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier") return;
        if (node.name.name !== "className") return;
        if (!node.value) return;
        if (node.value.type === "Literal") {
          checkLiteral(node.value, node.value.value);
        }
        if (
          node.value.type === "JSXExpressionContainer" &&
          node.value.expression.type === "Literal"
        ) {
          checkLiteral(node.value.expression, node.value.expression.value);
        }
      },
    };
  },
};
