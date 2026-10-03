import { readSdkMethods, readSpecOperations } from "./sdk-audit";

const [operations, sdk] = await Promise.all([readSpecOperations(), readSdkMethods()]);
const deprecated = new Set(
  operations.filter((operation) => operation.deprecated).map((operation) => operation.name),
);
const missing = sdk.filter((method) => deprecated.has(method.operation) && !method.deprecated);
if (missing.length > 0) {
  throw new Error(
    `SDK methods requiring @deprecated JSDoc:\n${missing.map((method) => `${method.name} (${method.operation})`).join("\n")}`,
  );
}
process.stdout.write("Endpoint deprecations: all supported deprecated operations are annotated.\n");
