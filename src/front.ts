import { FrontClient } from "./client"
import { Accounts } from "./resources/accounts"
import { Conversations } from "./resources/conversations"
import { Teammates } from "./resources/teammates"
import type { FrontConfig } from "./types"

export class Front {
  private client: FrontClient

  public readonly teammates: Teammates
  public readonly conversations: Conversations
  public readonly accounts: Accounts

  constructor(config: FrontConfig) {
    this.client = new FrontClient(config)

    // Initialize resource classes
    this.teammates = new Teammates(this.client)
    this.conversations = new Conversations(this.client)
    this.accounts = new Accounts(this.client)
  }

  /**
   * Get the underlying HTTP client for advanced usage
   */
  getClient(): FrontClient {
    return this.client
  }

  /**
   * Check if the SDK is using OAuth authentication
   */
  isUsingOAuth(): boolean {
    return this.client.isUsingOAuth()
  }

  /**
   * Get the OAuth token manager (if using OAuth)
   */
  getOAuthManager() {
    return this.client.getOAuthManager()
  }

  /**
   * Update OAuth configuration (useful for updating tokens)
   */
  updateOAuthConfig(updates: Partial<FrontConfig["oauth"]>) {
    if (!updates) return
    this.client.updateOAuthConfig(updates)
  }
}
