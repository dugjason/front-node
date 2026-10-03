import { readFile, writeFile } from "node:fs/promises";

const schemaUrl = new URL("../src/gen/schema.gen.ts", import.meta.url);
const schema = await readFile(schemaUrl, "utf-8");
const pathsSection = schema.slice(
  schema.indexOf("export interface paths {"),
  schema.indexOf("export type webhooks"),
);
const pathPattern = /^ +"(?<path>\/[^"]*)": \{/gmu;
const operationPattern =
  /^ +(?<method>get|post|put|patch|delete|head|options|trace): operations\["(?<operation>[^"]+)"\];/gmu;
const precedingCommentPattern = /\/\*\*(?<description>(?:(?!\*\/)[\s\S])*)\*\/\s*$/u;
const rootPathPattern = /^\/[^/]+$/u;
const paths = [...pathsSection.matchAll(pathPattern)];
interface SchemaOperation {
  name: string;
  method: string;
  path: string;
  deprecated: boolean;
}
const operations: SchemaOperation[] = [];
const deprecatedGroups = new Set<string>();
for (const [index, match] of paths.entries()) {
  const path = match.groups?.path;
  if (path === undefined) {
    throw new Error("Missing path in generated OpenAPI schema.");
  }
  const block = pathsSection.slice(match.index, paths[index + 1]?.index ?? pathsSection.length);
  const pathOperations: SchemaOperation[] = [];
  for (const operation of block.matchAll(operationPattern)) {
    const comment = block.slice(0, operation.index).match(precedingCommentPattern)
      ?.groups?.description;
    const name = operation.groups?.operation;
    const method = operation.groups?.method;
    if (name === undefined || method === undefined) {
      throw new Error(`Missing operation metadata for ${path}.`);
    }
    pathOperations.push({
      deprecated: comment?.includes("@deprecated") ?? false,
      method: method.toUpperCase(),
      name,
      path,
    });
  }
  // An entirely deprecated root collection excludes its related routes too,
  // even when an individual child operation is missing the deprecation marker.
  if (
    rootPathPattern.test(path) &&
    pathOperations.length > 0 &&
    pathOperations.every((operation) => operation.deprecated)
  ) {
    deprecatedGroups.add(path);
  }
  operations.push(...pathOperations);
}
const isExcluded = (operation: SchemaOperation): boolean =>
  operation.deprecated ||
  [...deprecatedGroups].some(
    (path) => operation.path === path || operation.path.startsWith(`${path}/`),
  );
const supported = operations.filter((operation) => !isExcluded(operation));
const excluded = operations.filter(isExcluded);
if (supported.length === 0) {
  throw new Error("No supported operations found in the generated OpenAPI paths.");
}
const entries = supported.map(
  (operation) =>
    `  "${operation.name}": { method: "${operation.method}", path: "${operation.path}" },`,
);
await writeFile(
  new URL("../src/gen/operation-routes.gen.ts", import.meta.url),
  `// Generated from schema.gen.ts. Do not edit.\nimport type { operations, paths } from "./schema.gen";\nexport const excludedOperationNames = ${JSON.stringify(excluded.map((operation) => operation.name))} as const satisfies readonly (keyof operations)[];\nexport const operationRoutes = {\n${entries.join("\n")}\n} as const satisfies Record<Exclude<keyof operations, (typeof excludedOperationNames)[number]>, { method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE"; path: keyof paths }>;\n`,
);
