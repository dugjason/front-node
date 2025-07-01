export type FrontConfig =
  | {
      apiKey: string
      baseUrl?: string
      oauth?: never
    }
  | {
      apiKey?: never
      baseUrl?: string
      oauth: OAuthConfig
    }

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
  path: string
  body?: unknown
  params?: Record<string, unknown>
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

// Teammate related types
export interface Teammate {
  _links: {
    self: string
    related: {
      inboxes: string
      conversations: string
    }
  }
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  is_admin: boolean
  is_available: boolean
  is_blocked: boolean
  custom_fields?: Record<string, unknown>
}

export interface UpdateTeammateData {
  first_name?: string
  last_name?: string
  is_available?: boolean
  custom_fields?: Record<string, unknown>
}

// Conversation related types
export interface Conversation {
  _links: {
    self: string
    related: {
      events: string
      followers: string
      messages: string
      comments: string
      inboxes: string
      last_message: string
    }
  }
  id: string
  subject: string
  status: string
  status_id: string
  status_category: string
  ticket_ids?: string[]
  assignee?: Teammate
  recipient: {
    _links: {
      related: {
        contact: string
      }
    }
    handle: string
    role: string
  }
  tags: Array<{
    _links: {
      self: string
      related: {
        conversations: string
        owner: string
        children: string
      }
    }
    id: string
    name: string
    highlight: string
    is_private: boolean
    created_at: number
    updated_at: number
  }>
  created_at: number
  is_private: boolean
}

// Account related types
export interface Account {
  _links: {
    self: string
    related: {
      contacts: string
      conversations: string
      owner: string
    }
  }
  id: string
  name: string
  description?: string
  domains: string[]
  external_id?: string
  custom_fields?: Record<string, unknown>
  created_at: number
  updated_at: number
}

export interface CreateAccountData {
  name: string
  description?: string
  domains?: string[]
  external_id?: string
  custom_fields?: Record<string, unknown>
}

export interface UpdateAccountData {
  name?: string
  description?: string
  domains?: string[]
  custom_fields?: Record<string, unknown>
}

export interface AccountContactsParams extends PaginationParams {
  q?: string
}
