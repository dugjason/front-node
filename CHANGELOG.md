# @dugjason/front-node

## 0.2.0

### Minor Changes

- c164375: Prepare the 0.2.0 release with no runtime behavior changes.

## 0.1.0

### Minor Changes

- 20b0ed9: Unify collection and resource classes across the SDK. Each plural resource class now supports collection operations, direct ID-first calls, and hydrated instance usage returned by `get(id)`. Remove the redundant singular resource classes and exports.

## 0.0.4

### Patch Changes

- 35bd0d9: Add collection-level inbox helpers and `channels.create`.

  - Add `front.inboxes.importMessage`, `listChannels`, `listConversations`, `listTeammateAccess`, `addTeammateAccess`, and `removeTeammateAccess` so inbox actions can be called with an inbox id directly (no `get()` required)
  - Add `front.channels.create(inboxId, {...body})` for creating channels in an inbox
  - Export `CreateChannel` from the channels module
  - Remove `FrontInbox.createChannel()`; use `front.channels.create(inbox.id, body)` instead (breaking)

## 0.0.3

### Patch Changes

- d3f18a3: simplify pagination handling

## 0.0.2

### Patch Changes

- 9a00a07: - Adds `front.conversations.listMessages(convId)` method
  - Updates client to set user-agent string
    - can set custom UA when initializing client - `new Front({..., userAgent: "my-ua-string"})`
  - Refactor test suite
  - Update internal (Agent) docs
