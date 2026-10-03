# Implementing endpoints

Follow [SDK_PRINCIPLES.md](../SDK_PRINCIPLES.md). The checked-in `src/gen/schema.gen.ts` is the contract for paths, operations, parameters, and responses.

## Resource methods

Add an explicit method to the appropriate collection. Methods for existing resources take the ID first. Return plain response data through `FrontBase.requestOperation`; do not add bound resources, local state, or lifecycle methods.

```ts
export type UpdateAccountParams = NonNullable<OperationParams<"update-account">["body"]>;

async update(accountId: string, body: UpdateAccountParams): Promise<OperationResponse<"update-account">> {
  return await this.base.requestOperation("update-account", {
    body,
    path: { account_id: accountId },
  });
}
```

Operation IDs select the generated HTTP verb and path. The adapter checks path keys, required or optional bodies, allowed queries, and response types. Do not provide a caller-selected response generic or manually serialize query values. Keep response and request types separate and export operation-specific `Params` types.

## Lists and response behavior

Derive list parameters from `OperationListParams<operationId>`. Pass `query: params` and, only for operations declaring `page_token`, `nextPageUrl: params?.nextPageUrl`. The base client validates the next URL against the endpoint, ignores other supplied query options, and uses the configured origin.

Each call fetches one page. Keep `_results` and normalized `pagination` metadata. Endpoints without query parameters accept no options. Sorting alone does not imply pagination support.

Return JSON for `200`, `201`, or `202` responses when declared by the operation. Return `void` for `204` or other empty success responses. Do not merge an update payload into a response or issue another request to manufacture state.

Use `requestOperationRaw` for attachment downloads and alternative message representations. It accepts GET operations without query/body parameters and returns the unconsumed `Response`; shared authentication and API errors still apply.

## Schema maintenance

Run `bun run generate` to regenerate the schema and operation routes together. Check spec omissions against its component schemas and official documentation before adding a narrow correction in `src/operation.ts`. Existing corrections cover nullable tag parents and the missing message-template PATCH body. Do not relax unrelated operation contracts.

## Validation

Test current requests and results: the intended verb, path, query, body, one request per call, JSON or empty response behavior, and raw downloads where relevant. Paginated methods need precedence and invalid-endpoint URL tests. Use realistic IDs (`cnv_123`, `tag_123`) and the public documentation token in `tests/helpers/pagination.ts`.

Compile-time contract tests verify allowed options and required fields. Do not add runtime checks for removed entity methods or test the migration history. Document breaking changes and useful migration examples.

Run `bun run audit:endpoints` manually to compare exposed collection methods against the published OpenAPI spec, and `bun run audit:deprecations` to verify deprecation annotations on supported methods. These optional audits do not run in CI, builds, or `bun run check`. Exclude operations marked deprecated. When all operations on a root collection are deprecated, exclude its related routes too. The route generator applies these rules before creating the typed adapter registry.

Run `bun run fix`, `bun test`, `bun run check`, and `bun run build`.
