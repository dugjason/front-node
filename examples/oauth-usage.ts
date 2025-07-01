import { Front, type OAuthTokens } from "../src"

async function main() {
  // Initialize the Front SDK with OAuth
  const front = new Front({
    oauth: {
      clientId: "your-oauth-client-id",
      clientSecret: "your-oauth-client-secret",
      accessToken: "your-current-access-token",
      refreshToken: "your-refresh-token",

      // Optional callback when tokens are refreshed
      onTokenRefresh: async (tokens) => {
        console.log("Tokens refreshed!")
        console.log(
          "New access token:",
          `${tokens.access_token.substring(0, 10)}...`,
        )

        // Here you would typically save the new tokens to your database
        // await saveTokensToDatabase(tokens);
      },
    },
  })

  try {
    // Check if using OAuth
    console.log("Using OAuth:", front.isUsingOAuth())

    // The SDK will automatically refresh tokens when needed
    const teammates = await front.teammates.list()
    console.log("Found", teammates._results.length, "teammates")

    // Fetch a conversation - token will be refreshed automatically if needed
    const conversation = await front.conversations.fetch("cnv_55c8c149")
    console.log("Conversation subject:", conversation.subject)

    // Update OAuth config if needed (e.g., if you get new tokens from elsewhere)
    front.updateOAuthConfig({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    })
  } catch (error) {
    console.error("Error:", error)
  }
}

// Example of handling token refresh in a real application
class TokenStorage {
  async saveTokens(tokens: OAuthTokens) {
    // Save to database, file, or secure storage
    console.log("Saving tokens to storage:", {
      accessToken: `${tokens.access_token.substring(0, 10)}...`,
      refreshToken: `${tokens.refresh_token.substring(0, 10)}...`,
    })
  }

  async loadTokens() {
    // Load from database, file, or secure storage
    const clientId = process.env.FRONT_OAUTH_CLIENT_ID
    const clientSecret = process.env.FRONT_OAUTH_CLIENT_SECRET
    const accessToken = process.env.FRONT_ACCESS_TOKEN
    const refreshToken = process.env.FRONT_REFRESH_TOKEN

    if (!clientId || !clientSecret || !accessToken || !refreshToken) {
      throw new Error("Missing required OAuth environment variables")
    }

    return {
      clientId,
      clientSecret,
      accessToken,
      refreshToken,
    }
  }
}

async function _realWorldExample() {
  const storage = new TokenStorage()
  const oauthConfig = await storage.loadTokens()

  const front = new Front({
    oauth: {
      ...oauthConfig,
      onTokenRefresh: async (tokens) => {
        // Save new tokens when they're refreshed
        await storage.saveTokens(tokens)
      },
    },
  })

  // Use the SDK normally - tokens will be managed automatically
  const conversations = await front.conversations.list({ limit: 10 })
  console.log("Recent conversations:", conversations._results.length)
}

// Run the examples
if (require.main === module) {
  main().catch(console.error)
}
