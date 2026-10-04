---
"@dugjason/front-node": minor
---

Add opt-in automatic OAuth refresh on API 401 responses. Await token persistence before retrying once, share refresh across concurrent requests, and preserve token exchange and save errors for both JSON and raw-response requests.
