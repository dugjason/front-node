import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const specUrl =
  "https://raw.githubusercontent.com/frontapp/front-api-specs/main/core-api/core-api.json";
const methods = new Set(["get", "post", "put", "patch", "delete", "head", "options", "trace"]);
const rootPathPattern = /^\/[^/]+$/u;
const classPattern = /^export class (?<name>\w+)/gmu;
const methodPattern = /^ {2}async (?<name>\w+)\([\s\S]*?^ {2}\}/gmu;
const operationPattern = /requestOperation(?:Raw)?\(\s*"(?<name>[^"]+)"/gmu;
const mountedPattern = /this\.(?<namespace>\w+) = new (?<class>\w+)\(this\)/gmu;
const commentPattern = /\/\*\*(?<description>(?:(?!\*\/)[\s\S])*)\*\/\s*$/u;

// External JSON is validated here before reading OpenAPI metadata.
// oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export interface SpecOperation {
  name: string;
  path: string;
  deprecated: boolean;
}

/** Optional first argument is a local OpenAPI JSON file; otherwise fetch the published spec. */
interface SpecDocument {
  // Path entries are validated individually by readSpecOperations.
  // oxlint-disable-next-line anti-slop/no-unsafe-dictionary-type
  paths: Record<string, unknown>;
  tags: unknown;
}

const loadSpec = async (): Promise<SpecDocument> => {
  const [file] = process.argv.slice(2);
  let spec: unknown;
  if (file) {
    spec = JSON.parse(await readFile(file, "utf-8"));
  } else {
    const response = await fetch(specUrl);
    if (!response.ok) {
      throw new Error(`OpenAPI fetch failed: ${response.status}`);
    }
    spec = await response.json();
  }
  if (!isRecord(spec) || !isRecord(spec.paths)) {
    throw new Error("OpenAPI spec must contain paths.");
  }
  return { paths: spec.paths, tags: spec.tags };
};

// Runtime representation checks validate untrusted OpenAPI JSON at this boundary.
/* oxlint-disable anti-slop/no-runtime-typeof */
export const readSpecOperations = async (): Promise<SpecOperation[]> => {
  const spec = await loadSpec();
  const deprecatedTags = new Set<string>();
  if (Array.isArray(spec.tags)) {
    for (const tag of spec.tags) {
      if (isRecord(tag) && tag.deprecated === true && typeof tag.name === "string") {
        deprecatedTags.add(tag.name);
      }
    }
  }
  const operations: SpecOperation[] = [];
  const deprecatedRoots = new Set<string>();
  for (const [path, item] of Object.entries(spec.paths)) {
    if (!isRecord(item)) {
      throw new Error(`Invalid OpenAPI path: ${path}`);
    }
    const group: SpecOperation[] = [];
    for (const [method, operation] of Object.entries(item)) {
      if (!methods.has(method)) {
        continue;
      }
      if (!isRecord(operation) || typeof operation.operationId !== "string") {
        throw new Error(`Missing operationId: ${method} ${path}`);
      }
      group.push({
        deprecated:
          item.deprecated === true ||
          operation.deprecated === true ||
          (Array.isArray(operation.tags) && operation.tags.some((tag) => deprecatedTags.has(tag))),
        name: operation.operationId,
        path,
      });
    }
    if (rootPathPattern.test(path) && group.length > 0 && group.every((op) => op.deprecated)) {
      deprecatedRoots.add(path);
    }
    operations.push(...group);
  }
  if (operations.length === 0) {
    throw new Error("No OpenAPI operations found.");
  }
  return operations.map((operation) => ({
    ...operation,
    deprecated:
      operation.deprecated ||
      [...deprecatedRoots].some(
        (path) => operation.path === path || operation.path.startsWith(`${path}/`),
      ),
  }));
};
/* oxlint-enable anti-slop/no-runtime-typeof */

export interface SdkMethod {
  name: string;
  operation: string;
  deprecated: boolean;
}

export const readSdkMethods = async (): Promise<SdkMethod[]> => {
  const front = await readFile(new URL("src/front.ts", root), "utf-8");
  const namespaces = new Map(
    [...front.matchAll(mountedPattern)].map((match) => [
      match.groups?.class,
      match.groups?.namespace,
    ]),
  );
  const result: SdkMethod[] = [];
  for await (const file of new Bun.Glob("src/resources/*.ts").scan({ cwd: fileURLToPath(root) })) {
    const source = await readFile(new URL(file, root), "utf-8");
    const classes = [...source.matchAll(classPattern)];
    for (const [index, collection] of classes.entries()) {
      const namespace = namespaces.get(collection.groups?.name);
      if (!namespace) {
        continue;
      }
      const block = source.slice(collection.index, classes[index + 1]?.index ?? source.length);
      const classComment = source.slice(0, collection.index).match(commentPattern)
        ?.groups?.description;
      for (const method of block.matchAll(methodPattern)) {
        const name = `${namespace}.${method.groups?.name}`;
        const calls = [...method[0].matchAll(operationPattern)];
        if (calls.length !== 1 || !calls[0]?.groups?.name) {
          throw new Error(`Cannot determine OpenAPI operation for ${name}.`);
        }
        const comment = block.slice(0, method.index).match(commentPattern)?.groups?.description;
        result.push({
          deprecated:
            comment?.includes("@deprecated") === true ||
            classComment?.includes("@deprecated") === true,
          name,
          operation: calls[0].groups.name,
        });
      }
    }
  }
  return result;
};
