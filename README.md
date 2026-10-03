# front-node

A modern TypeScript SDK for the [Front](https://front.com) API.

Before version 1.0, minor releases may include breaking changes. Review the changelog and migration notes before upgrading. Breaking changes are labeled explicitly; patch releases are intended for compatible fixes.

## Install

```bash
npm install @dugjason/front-node
```

## Usage

```ts
import { Front } from "@dugjason/front-node";

const front = new Front({ apiKey: process.env.FRONT_API_TOKEN });

const teammates = await front.teammates.list();

// Collection methods take the resource ID first and do not fetch first.
await front.channels.createMessage("cha_123", {
  body: "Hello from Front",
  options: { archive: true },
  to: ["customer@example.com"],
});
await front.conversations.addTag("cnv_123", { tag_ids: ["tag_123"] });
await front.messages.markSeen("msg_123");

// Responses are plain data; use collection methods for subsequent requests.
const conversation = await front.conversations.get("cnv_123");
await front.conversations.addTag(conversation.id, { tag_ids: ["tag_123"] });
```

All resource namespaces follow this structure. Request types use operation-specific `Params` names, such as `CreateAccountParams` and `UpdateConversationParams`. Responses preserve Front's field names. JSON endpoints return the API response; empty responses return `void`. List responses keep their `_results` envelope.

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

`nextPageUrl` overrides all other list parameters on every endpoint whose OpenAPI operation declares `page_token`. Endpoints without `page_token` accept only their documented query parameters; endpoints without any query parameters accept none. Pagination responses preserve the full URL. For a direct `page_token` call, use `pageTokenFromPaginationNextUrl(page.pagination.next)` to extract the token.

Migration: replace `tag.update(params)`, property mutations followed by `tag.save()`, and `tag.delete()` with collection calls using `tag.id`. Replace `tag.refresh()` with `front.tags.get(tag.id)`. Use `created_at` instead of `createdAt`. Child lists accept only the tag ID and preserve the API envelope; read `_results` rather than using the return value as an array. Company and team tag creation also return plain tag responses. These collection and plain-response conventions apply to every resource.

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

### Channels

Channel responses are plain `ChannelResponse` objects. Use ID-first collection methods for subsequent operations:

```ts
const channel = await front.channels.get("cha_123");
await front.channels.update(channel.id, { name: "Support" });
const updated = await front.channels.get(channel.id);
const channels = await front.teams.listChannels("tim_123");
```

Replace fetched-channel operations with `front.channels.update(id, params)`, `createDraft(id, params)`, `createMessage(id, params)`, `receiveCustomMessage(id, params)`, and `validate(id)`. Replace `save()` with an explicit update payload and `refresh()` with `get(id)`. Create and update return `void`; draft creation returns a message, and message submission and validation return their accepted responses. Channel deletion is not supported.

Request types are `CreateChannelParams`, `UpdateChannelParams`, `CreateChannelDraftParams`, `CreateChannelMessageParams`, and `ReceiveCustomMessageParams`. Channel list endpoints accept no query parameters. Inbox, team, and teammate lists use `front.inboxes.listChannels(inboxId)`, `front.teams.listChannels(teamId)`, and `front.teammates.listChannels(teammateId)`; replace bound inbox/team list calls with these ID-first calls. Response fields retain Front's names, such as `send_as` and `is_valid`.

Resource implementations use `FrontBase.requestOperation(operationId, params)`. OpenAPI determines the HTTP route, required path/body fields, allowed query parameters, and response type. `nextPageUrl` is available only when the operation declares `page_token`. Tag child lists and channel lists declare no query parameters. The operation route map is regenerated alongside the schema by `bun run generate`. The adapter supports optional request bodies. Two narrow corrections cover omissions in Front’s spec: nullable tag parents and the message-template update body, derived from its existing `UpdateMessageTemplate` component.

### Other resource collections

Scoped team, teammate, and inbox operations take the parent ID first:

```ts
const contacts = await front.teams.listContacts("tim_123", { limit: 20 });
const tags = await front.teammates.listTags("tea_123", { limit: 20 });
await front.inboxes.addTeammateAccess("inb_123", { teammate_ids: ["tea_123"] });
```

Knowledge base operations are split by resource:

```ts
const knowledgeBase = await front.knowledgeBases.get("knb_123");
const article = await front.knowledgeBaseArticles.get("kba_123");
const content = await front.knowledgeBaseArticles.getContentLocale(article.id, "en");
const category = await front.knowledgeBaseCategories.get("kbc_123");
```

Time off creation and listing are scoped to teammates or teams; updates and deletion use the time-off collection:

```ts
const timeOff = await front.teammates.createTimeOff("tea_123", {
  name: "Vacation",
  start_at: 1_700_000_000,
  end_at: null,
});
await front.timeOffs.update(timeOff.id, { end_at: 1_700_086_400 });
const linked = await front.conversations.listLinkedConversations("cnv_123", { limit: 20 });
const privateInbox = await front.teammates.createPrivateInbox("tea_123", { name: "Personal" });
```

The SDK includes all 234 non-deprecated operations in Front's Core API schema. Deprecated endpoints and resource groups are excluded from the SDK. Runtime tests assert requests and responses.

### Manual API audits

Run these optional development audits explicitly; they are excluded from CI, builds, and `bun run check`:

- `bun run audit:endpoints` compares exposed SDK methods with every non-deprecated operation in the published OpenAPI spec.
- `bun run audit:deprecations` checks that supported operations deprecated individually or through their group have `@deprecated` JSDoc on the SDK method or collection.

Each audit exits nonzero with the affected operations or SDK methods when it finds a gap; this is a development report, not a release gate. Network or invalid-spec errors also exit nonzero. Both fetch the current published spec without regenerating SDK files. Append a local OpenAPI JSON path to audit a saved spec, for example `bun run audit:endpoints ./core-api.json`. Deprecated operations are excluded from completeness requirements. Existing deprecated endpoints can be annotated; these audits do not add them back to the SDK. An entirely deprecated root collection also marks its child routes deprecated, even if a child lacks its own marker.

Poll analytics jobs by calling `front.analytics.getExport(exportId)` or `getReport(reportUid)` again. Download methods and `front.messages.fetchRaw(messageId, { headers: { Accept: "message/rfc822" } })` return an unconsumed `Response`.

Migration: replace fetched-resource operations with calls on their collection, passing the resource ID first. Replace local property mutation and `save()` with an explicit update payload; replace `refresh()` with `get(id)`. Read snake_case fields directly. Request types now use `Params` names and enforce required fields; for example, `UpdateSignatureParams` requires `is_default`. Methods returning empty responses do not manufacture resource data. Shift deletion has no supported endpoint. Template-folder deletion returns its `202` acceptance data, and article deletion returns its JSON response.

### OAuth

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
