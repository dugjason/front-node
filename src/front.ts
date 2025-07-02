import { FrontClient } from "./client"
import { Accounts } from "./resources/accounts"
import { Conversations } from "./resources/conversations"
import { Drafts } from "./resources/drafts"
import { Tags } from "./resources/tags"
import { Teammates } from "./resources/teammates"
import type { FrontConfig, TokenIdentity } from "./types"

export class Front {
  private client: FrontClient

  public readonly teammates: Teammates
  public readonly conversations: Conversations
  public readonly accounts: Accounts
  public readonly drafts: Drafts
  public readonly tags: Tags

  constructor(config: FrontConfig) {
    this.client = new FrontClient(config)

    // Initialize resource classes
    this.teammates = new Teammates(this.client)
    this.conversations = new Conversations(this.client)
    this.accounts = new Accounts(this.client)
    this.drafts = new Drafts(this.client)
    this.tags = new Tags(this.client)
  }

  /**
   * Fetch the details of the API token
   *
   * @returns Promise<TokenIdentity> The token identity information
   */
  async me(): Promise<TokenIdentity> {
    return this.client.get<TokenIdentity>("/me")
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
