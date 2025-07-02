import { Front } from "../src"

async function main() {
  // Initialize the Front SDK
  const front = new Front({
    apiKey: process.env.FRONT_API_KEY || "your-api-key",
  })

  try {
    // Fetch token identity details
    console.log("Fetching token identity...")
    const tokenInfo = await front.me()

    console.log("Token Details:")
    console.log("- Company Name:", tokenInfo.name)
    console.log("- Company ID:", tokenInfo.id)
    console.log("- Self link:", tokenInfo._links.self)

    // You can also use OAuth
    const frontOAuth = new Front({
      oauth: {
        clientId: "your-oauth-client-id",
        clientSecret: "your-oauth-client-secret",
        accessToken: "your-access-token",
        refreshToken: "your-refresh-token",
      },
    })

    // Fetch token identity for OAuth token
    const oauthTokenInfo = await frontOAuth.me()
    console.log("\nOAuth Token Details:")
    console.log("- Company Name:", oauthTokenInfo.name)
    console.log("- Company ID:", oauthTokenInfo.id)
  } catch (error) {
    console.error("Error:", error)
  }
}

// Run the example
if (require.main === module) {
  main()
}
