---
"@dugjason/front-node": minor
---

Add OAuth access/refresh token credentials and explicit `refreshOAuthToken()` exchanges with an optional `onTokenRefresh` callback. Await the callback before adopting rotated tokens and propagate callback failures.
