import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";

export default defineConfig({
  extends: [core],
  overrides: [
    {
      files: ["src/gen/**/*.ts"],
      rules: {
        "typescript/consistent-indexed-object-style": "off",
      },
    },
    {
      files: ["src/resource.ts"],
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
});
