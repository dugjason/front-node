import type { FrontClient } from "../client"
import type {
  ListResponse,
  PaginationParams,
  Teammate,
  UpdateTeammateData,
} from "../types"

export class Teammates {
  constructor(private client: FrontClient) {}

  /**
   * List all teammates
   */
  async list(params?: PaginationParams): Promise<ListResponse<Teammate>> {
    return this.client.get<ListResponse<Teammate>>("/teammates", params)
  }

  /**
   * Fetch a specific teammate by ID
   */
  async fetch(teammateId: string): Promise<Teammate> {
    return this.client.get<Teammate>(`/teammates/${teammateId}`)
  }

  /**
   * Update a teammate
   */
  async update(
    teammateId: string,
    data: UpdateTeammateData,
  ): Promise<Teammate> {
    return this.client.patch<Teammate>(`/teammates/${teammateId}`, data)
  }

  /**
   * Get teammate's inboxes
   */
  async getInboxes(teammateId: string, params?: PaginationParams) {
    return this.client.get(`/teammates/${teammateId}/inboxes`, params)
  }

  /**
   * Get teammate's conversations
   */
  async getConversations(
    teammateId: string,
    params?: PaginationParams & { q?: string },
  ) {
    return this.client.get(`/teammates/${teammateId}/conversations`, params)
  }
}
