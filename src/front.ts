import type { APIClient } from "./core/client"
import { APIClient as CoreClient } from "./core/client"
import { Accounts } from "./endpoints/accounts"
import { Tags } from "./endpoints/tags"
import { TeammateGroups } from "./endpoints/teammate-groups"
import { Teammates } from "./endpoints/teammates"
import { Teams } from "./endpoints/teams"
import { apiTokenDetails } from "./generated/sdk.gen"
import type { FrontConfig, TokenIdentity } from "./types"

export class Front {
  private client: APIClient

  constructor(config?: FrontConfig) {
    // Initializes auth
    this.client = new CoreClient(config)
  }

  /* Resource accessors */

  private _accounts?: Accounts
  get accounts(): Accounts {
    return (this._accounts ??= new Accounts())
  }

  private _tags?: Tags
  get tags(): Tags {
    return (this._tags ??= new Tags())
  }

  private _teammates?: Teammates
  get teammates(): Teammates {
    return (this._teammates ??= new Teammates())
  }

  private _teammateGroups?: TeammateGroups
  get teammateGroups(): TeammateGroups {
    return (this._teammateGroups ??= new TeammateGroups())
  }

  private _teams?: Teams
  get teams(): Teams {
    return (this._teams ??= new Teams())
  }

  /**
   * Fetch the details of the API token
   *
   * @returns Promise<TokenIdentity> The token identity information
   */
  async me() {
    const result = await apiTokenDetails()
    const data = result.data as TokenIdentity | undefined
    if (!data) {
      throw new Error("Failed to fetch token identity")
    }
    return data
  }

  /**
   * Get the underlying HTTP client for advanced usage
   */
  getClient(): APIClient {
    return this.client
  }

  /**
   * Get the OAuth token manager (if using OAuth)
   */
  getOAuthManager() {}

  /**
   * Update OAuth configuration (useful for updating tokens)
   */
  updateOAuthConfig(_updates: Partial<FrontConfig["oauth"]>) {}
}
