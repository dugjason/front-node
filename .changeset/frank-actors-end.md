---
"@dugjason/front-node": patch
---

Add collection-level inbox helpers and `channels.create`.

- Add `front.inboxes.importMessage`, `listChannels`, `listConversations`, `listTeammateAccess`, `addTeammateAccess`, and `removeTeammateAccess` so inbox actions can be called with an inbox id directly (no `get()` required)
- Add `front.channels.create(inboxId, {...body})` for creating channels in an inbox
- Export `CreateChannel` from the channels module
- Remove `FrontInbox.createChannel()`; use `front.channels.create(inbox.id, body)` instead (breaking)
