---
"@dugjason/front-node": minor
---

Add OAuth credentials and explicit token refresh through `refreshOAuthToken()`. The optional `onTokenRefresh` callback receives the rotated access and refresh tokens and is awaited before the client adopts them. If the callback fails, the refresh rejects and the client keeps its previous credentials. Token refresh does not run automatically on HTTP 401 responses.
