---
"@dugjason/front-node": minor
---

Refresh the Front Core API types and include ticket statuses in event targets. `MessageResponse.author` is required and accepts `null`. The SDK fills in `null` when Front omits the author. With strict null checks, also handle `null` in `ConversationResponse.assignee` and `recipient`, and seen receipts' `seen_by`. Conversation fixtures now need the required boolean `is_closed`, and seen receipts expose `first_seen_at` as a number in milliseconds. Code that exhaustively handles event target data must also handle `StatusResponse`.

To change a conversation's assignee, pass `assignee_id` to `update()` or `updateAssignee()`. The body built by `toUpdateBody()` for `save()` omits the assignee so it cannot overwrite a newer assignment. Call `refresh()` after assigning a teammate to load their details.
