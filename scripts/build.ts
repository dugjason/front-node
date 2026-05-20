#!/usr/bin/env bun
import { fileURLToPath } from "node:url";

import { $ } from "bun";

const dir = fileURLToPath(new URL("..", import.meta.url));
process.chdir(dir);

const CORE_API_SCHEMA_URL =
  "https://raw.githubusercontent.com/frontapp/front-api-specs/main/core-api/core-api.json";

await $`rm -rf ./src/gen`;
await $`mkdir -p ./src/gen`;
await $`bunx openapi-typescript ${CORE_API_SCHEMA_URL} -o ./src/gen/schema.gen.ts`;
await $`bunx oxfmt ./src/gen/schema.gen.ts`;

await $`rm -rf dist`;
await $`bun tsc`;
