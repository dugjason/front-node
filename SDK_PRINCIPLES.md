# SDK implementation principles

Follow Stripe's resource-oriented SDK style: put API operations on resource collections and return plain, well-typed data. Keep the SDK focused on making Front API calls predictable and easy to discover.

## Collection methods are the primary API

Expose operations through namespaces such as `front.tags` and `front.conversations`. Methods targeting an existing resource take its ID first, followed by request parameters.

```ts
const tag = await front.tags.get("tag_123");
await front.tags.update(tag.id, { name: "Priority" });
await front.tags.delete(tag.id);
```

Direct operations must not require fetching the resource first. Use one signature for each operation rather than overloads that switch between bound entity and collection behavior. Keep established Front SDK method names such as `get`; adopting Stripe's structure does not require copying its naming exactly.

## Return typed data, without entity classes

Return plain response objects with accurate TypeScript types. Responses have no API methods, client references, mutable entity state, or `save()` lifecycle. List items and individual responses use the same data types where their API shapes match.

Callers perform subsequent operations through the collection using the returned ID. Do not add getters, setters, snapshot merging, or entity inheritance to wrap response fields. Preserve Front's field names and existing documented response normalization.

## Separate responses from request parameters

Define distinct types for response data and each operation's parameters, for example `TagResponse`, `CreateTagParams`, and `UpdateTagParams`. Derive them from the corresponding OpenAPI response or request schema, following a consistent naming convention across resources.

Do not derive update parameters from the full response or send a response object back as an update payload. Preserve differences between omitted fields, explicit `null`, and required fields according to the operation's contract.

## Expose only supported operations

Add methods only for endpoints Front supports. A channel collection must not expose `delete()` if Front has no channel deletion endpoint. Avoid generic CRUD interfaces that require unsupported methods or throwing stubs.

Share HTTP handling, authentication, errors, and URL construction. Keep endpoint-specific methods and parameter types explicit.

## Match endpoint response behavior

Return typed response data when an endpoint returns JSON. Return `void` for successful empty responses such as `204`. Do not synthesize an updated resource, merge request parameters into a local snapshot, or issue an extra GET to manufacture a return value.

When callers need authoritative state after an empty update response, they explicitly call `get()`.

## Fetch pages explicitly

Each awaited `list()` call returns one page, including its pagination metadata. Preserve Front's full next-page URL in `pagination.next`; callers pass it as `nextPageUrl` to fetch another page.

```ts
const first = await front.tags.list({ limit: 20 });

if (first.pagination?.next) {
  const second = await front.tags.list({ nextPageUrl: first.pagination.next });
}
```

When `nextPageUrl` is supplied, its query parameters take precedence. Ignore other parameters in the call, including `page_token`, filters, sorting, and page size. Read the URL's query parameters and request the known list endpoint through the configured client origin. Reject invalid URLs or URLs for a different endpoint before sending a request.

Direct `page_token` requests remain supported. Do not invent numeric page indexes or copy Stripe's `starting_after` parameter. A list request must not fetch subsequent pages automatically.

Automatic pagination and async iteration remain deferred; explicit page requests must continue to work if those conveniences are added later.

## Keep this refactor focused

Apply these conventions consistently across resource namespaces. Preserve endpoint coverage, authentication behavior, error semantics, and existing list response envelopes unless a change is required by this design and documented.

Automatic pagination and async iteration are useful follow-up work, but are out of scope for this refactor. Keep pagination limited to explicit next-page requests.

Test meaningful contracts: ID-first calls issue the intended request without a preliminary fetch, response shapes match endpoint behavior, and unsupported operations are absent from the public types. Document breaking changes and migration examples.

## Reference

[Stripe's customer resource](https://github.com/stripe/stripe-node/blob/master/src/resources/Customers.ts) demonstrates operations on a collection with separate response and parameter types.
