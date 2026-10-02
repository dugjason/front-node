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
