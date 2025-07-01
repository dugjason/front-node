import type { OAuthConfig } from "./types"

interface OAuthTokenResponse {
  access_token: string
  refresh_token: string
}

export class OAuthTokenManager {
  private config: OAuthConfig
  private isRefreshing = false
  private refreshPromise: Promise<void> | null = null

  constructor(config: OAuthConfig) {
    this.config = { ...config }
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string {
    return this.config.accessToken
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshToken(): Promise<string> {
    // If already refreshing, wait for the existing refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      await this.refreshPromise
      return this.config.accessToken
    }

    // Start the refresh process
    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      await this.refreshPromise
      return this.config.accessToken
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<void> {
    const oauthUrl = "https://app.frontapp.com/oauth/token"

    // Create Basic Auth header
    const credentials = btoa(
      `${this.config.clientId}:${this.config.clientSecret}`,
    )

    const response = await fetch(oauthUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.config.refreshToken,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Failed to refresh OAuth token: ${response.status} ${errorText}`,
      )
    }

    const apiResponse: OAuthTokenResponse =
      (await response.json()) as OAuthTokenResponse

    // Update the stored tokens
    this.config.accessToken = apiResponse.access_token
    this.config.refreshToken = apiResponse.refresh_token

    // Call the callback if provided
    if (this.config.onTokenRefresh) {
      await this.config.onTokenRefresh({
        access_token: this.config.accessToken,
        refresh_token: this.config.refreshToken,
      })
    }
  }

  /**
   * Update the OAuth configuration (useful when tokens are refreshed externally)
   */
  updateConfig(updates: Partial<OAuthConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * Get the current OAuth configuration
   */
  getConfig(): Readonly<OAuthConfig> {
    return { ...this.config }
  }
}
