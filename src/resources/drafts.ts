import type { FrontClient } from "../client"
import type {
  CreateDraftData,
  CreateDraftReplyData,
  DeleteDraftData,
  EditDraftData,
  ListResponse,
  Message,
  PaginationParams,
} from "../types"

export class Drafts {
  constructor(private client: FrontClient) {}

  /**
   * Create a new draft message in a channel (starts a new conversation)
   */
  async create(channelId: string, data: CreateDraftData): Promise<Message> {
    return this.client.post<Message>(`/channels/${channelId}/drafts`, data)
  }

  /**
   * Create a draft reply to the last message in a conversation
   */
  async createReply(
    conversationId: string,
    data: CreateDraftReplyData,
  ): Promise<Message> {
    return this.client.post<Message>(
      `/conversations/${conversationId}/drafts`,
      data,
    )
  }

  /**
   * List drafts for a conversation
   */
  async list(
    conversationId: string,
    params?: PaginationParams,
  ): Promise<ListResponse<Message>> {
    return this.client.get<ListResponse<Message>>(
      `/conversations/${conversationId}/drafts`,
      params,
    )
  }

  /**
   * Edit/update a draft message
   */
  async edit(messageId: string, data: EditDraftData): Promise<Message> {
    return this.client.patch<Message>(`/drafts/${messageId}/`, data)
  }

  /**
   * Delete a draft message
   */
  async delete(draftId: string, data: DeleteDraftData): Promise<void> {
    return this.client.delete<void>(`/drafts/${draftId}`, data)
  }
}
