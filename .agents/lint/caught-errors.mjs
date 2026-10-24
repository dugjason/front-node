export default {
  meta: { name: "caught-errors" },
  rules: {
    "require-read": {
      create(context) {
        return {
          "CatchClause, CallExpression[callee.property.name='catch'] > :matches(ArrowFunctionExpression, FunctionExpression)"(
            node,
          ) {
            const binding = node.type === "CatchClause" ? node.param : node.params[0];
            const variable = context.sourceCode
              .getDeclaredVariables(node)
              .find((candidate) => candidate.identifiers.includes(binding));
            if (!variable?.references.some((reference) => reference.isRead())) {
              context.report({ messageId: "unread", node });
            }
          },
        };
      },
      meta: {
        messages: { unread: "Bind and read every caught error; do not discard it." },
        schema: [],
        type: "problem",
      },
    },
  },
};
