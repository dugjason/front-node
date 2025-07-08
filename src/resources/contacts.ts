import type { FrontClient } from "../client"
import type {
  Contact,
  ContactHandle,
  ContactNote,
  ContactNotesParams,
  ContactsListParams,
  Conversation,
  CreateContactData,
  CreateContactHandleData,
  CreateContactNoteData,
  ListResponse,
  MergeContactsData,
  PaginationParams,
  UpdateContactData,
} from "../types"

export class Contacts {
  constructor(private client: FrontClient) {}

  /**
   * List all contacts
   */
  async list(params?: ContactsListParams): Promise<ListResponse<Contact>> {
    return this.client.get<ListResponse<Contact>>("/contacts", params)
  }

  /**
   * Create a new contact
   */
  async create(data: CreateContactData): Promise<Contact> {
    return this.client.post<Contact>("/contacts", data)
  }

  /**
   * Merge contacts
   */
  async merge(data: MergeContactsData): Promise<Contact> {
    return this.client.post<Contact>("/contacts/merge", data)
  }

  /**
   * Fetch a specific contact by ID
   */
  async fetch(contactId: string): Promise<Contact> {
    return this.client.get<Contact>(`/contacts/${contactId}`)
  }

  /**
   * Update a contact
   */
  async update(contactId: string, data: UpdateContactData): Promise<Contact> {
    return this.client.patch<Contact>(`/contacts/${contactId}`, data)
  }

  /**
   * Delete a contact
   */
  async delete(contactId: string): Promise<void> {
    return this.client.delete<void>(`/contacts/${contactId}`)
  }

  /**
   * List conversations for a contact
   */
  async getConversations(
    contactId: string,
    params?: PaginationParams,
  ): Promise<ListResponse<Conversation>> {
    return this.client.get<ListResponse<Conversation>>(
      `/contacts/${contactId}/conversations`,
      params,
    )
  }

  /**
   * Add a handle to a contact
   */
  async addHandle(
    contactId: string,
    data: CreateContactHandleData,
  ): Promise<ContactHandle> {
    return this.client.post<ContactHandle>(
      `/contacts/${contactId}/handles`,
      data,
    )
  }

  /**
   * Remove a handle from a contact
   */
  async removeHandle(contactId: string, handle: string): Promise<void> {
    return this.client.delete<void>(`/contacts/${contactId}/handles/${handle}`)
  }

  /**
   * List notes for a contact
   */
  async getNotes(
    contactId: string,
    params?: ContactNotesParams,
  ): Promise<ListResponse<ContactNote>> {
    return this.client.get<ListResponse<ContactNote>>(
      `/contacts/${contactId}/notes`,
      params,
    )
  }

  /**
   * Add a note to a contact
   */
  async addNote(
    contactId: string,
    data: CreateContactNoteData,
  ): Promise<ContactNote> {
    return this.client.post<ContactNote>(`/contacts/${contactId}/notes`, data)
  }

  /**
   * List contacts for a specific teammate
   */
  async listForTeammate(
    teammateId: string,
    params?: ContactsListParams,
  ): Promise<ListResponse<Contact>> {
    return this.client.get<ListResponse<Contact>>(
      `/teammates/${teammateId}/contacts`,
      params,
    )
  }

  /**
   * Create a contact for a specific teammate
   */
  async createForTeammate(
    teammateId: string,
    data: CreateContactData,
  ): Promise<Contact> {
    return this.client.post<Contact>(`/teammates/${teammateId}/contacts`, data)
  }

  /**
   * List contacts for a specific team
   */
  async listForTeam(
    teamId: string,
    params?: ContactsListParams,
  ): Promise<ListResponse<Contact>> {
    return this.client.get<ListResponse<Contact>>(
      `/teams/${teamId}/contacts`,
      params,
    )
  }

  /**
   * Create a contact for a specific team
   */
  async createForTeam(
    teamId: string,
    data: CreateContactData,
  ): Promise<Contact> {
    return this.client.post<Contact>(`/teams/${teamId}/contacts`, data)
  }
}
