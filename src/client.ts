import { OAuthTokenManager } from "./oauth"
import type { FrontConfig, FrontError, RequestOptions } from "./types"

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRetries: 3,
  baseDelay: 1_000, // 1 second
  maxDelay: 30_000, // 30 seconds
  jitterFactor: 0.2, // 20% jitter to avoid thundering herd problem
} as const

export class FrontClient {
  private apiKey?: string
  private baseUrl: string
  private oauthManager?: OAuthTokenManager

  constructor(config: FrontConfig) {
    this.baseUrl = config.baseUrl || "https://api2.frontapp.com"

    if ("oauth" in config && config.oauth) {
      // OAuth configuration provided
      this.oauthManager = new OAuthTokenManager(config.oauth)
    } else {
      // API key configuration
      this.apiKey = config.apiKey || process.env.FRONT_API_KEY
      if (!this.apiKey) {
        throw new Error(
          "API key is required when not using OAuth. Provide apiKey via config or FRONT_API_KEY environment variable.",
        )
      }
    }
  }

  async request<T>(options: RequestOptions): Promise<T> {
    return this.requestWithRetry<T>(options, 0)
  }

  private async requestWithRetry<T>(
    options: RequestOptions,
    retryCount: number,
  ): Promise<T> {
    const { method, path, body, params } = options

    // Build URL with query parameters
    const url = new URL(path, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    // Get the authorization token (OAuth or API key)
    const authToken = this.getAuthToken()

    // Prepare headers
    const headers: Record<string, string> = {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
    }

    // Add content-type for requests with body
    if (body) {
      headers["Content-Type"] = "application/json"
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
    }

    // Add body for non-GET requests
    if (body) {
      fetchOptions.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url.toString(), fetchOptions)

      // Handle token expiration for OAuth
      if (response.status === 401 && this.oauthManager) {
        // Token might be expired, try to refresh and retry once
        const refreshedToken = await this.oauthManager.refreshToken()
        // Token was refreshed, retry the request
        headers.Authorization = `Bearer ${refreshedToken}`
        const retryResponse = await fetch(url.toString(), {
          ...fetchOptions,
          headers,
        })
        return this.handleResponse<T>(retryResponse)
      }

      // Handle rate limiting (429 status)
      if (response.status === 429) {
        if (retryCount < RATE_LIMIT_CONFIG.maxRetries) {
          const retryAfterMs = this.getRetryDelay(response, retryCount)
          await this.sleep(retryAfterMs)
          return this.requestWithRetry<T>(options, retryCount + 1)
        }
        // Max retries exceeded, handle as normal error response
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof Error && "status" in error) {
        // Re-throw Front API errors
        throw error
      }

      // Handle network or other errors - retry if we haven't exceeded max retries
      if (retryCount < RATE_LIMIT_CONFIG.maxRetries) {
        const retryAfterMs = this.calculateExponentialBackoff(retryCount)
        await this.sleep(retryAfterMs)
        return this.requestWithRetry<T>(options, retryCount + 1)
      }

      // Max retries exceeded for network errors
      throw new Error(
        `Request failed after ${RATE_LIMIT_CONFIG.maxRetries} retries: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Calculate retry delay based on retry-after header and exponential backoff
   */
  private getRetryDelay(response: Response, retryCount: number): number {
    const retryAfterHeader = response.headers.get("retry-after")
    let retryAfterMs = 0

    if (retryAfterHeader) {
      // retry-after can be in seconds (integer) or HTTP date
      const retryAfterSeconds = Number.parseInt(retryAfterHeader, 10)
      if (!Number.isNaN(retryAfterSeconds)) {
        retryAfterMs = retryAfterSeconds * 1000
      } else {
        // Try parsing as HTTP date
        const retryAfterDate = new Date(retryAfterHeader)
        if (!Number.isNaN(retryAfterDate.getTime())) {
          retryAfterMs = Math.max(0, retryAfterDate.getTime() - Date.now())
        }
      }
    }

    // Calculate exponential backoff delay
    const exponentialBackoffMs = this.calculateExponentialBackoff(retryCount)

    // Use the maximum of retry-after and exponential backoff to ensure we wait AT LEAST retry-after time
    return Math.max(retryAfterMs, exponentialBackoffMs)
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateExponentialBackoff(retryCount: number): number {
    const { baseDelay, maxDelay, jitterFactor } = RATE_LIMIT_CONFIG

    // Calculate exponential delay: baseDelay * (2 ^ retryCount)
    const exponentialDelay = baseDelay * 2 ** retryCount

    // Apply maximum delay cap
    const cappedDelay = Math.min(exponentialDelay, maxDelay)

    // Add jitter to avoid thundering herd problem
    // Jitter is a random value between +-jitterFactor of the delay
    const jitter = cappedDelay * jitterFactor * (Math.random() * 2 - 1)

    return Math.max(0, cappedDelay + jitter)
  }

  /**
   * Sleep for the specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Get the appropriate auth token (OAuth access token or API key)
   */
  private getAuthToken(): string {
    if (this.oauthManager) {
      return this.oauthManager.getAccessToken()
    }

    if (!this.apiKey) {
      throw new Error(
        "No authentication method available. This should not happen with proper configuration.",
      )
    }

    return this.apiKey
  }

  /**
   * Handle the response from the API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle non-JSON responses (like 204 No Content)
    if (response.status === 204) {
      return {} as T
    }

    const responseData: unknown = await response.json()

    if (!response.ok) {
      // Type guard for error response structure
      const errorData = responseData as Record<string, unknown>
      const error: FrontError = {
        message:
          (typeof errorData.message === "string"
            ? errorData.message
            : undefined) || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        code: typeof errorData.code === "string" ? errorData.code : undefined,
      }
      throw error
    }

    return responseData as T
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: "GET", path, params })
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: "POST", path, body })
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: "PUT", path, body })
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: "PATCH", path, body })
  }

  async delete<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: "DELETE", path, body })
  }

  /**
   * Get the OAuth token manager (if using OAuth)
   */
  getOAuthManager(): OAuthTokenManager | undefined {
    return this.oauthManager
  }

  /**
   * Check if the client is using OAuth authentication
   */
  isUsingOAuth(): boolean {
    return !!this.oauthManager
  }

  /**
   * Update OAuth configuration (useful for updating tokens)
   */
  updateOAuthConfig(updates: Partial<import("./types").OAuthConfig>): void {
    if (!this.oauthManager) {
      throw new Error("OAuth is not configured for this client")
    }
    this.oauthManager.updateConfig(updates)
  }
}
