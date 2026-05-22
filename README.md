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
```

By default, requests include `User-Agent: @dugjason/front-node@<version>`. You can override it at
client initialization time:

```ts
const front = new Front({
  apiKey: process.env.FRONT_API_TOKEN,
  userAgent: "my-app/1.0.0",
});
```

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
