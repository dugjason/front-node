## AGENTS.md — Development and Coding Guide

### Purpose
This repository provides a modern TypeScript SDK for the Front.com API. It layers a generated HTTP client with ergonomic resource wrappers, strong typing, OAuth/API key authentication, consistent error handling, and an iterable pagination model that preserves underlying Response metadata.

This guide documents how to set up the environment, the architecture and coding patterns to follow, the testing approach, and the code generation workflow.

---

## Getting Started

### Requirements
- Node.js ≥ 18 (native `fetch`)
- pnpm (all package management uses pnpm)

### Install, build, test, lint
```bash
pnpm install
pnpm build
pnpm test
pnpm test:watch
pnpm lint
```

### Scripts
- `pnpm build`: TypeScript build to `dist/`
- `pnpm dev`: TypeScript watch mode
- `pnpm test`: Run Vitest
- `pnpm test:watch`: Watch tests
- `pnpm typecheck`: TS no-emit type checking
- `pnpm generate:types`: Regenerate client/types from OpenAPI spec

### Package manager policy
- Use pnpm for all operations
- Installation: `pnpm install` (but let's try to keep it dependency-free)
- Add dependency: `pnpm add <pkg>` / dev dependency: `pnpm add -D <pkg>`
- Remove dependency: `pnpm remove <pkg>`
- Use `pnpm dlx` instead of `npx`
- Version bumps: `pnpm version patch|minor|major`

---

## Project Structure

- `src/core/*`: Core client (`APIClient`), error mapping, pagination helpers, resource base classes
- `src/resources/*`: Handwritten resource wrappers (e.g., `accounts`, `tags`)
- `src/generated/*`: Generated client, SDK functions, and types (from `@hey-api/openapi-ts`)
- `src/oauth.ts`: OAuth token refresh manager
- `src/front.ts`: Public SDK surface (`Front`) wiring resources and convenience methods
- `src/index.ts`: Public exports and types
- `tests/*`: Vitest suite with MSW-powered mocks
- `examples/*`: Usage samples
- `dist/*`: Build output

---

## Architecture and Patterns

Reminder this is a server-side SDK - it should never be run from a browser environment.

### Layering (bottom → top)
1. Generated client and SDK functions: `src/generated/*`
2. Core client and utilities: `src/core/*`
3. Resource wrappers (public API): `src/resources/*`
4. Entry and exports: `src/front.ts`, `src/index.ts`

### `Front` SDK class
- Constructs the core `APIClient` and exposes resource namespaces (e.g., `front.accounts`, `front.tags`).
- Provides `me()` to fetch token identity.

### Core HTTP client (`APIClient`)
- Wraps the generated client and injects auth per request.
- Installs a response interceptor to handle `401` with OAuth: refresh once, then retry the original request.
- Normalizes failures into typed errors via `mapToFrontError`.

### Authentication
- API Key: Bearer token set directly.
- OAuth: `OAuthTokenManager` handles refresh with concurrency protection (only one refresh in-flight); `onTokenRefresh` callback allows callers to persist new tokens.

### Error handling
- All HTTP failures are mapped to `FrontError` subclasses (e.g., `FrontUnauthorizedError`, `FrontRateLimitError`) with status, code, request id (when available), and details.

### Pagination model
- List endpoints return a first-page pair and an async iterable of page pairs, preserving the underlying `Response` for each page.
- Types:
  - `Page<T>`: wraps `items: T[]` and `nextPage(): { response, page } | null`.
  - `PagePair<T>`: `{ response: Response; page: Page<T> }`.
- Helpers:
  - `buildPageFromListResponse`: creates the first `Page<T>` and wires `fetchNext` using `_pagination.next` → `page_token`.
  - `makePagedResult`: returns `{ response, page } & AsyncIterable<PagePair<T>>`.

### Resource wrappers
- Pattern for list endpoints:
  1) call generated SDK function
  2) map `_results` into domain instances
  3) wire `fetchNext` with `page_token`
  4) return `makePagedResult({ response, page })`
- Pattern for singular endpoints (get/create/update/delete): return `{ <entity>: Instance; response }` and keep instance methods thin (refresh after mutations when necessary).

### Domain instances
- Small classes (e.g., `FrontTag`, `FrontAccount`) encapsulating the raw `*Response` type with getters and `toJSON()`.
- Keep logic minimal; delegate network calls back to generated SDK functions.
- Small classes allow for an object-oriented approach to working with your data;

```ts
const front = new Front()
const { tag } = await front.tags.get(tagId)
await tag.update({highlight: "red"})
```

---

## Code Generation

- Config: `openapi-ts.config.ts` (points to Front Core API JSON, adds pagination keywords including `page_token`).
- Generated output: `src/generated/*` (do not edit by hand).
- Regenerate:
```bash
pnpm generate:types
```
- After regeneration, reconcile resource wrappers to reflect any response shape changes.

---

## Testing

### Test runner and environment
- Vitest with Node environment and global setup.
- MSW (Mock Service Worker) for HTTP mocking via `tests/mocks/node.js` and `tests/mocks/handlers.js`.

### Conventions
- Place tests in `./tests/` only and name them `<name>.test.ts`.
- Import sources using relative paths from `./tests/` to `./src/`.
- Organize with `describe` blocks; write clear `it` names; cover happy-path and error-path cases.
- Verify pagination behavior (`nextPage()` and preservation of `Response` per page).
- For error mapping, assert specific `FrontError` subclasses and status codes.
- Use `server.use(...)` to override handlers per test.
- Use fake timers and predictable jitter where timing-sensitive logic exists.

### Running tests
```bash
pnpm test
pnpm test:watch
```

---

## Linting, Formatting, and Type Checking

- Biome enforces formatting and linting across the repo (2-space indentation, double quotes, recommended rules).
- TypeScript is strict; output builds to `dist/` with declarations and source maps.
- Commands:
```bash
pnpm lint
pnpm typecheck
```

Key tsconfig settings:
- Target ES2022; ESM modules; strict mode; `moduleResolution: bundler`.

---

## Making Changes (Playbook)

1) Learn by example
- Find an existing resource (e.g., `accounts`, `tags`) and follow its structure.

2) Add or modify a resource
- Create `src/resources/<name>.ts` (extend `APIResource`).
- For list endpoints: build pages with `buildPageFromListResponse` and wrap with `makePagedResult`.
- For singular endpoints: return `{ <entity>, response }` and refresh instance data after mutations if needed.
- Define a small domain instance class exposing getters and `toJSON()`.

3) Wire it into the SDK
- Add to `Front` in `src/front.ts` and export from `src/index.ts` if appropriate.

4) Tests
- Create `tests/<name>.test.ts`, add MSW handlers, and cover both success and error paths.

5) Validate
```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

---

## Error Handling Guidance

- Throw normalized errors using `mapToFrontError`; do not swallow errors.
- Include status, code, request id (if available), and details for debugging.
- Keep retry behavior bounded (no unbounded loops on `401`/`429`).

---

## Authentication Guidance

- API key: simplest for tests and examples.
- OAuth: use `OAuthTokenManager`; rely on core client interceptor to refresh once on `401` and propagate `onTokenRefresh` to allow callers to persist tokens.

---

## Release Workflow (High-Level)

- Use semantic versioning with pnpm version commands:
```bash
pnpm version patch|minor|major
```
- Merging to `main` with an updated version will publish per CI configuration (see README for details).

---

## Quick Reference

- Install deps: `pnpm install`
- Generate SDK: `pnpm generate:types`
- Build (watch): `pnpm dev`
- Build (one-off): `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test` / `pnpm test:watch`

---

## Principles

- Prefer small, incremental changes that compile and pass tests.
- Follow existing patterns; keep code boring and obvious.
- Favor composition and explicit data flow.
- Tests are deterministic and document behavior.
