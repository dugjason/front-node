---
"@dugjason/front-node": minor
---

Refresh the Front Core API types and include ticket statuses in event targets. With strict null checks, handle `null` in `MessageResponse.author`, `ConversationResponse.assignee` and `recipient`, and seen receipts' `seen_by`. Conversation fixtures now need the required boolean `is_closed`, and seen receipts expose `first_seen_at` as a number in milliseconds. Code that exhaustively handles event target data must also handle `StatusResponse`.
