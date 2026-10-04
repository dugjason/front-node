import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type AccountResponse = components["schemas"]["AccountResponse"];
export type CustomFieldResponse = components["schemas"]["CustomFieldResponse"];

export type ListAccountsParams = OperationListParams<"list-accounts">;
export type CreateAccountParams = NonNullable<OperationParams<"create-account">["body"]>;
export type UpdateAccountParams = NonNullable<OperationParams<"update-account">["body"]>;
export type ListAccountContactsParams = OperationListParams<"list-account-contacts">;
export type AddAccountContactsParams = NonNullable<
  OperationParams<"add-contact-to-account">["body"]
>;
export type RemoveAccountContactsParams = NonNullable<
  OperationParams<"remove-contact-from-account">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontAccounts {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /accounts
   * Required scope: `accounts:read`
   * @see https://dev.frontapp.com/reference/list-accounts
   */
  async list(params?: ListAccountsParams): Promise<OperationResponse<"list-accounts">> {
    return await this.base.requestOperation("list-accounts", {
      nextPageUrl: params?.nextPageUrl,
      query: params,
    });
  }

  /** POST /accounts
   * Required scope: `accounts:write`
   * @see https://dev.frontapp.com/reference/create-account
   */
  async create(body: CreateAccountParams): Promise<OperationResponse<"create-account">> {
    return await this.base.requestOperation("create-account", { body });
  }

  /** GET /accounts/{account_id}
   * Required scope: `accounts:read`
   * @see https://dev.frontapp.com/reference/fetch-an-account
   */
  async get(accountId: string): Promise<OperationResponse<"fetch-an-account">> {
    return await this.base.requestOperation("fetch-an-account", {
      path: { account_id: accountId },
    });
  }

  /** PATCH /accounts/{account_id}
   * Required scope: `accounts:write`
   * @see https://dev.frontapp.com/reference/update-account
   */
  async update(
    accountId: string,
    body: UpdateAccountParams,
  ): Promise<OperationResponse<"update-account">> {
    return await this.base.requestOperation("update-account", {
      body,
      path: { account_id: accountId },
    });
  }

  /** DELETE /accounts/{account_id}
   * Required scope: `accounts:delete`
   * @see https://dev.frontapp.com/reference/delete-an-account
   */
  async delete(accountId: string): Promise<OperationResponse<"delete-an-account">> {
    return await this.base.requestOperation("delete-an-account", {
      path: { account_id: accountId },
    });
  }

  /** GET /accounts/{account_id}/contacts
   * Required scope: `contacts:read`
   * @see https://dev.frontapp.com/reference/list-account-contacts
   */
  async listContacts(
    accountId: string,
    params?: ListAccountContactsParams,
  ): Promise<OperationResponse<"list-account-contacts">> {
    return await this.base.requestOperation("list-account-contacts", {
      nextPageUrl: params?.nextPageUrl,
      path: { account_id: accountId },
      query: params,
    });
  }

  /** POST /accounts/{account_id}/contacts
   * Required scope: `accounts:write`
   * @see https://dev.frontapp.com/reference/add-contact-to-account
   */
  async addContacts(
    accountId: string,
    body: AddAccountContactsParams,
  ): Promise<OperationResponse<"add-contact-to-account">> {
    return await this.base.requestOperation("add-contact-to-account", {
      body,
      path: { account_id: accountId },
    });
  }

  /** DELETE /accounts/{account_id}/contacts
   * Required scope: `accounts:write`
   * @see https://dev.frontapp.com/reference/remove-contact-from-account
   */
  async removeContacts(
    accountId: string,
    body?: RemoveAccountContactsParams,
  ): Promise<OperationResponse<"remove-contact-from-account">> {
    return await this.base.requestOperation("remove-contact-from-account", {
      body,
      path: { account_id: accountId },
    });
  }

  /** GET /accounts/custom_fields
   * Required scope: `custom_fields:read`
   * @see https://dev.frontapp.com/reference/list-account-custom-fields
   */
  async listCustomFields(): Promise<OperationResponse<"list-account-custom-fields">> {
    return await this.base.requestOperation("list-account-custom-fields");
  }
}
