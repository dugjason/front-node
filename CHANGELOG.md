# @dugjason/front-node

## 0.0.2

### Patch Changes

- 9a00a07: - Adds `front.conversations.listMessages(convId)` method
  - Updates client to set user-agent string
    - can set custom UA when initializing client - `new Front({..., userAgent: "my-ua-string"})`
  - Refactor test suite
  - Update internal (Agent) docs
