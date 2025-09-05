import {
  buildPageFromListResponse,
  makePagedResult,
  type PagePair,
} from "../core/paginator"
import { APIResource } from "../core/resource"
import {
  addContactToAccount,
  createAccount,
  deleteAnAccount,
  fetchAnAccount,
  listAccountContacts,
  listAccountCustomFields,
  listAccounts,
  removeContactFromAccount,
  updateAccount,
} from "../generated/sdk.gen"
import type {
  Account,
  AccountPatch,
  AccountResponse,
  CustomFieldResponse,
  FetchAnAccountResponse,
  ListAccountContactsData,
  ListAccountContactsResponse,
  ListAccountsData,
  ListAccountsResponse,
} from "../generated/types.gen"
import { FrontAccount } from "../resources/accounts"
import { FrontContact } from "../resources/contacts"

export class Accounts extends APIResource<FrontAccount, AccountResponse> {
  protected makeItem(raw: AccountResponse): FrontAccount {
    return new FrontAccount(raw)
  }

  /** CREATE **/

  async create(
    body: Account,
  ): Promise<{ account: FrontAccount; response: Response }> {
    const { item, response } = await this.createOne<AccountResponse>({
      createCall: () => createAccount({ body }),
    })
    return { account: item, response }
  }

  /** READ **/

  async list(
    query?: ListAccountsData["query"],
  ): Promise<PagePair<FrontAccount> & AsyncIterable<PagePair<FrontAccount>>> {
    return this.listPaginated<
      ListAccountsResponse,
      {
        query?: ListAccountsData["query"]
      }
    >({
      initialOptions: { query },
      listCall: (options) => listAccounts({ ...options }),
    })
  }

  async get(
    id: string,
  ): Promise<{ account: FrontAccount; response: Response }> {
    const { item, response } = await this.getOne<FetchAnAccountResponse>({
      getCall: () =>
        fetchAnAccount({
          path: { account_id: id },
        }),
    })
    return { account: item, response }
  }

  async listCustomFields(): Promise<{
    response: Response
    data: CustomFieldResponse[]
  }> {
    const { response, data } = await listAccountCustomFields()
    return { response, data: data?._results ?? [] }
  }

  async listContacts(
    accountId: string,
    query?: ListAccountContactsData["query"],
  ): Promise<PagePair<FrontContact> & AsyncIterable<PagePair<FrontContact>>> {
    const { response, data } = await listAccountContacts({
      path: { account_id: accountId },
      query,
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontContact,
      ListAccountContactsResponse
    >({
      data,
      mapItems: (d) => (d._results ?? []).map((raw) => new FrontContact(raw)),
      fetchNext: async (pageToken) => {
        const next = await listAccountContacts({
          path: { account_id: accountId },
          query: { ...(query ?? {}), page_token: pageToken },
        })
        return {
          response: next.response,
          data: next.data,
        }
      },
    })

    return makePagedResult({ response, page })
  }

  /** UPDATE **/

  async update(
    id: string,
    body: AccountPatch,
  ): Promise<{ account: FrontAccount; response: Response }> {
    const { response } = await updateAccount({
      path: { account_id: id },
      body,
    })
    const refreshed = await this.get(id)
    return { account: refreshed.account, response }
  }

  async addContacts(accountId: string, contactIds: string[]): Promise<void> {
    addContactToAccount({
      path: { account_id: accountId },
      body: { contact_ids: contactIds },
    })
  }

  async removeContacts(accountId: string, contactIds: string[]): Promise<void> {
    removeContactFromAccount({
      path: { account_id: accountId },
      body: { contact_ids: contactIds },
    })
  }

  /** DELETE **/

  async delete(id: string): Promise<void> {
    deleteAnAccount({ path: { account_id: id } })
  }
}
