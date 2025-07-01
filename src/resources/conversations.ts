import type { FrontClient } from "../client"
import type { Conversation, ListResponse, PaginationParams } from "../types"

export class Conversations {
  constructor(private client: FrontClient) {}

  /**
   * List conversations
   */
  async list(
    params?: PaginationParams & { q?: string },
  ): Promise<ListResponse<Conversation>> {
    return this.client.get<ListResponse<Conversation>>("/conversations", params)
  }

  /**
   * Fetch a specific conversation by ID
   */
  async fetch(conversationId: string): Promise<Conversation> {
    return this.client.get<Conversation>(`/conversations/${conversationId}`)
  }

  /**
   * Update a conversation
   */
  async update(
    conversationId: string,
    data: Partial<Pick<Conversation, "assignee" | "status" | "tags">>,
  ): Promise<Conversation> {
    return this.client.patch<Conversation>(
      `/conversations/${conversationId}`,
      data,
    )
  }

  /**
   * Get conversation messages
   */
  async getMessages(conversationId: string, params?: PaginationParams) {
    return this.client.get(`/conversations/${conversationId}/messages`, params)
  }

  /**
   * Get conversation events
   */
  async getEvents(conversationId: string, params?: PaginationParams) {
    return this.client.get(`/conversations/${conversationId}/events`, params)
  }

  /**
   * Get conversation comments
   */
  async getComments(conversationId: string, params?: PaginationParams) {
    return this.client.get(`/conversations/${conversationId}/comments`, params)
  }

  /**
   * Get conversation followers
   */
  async getFollowers(conversationId: string) {
    return this.client.get(`/conversations/${conversationId}/followers`)
  }

  /**
   * Get conversation inboxes
   */
  async getInboxes(conversationId: string) {
    return this.client.get(`/conversations/${conversationId}/inboxes`)
  }
}
