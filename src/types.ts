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

// Token Identity types
export interface TokenIdentity {
  _links: {
    self: string
  }
  name: string
  id: string
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
  tags: Tag[]
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

// Draft related types
export interface Message {
  _links: {
    self: string
    related: {
      conversation: string
      message_replied_to?: string
      message_seen?: string
    }
  }
  id: string
  message_uid?: string
  type:
    | "call"
    | "custom"
    | "email"
    | "facebook"
    | "front_chat"
    | "googleplay"
    | "intercom"
    | "internal"
    | "phone-call"
    | "sms"
    | "tweet"
    | "tweet_dm"
    | "whatsapp"
    | "yalo_wha"
  is_inbound: boolean
  draft_mode?: "shared" | "private" | null
  error_type?: string | null
  version?: string
  created_at: number
  subject?: string
  blurb?: string
  author?: Teammate
  recipients: Array<{
    _links: {
      related: {
        contact: string
      }
    }
    handle: string
    role: string
  }>
  body: string
  text?: string
  attachments?: Array<{
    filename: string
    url: string
    content_type: string
    size: number
    metadata: {
      is_inline: boolean
      cid?: string
    }
  }>
  signature?: {
    id: string
    name: string
    sender_info?: string
    body: string
  }
  metadata?: Record<string, unknown>
}

// Draft is just a Message with is_draft: true and specific draft properties
export interface Draft extends Message {
  draft_mode: "shared" | "private"
  version: string
}

export interface CreateDraftData {
  author_id?: string
  to?: string[]
  cc?: string[]
  bcc?: string[]
  subject?: string
  body: string
  quote_body?: string
  attachments?: Array<{
    filename: string
    content_type: string
    data: string
  }>
  mode?: "private" | "shared"
  signature_id?: string
  should_add_default_signature?: boolean
}

export interface CreateDraftReplyData extends CreateDraftData {
  channel_id: string
}

export interface EditDraftData extends CreateDraftReplyData {
  version?: string
  mode?: "shared"
}

export interface DeleteDraftData {
  version: string
}

// Tag related types
export interface Tag {
  _links: {
    self: string
    related: {
      conversations: string
      owner: string
      parent_tag?: string
      children: string
    }
  }
  id: string
  name: string
  description?: string
  highlight?:
    | "grey"
    | "pink"
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "light-blue"
    | "blue"
    | "purple"
    | null
  is_private: boolean
  is_visible_in_conversation_lists: boolean
  created_at: number
  updated_at: number
}

export interface CreateTagData {
  name: string
  description?: string
  highlight?:
    | "grey"
    | "pink"
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "light-blue"
    | "blue"
    | "purple"
  is_visible_in_conversation_lists?: boolean
}

export interface UpdateTagData {
  name?: string
  description?: string
  highlight?:
    | "grey"
    | "pink"
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "light-blue"
    | "blue"
    | "purple"
  parent_tag_id?: string | null
  is_visible_in_conversation_lists?: boolean
}

export interface TagsListParams extends PaginationParams {
  sort_by?: "id"
  sort_order?: "asc" | "desc"
}
