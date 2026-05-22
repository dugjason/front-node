# Implementing new endpoints (internal)

Checklist-oriented notes for adding SDK coverage for more of the Front API. **Source of truth:** `src/gen/schema.gen.ts` (`paths`, `operations`, `components`).

## 1. Discover what the API actually does

- Find the path in `paths` (e.g. `"/channels/{channel_id}"`) and note **method**, **operation id** (e.g. `update-channel`), and **scopes** from the path’s description comments.
- Open the matching **`operations["…"]`** entry:
  - **Path params** → `FrontBase.expandPath("/…/{id}", { id })` (encodeURIComponent is applied inside `expandPath`).
  - **Query** → prefer `NonNullable<operations["list-x"]["parameters"]["query"]>` and a small `queryFrom…` helper that returns `Record<string, string | undefined>` (stringify numbers/booleans for the query string).
  - **Request body** → `components["schemas"]["…"]` from `requestBody.content["application/json"]`.
  - **Responses** → read **status codes** and **response refs** (`components["responses"]["…"]` or inline `content["application/json"]`).

### Response shape traps

- **`204` / empty body:** `requestJson` returns `undefined`. For entity PATCH, usually use `patchNoContent` + a **merge** function so local `state` reflects the PATCH body (see teammates, tags, channels).
- **`200` with full entity on PATCH:** use `patchReplaceFromResponse` or call `requestJson` and `replaceState` (accounts, signatures).
- **List endpoints:** if the schema includes `_pagination`, `normalizeFrontResponse` rewrites it to `pagination` and normalizes `next` to a **page_token** string. Wrap list return types with `WithNormalizedPagination<…>` even when the OpenAPI list has **no** `_pagination` (the conditional type leaves `T` unchanged).
- **Non-JSON or multipart:** if the spec says `multipart/form-data`, this stack today is JSON-first; flag it in JSDoc or defer until multipart support exists.

## 2. Choose where code lives

- **New top-level resource group** (e.g. `/channels`): add `src/resources/<name>.ts`.
- **Plural namespace class** (`FrontChannels`): `list`, `create`, `get`, etc. — holds `private readonly base: FrontBase`, constructor `(base: FrontBase)`.
- **Singular resource class** (`FrontChannel`): extends `FrontResource<TState, TUpdate>` when the entity has `id` + `_links` and maps cleanly to PATCH/update.
- **Nested routes only** (e.g. under another resource): either methods on the parent resource class or a dedicated small module—mirror an existing pattern (tags children, teammate conversations, etc.).

## 3. Types (no `any`, avoid double casts)

- Re-export public API types from OpenAPI:  
  `export type Foo = components["schemas"]["FooResponse"];`
- Derive operation-specific types inline:  
  `type ListFooResponse = operations["list-foos"]["responses"][200]["content"]["application/json"];`
- When the public PATCH type is awkward for callers (e.g. nullable clears), define a thin alias (see `TagUpdateInput` in `tags.ts`) instead of leaking `as any`.

## 4. `FrontResource` conventions

- **State** type must include `id: string` and `_links: unknown` (or a more specific `_links` shape from the schema).
- **`selfPath()`** — template + `expandPath`.
- **Field access:** `pick` / `assign` with **API snake_case** keys in state; expose **camelCase** getters/setters in the class for ergonomic TS (match existing resources).
- **`toUpdateBody()`** — full payload implied by current mutable fields for `save()`.
- **`update(body)`** — PATCH (or POST if that’s what the operation is); document required OAuth scope in JSDoc.
- **`delete()`** — default implementation `DELETE selfPath()`. If OpenAPI has **no** DELETE for that entity, **override** `delete()` to reject with a clear error (or do not expose delete—prefer explicit rejection so callers do not assume REST semantics).
- **Merge helpers** for 204 PATCH: strip `undefined` entries from the patch object before merging; for nested objects, shallow-merge only the fields the API documents as partial/replaceable.

## 5. HTTP layer

- Use **`this.base.requestJson<TResult>(method, path, { query?, body? })`** only; do not bypass normalization for JSON list/detail responses.
- **Auth / errors:** handled in `FrontBase`; failed responses throw `FrontApiError`.

## 6. Wire-up and exports

- **`src/front.ts`:** import plural class, add `readonly <name>: Front<Name>`, construct in constructor, extend the class docblock list.
- **`src/index.ts`:** export the new classes and relevant types (responses, create/update bodies, query types if useful).

## 7. Tests (`tests/client.test.ts`)

- **Mock `fetch`** with a `Proxy` that records `Request[]` and branches on `method` + `url` (see existing tests).
- Assert **URL** (full origin + path + query when relevant), **method**, **headers** (`Authorization: Bearer …`) where it matters.
- For PATCH: cover **204 merge** vs **200 replace** depending on resource behavior.
- **Oxlint:** object keys sorted where rules apply; no unused vars (prefix `_` or `void`); avoid `async` functions with no `await` (use `Promise.reject` or sync throw patterns as appropriate).

## 8. Quality gate

```bash
bun run check   # oxfmt --check, oxlint, tsc
bun test
```

Fix formatting with `bun x oxfmt <paths>`.

## 9. Docs and links

- JSDoc on public classes/methods: one-line purpose, **required scope** when known from the spec, `@see` link to Front developer docs path when stable.

## 10. Ordering work

- Prefer **bounded** path groups (one resource + its sub-routes) over huge surfaces (e.g. conversations) unless explicitly requested.
- After channels, the next **path order** in `paths` may be analytics, then larger domains—confirm with the product goal before implementing open-ended slices.

---

_This file is for maintainers and agents; it is not part of the published package API._
