interface FrontBaseConfig {
  baseUrl?: string
}

export interface FrontApiKeyConfig extends FrontBaseConfig {
  apiKey: string
  oauth?: OAuthConfig
}

export interface FrontOAuthConfig extends FrontBaseConfig {
  apiKey?: string
  oauth: OAuthConfig
}

export type FrontConfig = FrontApiKeyConfig | FrontOAuthConfig

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  accessToken: string
  refreshToken: string
  onTokenRefresh?: (tokens: OAuthTokens) => void | Promise<void>
}

export interface OAuthTokens {
  access_token: string
  refresh_token: string
}

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  url: string
  body?: unknown
  query?: Record<string, unknown>
}

export interface FrontError {
  message: string
  status?: number
  code?: string
}

export interface PaginationParams extends Record<string, unknown> {
  limit?: number
  page_token?: string
}

export interface ListResponse<T> {
  _results: T[]
  _pagination?: {
    next?: string
  }
}
