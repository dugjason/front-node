#!/usr/bin/env bun
import { fileURLToPath } from "node:url";

import { $ } from "bun";

const dir = fileURLToPath(new URL("..", import.meta.url));
process.chdir(dir);

await $`rm -rf ./src/gen`;
await $`mkdir -p ./src/gen`;
await $`bunx openapi-typescript openapi-spec.json -o ./src/gen/schema.gen.ts`;
await $`bunx oxfmt ./src/gen/schema.gen.ts`;

await $`rm -rf dist`;
await $`bun tsc`;
