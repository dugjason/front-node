import type { FrontClient } from "../client"
import type {
  Account,
  AccountContactsParams,
  CreateAccountData,
  ListResponse,
  PaginationParams,
  UpdateAccountData,
} from "../types"

export class Accounts {
  constructor(private client: FrontClient) {}

  /**
   * List all accounts
   */
  async list(params?: PaginationParams): Promise<ListResponse<Account>> {
    return this.client.get<ListResponse<Account>>("/accounts", params)
  }

  /**
   * Create a new account
   */
  async create(data: CreateAccountData): Promise<Account> {
    return this.client.post<Account>("/accounts", data)
  }

  /**
   * Fetch a specific account by ID
   */
  async fetch(accountId: string): Promise<Account> {
    return this.client.get<Account>(`/accounts/${accountId}`)
  }

  /**
   * Update an account
   */
  async update(accountId: string, data: UpdateAccountData): Promise<Account> {
    return this.client.patch<Account>(`/accounts/${accountId}`, data)
  }

  /**
   * Delete an account
   */
  async delete(accountId: string): Promise<void> {
    return this.client.delete<void>(`/accounts/${accountId}`)
  }

  /**
   * List contacts associated with an account
   */
  async getContacts(accountId: string, params?: AccountContactsParams) {
    return this.client.get(`/accounts/${accountId}/contacts`, params)
  }

  /**
   * Add a contact to an account
   */
  async addContact(accountId: string, contactIds: string[]): Promise<void> {
    return this.client.post<void>(`/accounts/${accountId}/contacts`, {
      contact_ids: contactIds,
    })
  }

  /**
   * Remove a contact from an account
   */
  async removeContact(accountId: string, contactId: string): Promise<void> {
    return this.client.delete<void>(
      `/accounts/${accountId}/contacts/${contactId}`,
    )
  }
}
