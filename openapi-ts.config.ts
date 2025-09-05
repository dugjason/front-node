import { defaultPaginationKeywords, defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input:
    "https://github.com/frontapp/front-api-specs/raw/refs/heads/main/core-api/core-api.json",
  output: {
    format: "biome",
    lint: "biome",
    path: "src/generated",
    indexFile: false,
  },
  parser: {
    pagination: {
      keywords: [...defaultPaginationKeywords, "page_token"],
    },
  },
  plugins: [
    {
      enums: "javascript",
      name: "@hey-api/typescript",
    },
    {
      asClass: false, // default
      name: "@hey-api/sdk",
    },
  ],
})
