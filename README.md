# Front Node.js SDK

A modern TypeScript SDK for the [Front.com API](https://dev.frontapp.com/reference/introduction). This SDK provides a clean, intuitive interface for interacting with Front's customer operations platform.

## Installation

```bash
npm install front-node
# or
pnpm install front-node
# or
yarn add front-node
```

## Quick Start

```typescript
import { Front } from 'front-node';

// Initialize with API key (required)
const front = new Front({ 
  apiKey: process.env.FRONT_API_KEY || 'your-api-key' 
});

// Fetch a conversation
const conversation = await front.conversations.fetch('cnv_55c8c149');

// List teammates
const teammates = await front.teammates.list();

// Update a teammate
await front.teammates.update(teammates._results[0].id, {
  is_available: true
});
```

## Authentication

The SDK supports two authentication methods:

### 1. OAuth (Recommended for Production)

OAuth provides automatic token refresh and is required for public integrations:

```typescript
const front = new Front({
  oauth: {
    clientId: 'your-oauth-client-id',
    clientSecret: 'your-oauth-client-secret',
    accessToken: 'your-current-access-token',
    refreshToken: 'your-refresh-token',
    
    // Optional: Called when tokens are refreshed
    onTokenRefresh: async (tokens) => {
      // Save new tokens to your database
      await saveTokensToDatabase(tokens);
    }
  }
});
```

The SDK automatically refreshes tokens when they expire (every hour) and calls your `onTokenRefresh` callback with the new tokens.

### 2. API Key (Simple Setup)

For testing or single-instance usage:

```typescript
// Using environment variable (recommended)
const front = new Front({ 
  apiKey: process.env.FRONT_API_KEY || 'your-api-key' 
});

// Or provide directly
const front = new Front({ apiKey: 'your-api-key' });
```

## API Reference

### Conversations

```typescript
// List conversations
const conversations = await front.conversations.list({
  limit: 50,
  q: 'status:unassigned'
});

// Fetch a specific conversation
const conversation = await front.conversations.fetch('cnv_123');

// Update a conversation
await front.conversations.update('cnv_123', {
  status: 'archived'
});

// Get conversation messages
const messages = await front.conversations.getMessages('cnv_123');

// Get conversation events
const events = await front.conversations.getEvents('cnv_123');
```

### Teammates

```typescript
// List all teammates
const teammates = await front.teammates.list();

// Fetch a specific teammate
const teammate = await front.teammates.fetch('tea_123');

// Update a teammate
await front.teammates.update('tea_123', {
  first_name: 'John',
  last_name: 'Doe',
  is_available: true
});

// Get teammate's inboxes
const inboxes = await front.teammates.getInboxes('tea_123');

// Get teammate's conversations
const conversations = await front.teammates.getConversations('tea_123', {
  limit: 10
});
```

## OAuth Token Management

When using OAuth, the SDK provides several utilities for token management:

```typescript
// Check if using OAuth
const isOAuth = front.isUsingOAuth();

// Get OAuth manager for advanced operations
const oauthManager = front.getOAuthManager();
if (oauthManager) {
  // Force token refresh
  const newToken = oauthManager.getAccessToken();
}

// Update OAuth configuration (e.g., after manual token refresh)
front.updateOAuthConfig({
  accessToken: 'new-access-token',
  refreshToken: 'new-refresh-token',
});
```

### Token Refresh Callback

The `onTokenRefresh` callback is crucial for OAuth implementations - it allows the SDK to notify your application when tokens are automatically refreshed, so you can save the updated tokens to your database or storage system.

**Example with database storage:**
```typescript
// Function to save tokens to your database
async function saveTokensToDatabase(userId: string, tokens: OAuthTokens) {
  await db.users.update(userId, {
    frontAccessToken: tokens.access_token,
    frontRefreshToken: tokens.refresh_token,
    updatedAt: new Date()
  });
}

const front = new Front({
  oauth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    accessToken: 'current-access-token',
    refreshToken: 'current-refresh-token',
    
    // SDK calls this whenever tokens are refreshed
    onTokenRefresh: async (tokens) => {
      console.log('Front SDK refreshed tokens, saving to database...');
      await saveTokensToDatabase(currentUserId, tokens);
      console.log('Tokens saved successfully');
    }
  }
});

// When any API call triggers a token refresh, your callback will be called
const conversations = await front.conversations.list(); // May trigger refresh + callback
```

### Concurrent Token Refresh Protection

The SDK uses an internal `refreshPromise` mechanism to prevent multiple simultaneous token refresh attempts. This ensures that if multiple API calls happen simultaneously when a token is expired, only one refresh request is made to the OAuth server, and your `onTokenRefresh` callback is only called once.

**How it works:**
- When the first API call detects an expired token, it starts the refresh process
- Any subsequent API calls that also detect the expired token will wait for the same refresh promise to complete
- Once the refresh is complete, `onTokenRefresh` is called once with the new tokens
- All waiting calls then proceed with the refreshed token

**Practical Example:**
```typescript
let refreshCount = 0;

const front = new Front({
  oauth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    accessToken: 'expired-token',
    refreshToken: 'your-refresh-token',
    onTokenRefresh: async (tokens) => {
      refreshCount++;
      console.log(`Token refresh #${refreshCount}:`, tokens);
      await saveTokensToDatabase(currentUserId, tokens);
    }
  }
});

// These calls happen simultaneously when token is expired
// Only ONE refresh request will be made, callback called once
const [conversations, teammates, accounts] = await Promise.all([
  front.conversations.list(),  // Triggers token refresh
  front.teammates.list(),      // Waits for existing refresh
  front.accounts.list()        // Waits for existing refresh
]);

console.log(`Refresh count: ${refreshCount}`); // Will be 1, not 3
```

This prevents rate limiting issues with the OAuth provider and ensures your database isn't hit with duplicate token updates.

## Configuration

```typescript
const front = new Front({
  apiKey: 'your-api-key', // For API key auth
  baseUrl: 'https://api2.frontapp.com', // optional, defaults to Front's API
  oauth: { // For OAuth auth
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    accessToken: 'current-access-token',
    refreshToken: 'current-refresh-token',
    onTokenRefresh: async (tokens) => { /* save tokens */ }
  }
});
```

## Error Handling

The SDK throws structured errors with helpful information:

```typescript
try {
  const conversation = await front.conversations.fetch('invalid-id');
} catch (error) {
  console.error('Status:', error.status);
  console.error('Message:', error.message);
  console.error('Code:', error.code);
}
```

## TypeScript Support

The SDK is built with TypeScript and provides full type definitions:

```typescript
import { Front, Conversation, Teammate } from 'front-node';

const front = new Front({ apiKey: 'your-api-key' });

// Full type safety
const conversation: Conversation = await front.conversations.fetch('cnv_123');
const teammates: Teammate[] = (await front.teammates.list())._results;
```

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
