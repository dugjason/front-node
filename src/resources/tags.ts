import type { FrontClient } from "../client"
import type {
  Conversation,
  CreateTagData,
  ListResponse,
  PaginationParams,
  Tag,
  TagsListParams,
  UpdateTagData,
} from "../types"

export class Tags {
  constructor(private client: FrontClient) {}

  /**
   * List all tags (company, team, and teammate tags that the API token has access to)
   */
  async list(params?: TagsListParams): Promise<ListResponse<Tag>> {
    return this.client.get<ListResponse<Tag>>("/tags", params)
  }

  /**
   * Create a new tag
   */
  async create(data: CreateTagData): Promise<Tag> {
    return this.client.post<Tag>("/tags", data)
  }

  /**
   * Fetch a specific tag by ID
   */
  async fetch(tagId: string): Promise<Tag> {
    return this.client.get<Tag>(`/tags/${tagId}`)
  }

  /**
   * Update a tag
   */
  async update(tagId: string, data: UpdateTagData): Promise<void> {
    return this.client.patch<void>(`/tags/${tagId}`, data)
  }

  /**
   * Delete a tag
   */
  async delete(tagId: string): Promise<void> {
    return this.client.delete<void>(`/tags/${tagId}`)
  }

  /**
   * List the children of a specific tag
   */
  async getChildren(
    tagId: string,
    params?: TagsListParams,
  ): Promise<ListResponse<Tag>> {
    return this.client.get<ListResponse<Tag>>(`/tags/${tagId}/children`, params)
  }

  /**
   * Create a child tag
   */
  async createChild(tagId: string, data: CreateTagData): Promise<Tag> {
    return this.client.post<Tag>(`/tags/${tagId}/children`, data)
  }

  /**
   * List conversations tagged with a specific tag
   */
  async getConversations(
    tagId: string,
    params?: PaginationParams,
  ): Promise<ListResponse<Conversation>> {
    return this.client.get<ListResponse<Conversation>>(
      `/tags/${tagId}/conversations`,
      params,
    )
  }

  /**
   * List company tags
   */
  async listCompany(params?: TagsListParams): Promise<ListResponse<Tag>> {
    return this.client.get<ListResponse<Tag>>("/company/tags", params)
  }

  /**
   * Create a company tag
   */
  async createCompany(data: CreateTagData): Promise<Tag> {
    return this.client.post<Tag>("/company/tags", data)
  }

  /**
   * List tags for a specific teammate
   */
  async listForTeammate(
    teammateId: string,
    params?: TagsListParams,
  ): Promise<ListResponse<Tag>> {
    return this.client.get<ListResponse<Tag>>(
      `/teammates/${teammateId}/tags`,
      params,
    )
  }

  /**
   * Create a tag for a specific teammate
   */
  async createForTeammate(
    teammateId: string,
    data: CreateTagData,
  ): Promise<Tag> {
    return this.client.post<Tag>(`/teammates/${teammateId}/tags`, data)
  }

  /**
   * List tags for a specific team
   */
  async listForTeam(
    teamId: string,
    params?: TagsListParams,
  ): Promise<ListResponse<Tag>> {
    return this.client.get<ListResponse<Tag>>(`/teams/${teamId}/tags`, params)
  }

  /**
   * Create a tag for a specific team
   */
  async createForTeam(teamId: string, data: CreateTagData): Promise<Tag> {
    return this.client.post<Tag>(`/teams/${teamId}/tags`, data)
  }
}
