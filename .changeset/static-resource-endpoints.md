---
"@dugjason/front-node": patch
---

Unify collection and resource classes across the SDK. Each plural resource class now supports collection operations, direct ID-first calls, and hydrated instance usage returned by `get(id)`. Remove the redundant singular resource classes and exports.
