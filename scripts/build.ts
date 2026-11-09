#!/usr/bin/env bun
import { fileURLToPath } from "node:url";

import { $ } from "bun";
import openapiTS, { astToString, COMMENT_HEADER, oapiRef, tsNullable } from "openapi-typescript";
import type { OpenAPI3 } from "openapi-typescript";

const dir = fileURLToPath(new URL("..", import.meta.url));
process.chdir(dir);

const CORE_API_SCHEMA_URL =
  "https://raw.githubusercontent.com/frontapp/front-api-specs/7a62cc93709d34b602910145090f1880ab062ecb/core-api/core-api.json";

const response = await fetch(CORE_API_SCHEMA_URL);
if (!response.ok) {
  throw new Error(`Failed to fetch Front's Core API spec (HTTP ${response.status})`);
}
const schema: OpenAPI3 = await response.json();
const event = schema.components?.schemas?.EventResponse;
const target = event && "properties" in event ? event.properties?.target : undefined;
const data = target && "properties" in target ? target.properties?.data : undefined;
if (!data || "$ref" in data || !data.oneOf) {
  throw new Error("Expected EventResponse.target.data to contain a oneOf union");
}

// Front documents the ticket_status_update target at https://dev.frontapp.com/reference/events
const statusRef = "#/components/schemas/StatusResponse";
if (!data.oneOf.some((member) => "$ref" in member && member.$ref === statusRef)) {
  data.oneOf.push({ $ref: statusRef });
}

const ast = await openapiTS(schema, {
  transform(property) {
    // openapi-typescript emits property references directly and skips their nullable sibling.
    if (property.nullable === true && "$ref" in property && typeof property.$ref === "string") {
      return tsNullable([oapiRef(property.$ref)]);
    }
  },
});
await Bun.write("./src/gen/schema.gen.ts", COMMENT_HEADER + astToString(ast));
await $`bunx oxfmt ./src/gen/schema.gen.ts`;

await $`rm -rf dist`;
await $`bun tsc`;
