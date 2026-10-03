---
"@dugjason/front-node": minor
---

**Breaking changes:** migrate all resources to ID-first collection methods returning plain, typed Front data. Replace entity methods, property mutation, `save()`, and `refresh()` with collection calls and explicit update payloads. Request types now use operation-specific `Params` names and enforce schema-required fields. Read snake_case response fields and `_results` list envelopes. JSON endpoints preserve their responses; empty responses return `void` without an additional fetch. Analytics jobs are polled using `getExport`/`getReport`. Remove unsupported shift deletion and deprecated endpoints and groups, including contact groups, global custom fields, and teammate inbox listing. Use `listPrivateInboxes` for the supported private-inbox endpoint.

Support all 234 non-deprecated Core API operations, including linked conversations, private inboxes, time off, and separate knowledge-base article/category collections. Generate an OpenAPI-typed operation adapter that checks supported routes, path/query/body parameters, optional bodies, and response types. Raw message and attachment downloads return an unconsumed `Response` with shared authentication and error handling.

**Breaking pagination change:** preserve the full next-page URL in `pagination.next`. Paginated list methods accept `nextPageUrl`, whose query parameters override all other options. Only endpoints declaring `page_token` expose this option. Use `pageTokenFromPaginationNextUrl` for explicit token calls. Invalid URLs and URLs for a different endpoint are rejected before sending requests. Iteration and automatic pagination remain deferred.

Include the previously merged OAuth refresh improvement: `refreshOAuthToken()` awaits `onTokenRefresh` to persist refreshed credentials before updating the client and returning. If persistence fails, the client retains its previous credentials. Refresh is explicit, not automatic on 401.

Add optional `audit:endpoints` and `audit:deprecations` development commands against the published OpenAPI spec or a saved JSON file. They check API completeness and deprecation annotations without running in CI, builds, or the normal check command. Document the pre-1.0 policy that minor releases may include labeled breaking changes.
