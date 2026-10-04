import { readSdkMethods, readSpecOperations } from "./sdk-audit";

const [operations, sdk] = await Promise.all([readSpecOperations(), readSdkMethods()]);
const supported = operations.filter((operation) => !operation.deprecated);
const exposed = new Set(sdk.map((method) => method.operation));
const missing = supported.filter((operation) => !exposed.has(operation.name));
if (missing.length > 0) {
  throw new Error(
    `Missing SDK endpoints (${missing.length}):\n${missing.map((operation) => `${operation.name}: ${operation.path}`).join("\n")}`,
  );
}
process.stdout.write(
  `Endpoint completeness: ${supported.length}/${supported.length} non-deprecated OpenAPI operations exposed.\n`,
);
