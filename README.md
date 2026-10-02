# front-node

A modern TypeScript SDK for the [Front](https://front.com) API.

## Install

```bash
npm install @dugjason/front-node
```

## Usage

```ts
import { Front } from "@dugjason/front-node";

const front = new Front({ apiKey: process.env.FRONT_API_TOKEN });

const teammates = await front.teammates.list();

// ID-scoped operations do not require fetching the resource first.
await front.channels.createMessage("cha_123", {
  body: "Hello from Front",
  options: { archive: true },
  to: ["customer@example.com"],
});
await front.conversations.addTag("cnv_123", { tag_ids: ["tag_123"] });
await front.messages.markSeen("msg_123");
```

Credentials are exclusive: pass `{ apiKey }` **or** `{ accessToken, refreshToken }`, never both. Access tokens expire after 60 minutes; this client does not refresh on 401 — call `refreshOAuthToken` yourself.

```ts
const front = new Front({
  accessToken,
  refreshToken,
  onTokenRefresh: async (tokens) => {
    await persistTokens(tokens.access_token, tokens.refresh_token);
  },
});

const tokens = await front.refreshOAuthToken({
  clientId: process.env.FRONT_CLIENT_ID,
  clientSecret: process.env.FRONT_CLIENT_SECRET,
});
```

`refreshOAuthToken()` awaits `onTokenRefresh` before updating the client's credentials and returning the tokens. The callback receives the same `access_token` and `refresh_token` fields as the return value. If persistence fails, the refresh rejects and the client keeps its previous credentials. Front may already have rotated the refresh token, so recover the persistence failure before attempting another refresh.

## Development

```bash
bun install
bun test
bun run check
```

## Release

Releases are managed by Changesets. Add a changeset for user-facing changes:

```bash
bun run changeset
```

Merging to `main` opens or updates a version PR. Merging that version PR publishes
to npm as `@dugjason/front-node` through npm trusted publishing.

## Custom `fetch`

You can use the library with a custom fetch library, compatible with `node:fetch`.
An illustrative example could be a fetch implementation with built-in tracing or custom telemetry;

```ts
import { Front } from "@dugjason/front-node";

const loggingFetch: typeof fetch = async (input, init) => {
  const t0 = performance.now();
  const response = await globalThis.fetch(input, init);
  console.log(
    `${init?.method ?? "GET"} ${input} ${response.status} ${Math.round(performance.now() - t0)}ms`,
  );
  return response;
};
const front = new Front({ fetch: loggingFetch });
```

### Tags

Tags use collection methods and return plain `TagResponse` objects with Front's snake_case fields. Request types are `CreateTagParams`, `CreateChildTagParams`, and `UpdateTagParams`.

```ts
const tag = await front.tags.get("tag_123");
await front.tags.update(tag.id, { name: "Priority", parent_tag_id: null });
const updated = await front.tags.get(tag.id); // Updates return void (204).
const children = await front.tags.listChildren(tag.id);
console.log(children._results);
await front.tags.delete(tag.id);
```

Each list call fetches one page. `pagination.next` contains Front's full next-page URL:

```ts
const firstPage = await front.tags.list({ limit: 20, sort_by: "name", sort_order: "asc" });
if (firstPage.pagination?.next) {
  const secondPage = await front.tags.list({ nextPageUrl: firstPage.pagination.next });
}
```

`nextPageUrl` overrides all other list parameters. Tags child and conversation lists, company tag lists, and team tag lists also accept it. Pagination responses across the SDK now preserve the full URL; other collections will gain `nextPageUrl` support as they are migrated. For a direct `page_token` call, use `pageTokenFromPaginationNextUrl(page.pagination.next)` to extract the token.

Migration: replace `tag.update(params)`, property mutations followed by `tag.save()`, and `tag.delete()` with collection calls using `tag.id`. Replace `tag.refresh()` with `front.tags.get(tag.id)`. Use `created_at` instead of `createdAt`. Child lists now preserve the API envelope; read `_results` rather than using the return value as an array. Company and team tag creation also return plain tag responses. Other resources retain their current API while this migration proceeds.

Team tag operations also take the ID first:

```ts
const tags = await front.teams.listTags("tim_123", { limit: 20 });
const tag = await front.teams.createTag("tim_123", {
  name: "Priority",
  is_visible_in_conversation_lists: true,
});
```

Replace fetched-team `team.listTags(params)` and `team.createTag(params)` calls with these collection methods using `team.id`. Team tag lists accept `nextPageUrl`, which overrides other list parameters.

Company tags use `front.company.listTags(params)` and `front.company.createTag(params)`; no company ID is required. Their request types are `ListCompanyTagsParams` and `CreateCompanyTagParams`. For team tags, use `ListTeamTagsParams` and `CreateTeamTagParams`.

```ts
const first = await front.company.listTags({ limit: 20 });
if (first.pagination?.next) {
  const second = await front.company.listTags({ nextPageUrl: first.pagination.next });
}
```
