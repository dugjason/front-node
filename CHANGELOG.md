# @dugjason/front-node

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
