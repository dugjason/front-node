import { defineConfig } from "oxlint";
import antislop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";

export default defineConfig({
  extends: [core, antislop],
  ignorePatterns: [
    "src/gen/**/*.ts",
    ...(core.ignorePatterns ?? []),
    ...(antislop.ignorePatterns ?? []),
  ],
  overrides: [
    {
      files: ["src/gen/**/*.ts"],
      rules: {
        "typescript/consistent-indexed-object-style": "off",
      },
    },
    {
      files: ["src/entity.ts"],
      rules: {
        "class-methods-use-this": "off",
      },
    },
    {
      files: ["src/resources/**/*.ts"],
      rules: {
        "max-classes-per-file": "off",
      },
    },
    {
      files: ["src/resources/knowledge.ts"],
      rules: {
        "no-use-before-define": "off",
      },
    },
    {
      files: ["tests/**/*.ts"],
      rules: {
        "unicorn/prefer-response-static-json": "off",
      },
    },
  ],
  rules: {
    "anti-slop/require-safety-comment-for-type-assertion": "off",
  },
});
