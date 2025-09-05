import type { Client as GeneratedClient } from "../generated/client/types.gen"
import { client as generatedClient } from "../generated/client.gen"
import { OAuthTokenManager } from "../oauth"
import type { FrontConfig } from "../types"
import { FrontError, mapToFrontError } from "./errors"

const DEFAULT_MAX_RETRIES = 3

/**
 * Core HTTP client used by the SDK's handwritten resources.
 *
 * Responsibilities:
 * - Configure and expose the generated HTTP client
 * - Inject authentication (API key or OAuth) into every request
 * - Refresh OAuth tokens on 401 responses and retry once
 * - Normalize thrown errors into `FrontError` subclasses
 */
export class APIClient {
  private readonly gen: GeneratedClient
  private apiKey?: string
  private oauthManager?: OAuthTokenManager
  private readonly maxRetries: number

  /**
   * Create a new API client.
   *
   * @param config - Front configuration including API key or OAuth settings and optional overrides
   */
  constructor(config?: FrontConfig & { maxRetries?: number }) {
    this.gen = generatedClient
    this.maxRetries = config?.maxRetries ?? DEFAULT_MAX_RETRIES

    // Set Auth credentials
    if (config?.oauth) {
      this.oauthManager = new OAuthTokenManager(config.oauth)
    }
    if (config?.apiKey || process.env.FRONT_API_KEY) {
      this.apiKey = config?.apiKey ?? process.env.FRONT_API_KEY
    }
    if (!this.apiKey && !this.oauthManager) {
      throw new Error("API key or OAuth configuration is required")
    }

    this.gen.setConfig({
      baseUrl: config?.baseUrl ?? "https://api2.frontapp.com",
      throwOnError: true,
      responseStyle: "fields",
      // Use the generated client's `auth` hook to inject the token per request
      auth: async (auth) => {
        const token = await this.getAuthToken()
        if (!token) return undefined
        if (auth.scheme === "bearer") return token
        return token
      },
    })

    // Install a response interceptor to handle 401 with OAuth and retry logic
    this.gen.interceptors.response.use(async (response, request) => {
      if (response.status !== 401 || !this.oauthManager) return response

      // Attempt only a single refresh + retry to avoid loops
      const refreshed = await this.oauthManager.refreshToken()

      // Clone request with new Authorization token
      const headers = new Headers(request.headers)
      headers.set("Authorization", `Bearer ${refreshed}`)
      const retryReq = new Request(request, { headers })
      const cfg = this.gen.getConfig() as {
        fetch?: (r: Request) => Promise<Response>
      }
      const fetchImpl = cfg.fetch ?? globalThis.fetch
      return fetchImpl(retryReq)
    })

    // Normalize thrown errors
    this.gen.interceptors.error.use(async (err, response) => {
      throw mapToFrontError(err, response)
    })
  }

  /**
   * Access the configured generated client for low-level operations.
   */
  getGenClient(): GeneratedClient {
    return this.gen
  }

  /**
   * Resolve the current auth token used for requests.
   *
   * @throws FrontError when credentials are missing
   */
  private async getAuthToken(): Promise<string> {
    if (this.apiKey) return this.apiKey
    if (this.oauthManager) return this.oauthManager.getAccessToken()
    throw new FrontError("Missing credentials", 401, "auth_error")
  }
}
