# Front Node.js SDK

A modern TypeScript SDK for the [Front.com API](https://dev.frontapp.com/reference/introduction). This SDK provides a clean, intuitive interface for interacting with Front's customer operations platform.

## Installation

```bash
npm install @dugjason/front-node
# or
pnpm add @dugjason/front-node
```

## Quick Start

```typescript
import { Front } from " @dugjason/front-node"

// Initialize with API key (required)
const front = new Front({ apiKey: "your-api-key" })

// Get token details
const tokenInfo = await front.me()

// Fetch a conversation
const { conversation } = await front.conversations.fetch("cnv_12345")

// List teammates
const { teammates } = await front.teammates.list()

// Update a teammate
await front.teammates.update(teammates[0].id, {
  is_available: true
})
```

## Authentication

The SDK supports two authentication methods:

### 1. OAuth (Recommended for Production)

OAuth provides automatic token refresh and is required for public integrations:

```typescript
const front = new Front({
  oauth: {
    clientId: "your-oauth-client-id",
    clientSecret: "your-oauth-client-secret",
    accessToken: "your-current-access-token",
    refreshToken: "your-refresh-token",
    
    // Optional: Called when tokens are refreshed
    onTokenRefresh: async (tokens) => {
      // Save new tokens to your database
      await saveTokensToDatabase(tokens)
    }
  }
})
```

The SDK automatically refreshes tokens when they expire (Front issues OAuth access tokens with a 1hr TTL) and calls your `onTokenRefresh` callback with the new tokens.

### 2. API Key (Simple Setup)

For testing or single-instance usage:

```typescript
// Specify your API key when initializing the client
const front = new Front({ apiKey: "your-api-key" })

// Or omit the auth, and we'll load it from `process.env.FRONT_API_KEY` automatically
const front = new Front()
```

## Response Signature

All requests have similar return object structure.
The response will contain;
* a `response` object containing the raw response from the API
* the returned object(s) as either an object, list or an iterable list

### Single Object Responses

In cases where we're creating or fetching a single resource the response will contain an object matching the name of the resource. For example;
```typescript
const { tag } = front.tags.create({ ... })
```

### List Responses

For lists of resources, we return a `page` containing `items`. 
In some cases the Front API only returns a single page of resources (no pagination), but in others you can use the iterator to page through all results;

```typescript
const { page } = await front.accounts.list()
for (const account of page.items) {
  await doSomething(account)
}
```

## Resource Classes

Resources are returned as instances of classes, such as a `Teammate` or `Message`. This allows us to support class instance methods such as `.update()` or .delete() methods on class resources. 
For example, we can fetch a tag then update it;

```typescript
// Fetch the tag
let { tag } = await front.tags.get(tagId)

// Then we can update it either using the class instance
tag = await tag.update({ highlight: "red" })
// or using the same `front.tags...` method
tag = await front.tags.update(tagId, { highlight: "red" })
```

## API Reference

### Token Identity

```typescript
// Get details about the current API token
const tokenInfo = await front.me()
console.log("Company name:", tokenInfo.name) // Company name
console.log("Company ID:", tokenInfo.id) // Company ID (e.g., 'cmp_123')
```

### Conversations

```typescript
// List conversations
const { page: conversations } = await front.conversations.list({
  q: "status:unassigned"
  limit: 50,
})

// Fetch a specific conversation
const { conversation } = await front.conversations.fetch("cnv_123")

// Update a conversation
await front.conversations.update("cnv_123", {
  status: "archived"
})

// Get conversation messages
const { page: messages } = await front.conversations.listMessages("cnv_123")

// Get conversation events
const { page: events } = await front.conversations.listEvents("cnv_123")
```

### Teammates

```typescript
// List all teammates
const { page: teammates } = await front.teammates.list()

// Fetch a specific teammate
const { teammate } = await front.teammates.fetch("tea_123")

// Update a teammate
await front.teammates.update("tea_123", {
  first_name: "John",
  last_name: "Doe",
  is_available: true
})
```

### Drafts

The drafts API allows you to create, edit, list, and delete draft messages. Drafts can be created as new conversations or as replies to existing conversations.

```typescript
// Create a new draft in a channel (starts a new conversation)
const { draft } = await front.drafts.create("cha_123", {
  body: "This is a new draft message",
  subject: "Draft Subject",
  to: ["customer@example.com"],
  cc: ["manager@company.com"],
  author_id: "tea_123",
  mode: "private", // 'private' or 'shared'
  should_add_default_signature: true
})

// Create a draft reply to an existing conversation
const { draft: reply } = await front.drafts.createReply("cnv_123", {
  body: "This is a draft reply",
  channel_id: "cha_123",
  author_id: "tea_123",
  mode: "shared"
})
```

## Error Handling

The SDK throws structured errors with helpful information:

```typescript
try {
  const { conversation } = await front.conversations.fetch("invalid-id")
} catch (error) {
  if (error instanceof FrontError) {
    console.error("Status:", error.status)
    console.error("Message:", error.message)
    console.error("Code:", error.code)
  }
}
```

## TypeScript Support

The SDK is built with TypeScript and provides full type definitions:

```typescript
import { Front, type Account, type Contact } from "@dugjason/front-node"

const front = new Front({ apiKey: "your-api-key" })

// Full type safety
let account: Account
let contacts: Array<Contact>
const accountRes = await front.accounts.fetch("acc_123")
account = accountRes.account
const contactsRes = front.accounts.listContacts("acc_123")
contacts = contactsRes.page.items
```

## Pagination

The SDK supports robust pagination using iterators. 

## Releases

This package uses automated publishing with manual version management. When changes are merged to the main branch, the current version in `package.json` is automatically published to npm.

### Release Process

1. **Version Management**: Version bumps are handled manually using semantic versioning:
   - **Patch** (`1.0.0` → `1.0.1`): Bug fixes, documentation updates, refactoring
   - **Minor** (`1.0.0` → `1.1.0`): New features, enhancements
   - **Major** (`1.0.0` → `2.0.0`): Breaking changes

2. **How to Release**:
   ```bash
   # Bump version using pnpm (recommended)
   pnpm version patch   # for bug fixes
   pnpm version minor   # for new features
   pnpm version major   # for breaking changes
   
   # Or manually edit package.json and create a git tag
   git tag v1.2.3
   
   # Push changes and tags
   git push origin main --tags
   ```

3. **What Happens on Push to Main**:
   - Tests run on Node.js 20 and 22
   - Code is linted with Biome
   - TypeScript compilation is verified
   - Package is published to npm using the current `package.json` version
   - GitHub release is created with the current version tag

### Development Workflow

1. Create feature branch from `main`
2. Make changes and commit
3. Open Pull Request
4. After review and merge to `main`:
   - If you want to publish: bump version first, then merge
   - If not ready to publish: merge without version bump

## Requirements

- Node.js 18.0.0 or higher (for native fetch support)
- TypeScript 5.0+ (if using TypeScript)

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
