import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";

export type AccountResponse = components["schemas"]["AccountResponse"];
export type AccountPatch = components["schemas"]["AccountPatch"];
export type Account = components["schemas"]["Account"];
export type ContactIds = components["schemas"]["ContactIds"];
export type CustomFieldResponse = components["schemas"]["CustomFieldResponse"];

type ListAccountsQuery = NonNullable<operations["list-accounts"]["parameters"]["query"]>;
type ListAccountsResponse =
  operations["list-accounts"]["responses"][200]["content"]["application/json"];

type ListAccountCustomFieldsResponse =
  operations["list-account-custom-fields"]["responses"][200]["content"]["application/json"];

type ListAccountContactsQuery = NonNullable<
  operations["list-account-contacts"]["parameters"]["query"]
>;
type ListAccountContactsResponse =
  operations["list-account-contacts"]["responses"][200]["content"]["application/json"];

const queryFromListAccounts = (
  q?: ListAccountsQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.limit !== undefined) {
    out.limit = String(q.limit);
  }
  if (q.page_token !== undefined) {
    out.page_token = String(q.page_token);
  }
  if (q.sort_by !== undefined) {
    out.sort_by = String(q.sort_by);
  }
  if (q.sort_order !== undefined) {
    out.sort_order = String(q.sort_order);
  }
  return out;
};

const queryFromListAccountContacts = (
  q?: ListAccountContactsQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.limit !== undefined) {
    out.limit = String(q.limit);
  }
  if (q.page_token !== undefined) {
    out.page_token = String(q.page_token);
  }
  if (q.sort_by !== undefined) {
    out.sort_by = String(q.sort_by);
  }
  if (q.sort_order !== undefined) {
    out.sort_order = String(q.sort_order);
  }
  return out;
};

const accountResponseToUpdateBody = (state: AccountResponse): AccountPatch => ({
  custom_fields: state.custom_fields,
  description: state.description ?? undefined,
  domains: state.domains,
  name: state.name,
});

/**
 * One account (`/accounts/{account_id}` and related contact routes).
 *
 * Writable: `name`, `description`, `domains`, `customFields`. Read-only: `id`, `logoUrl`, `externalId`, `createdAt`, `updatedAt`, `links`.
 * `PATCH` returns the updated account JSON; {@link update} and {@link save} replace local state from the response.
 *
 * @see https://dev.frontapp.com/reference/accounts
 */
export class FrontAccount extends FrontResource<AccountResponse, AccountPatch> {
  protected selfPath(): string {
    return FrontBase.expandPath("/accounts/{account_id}", {
      account_id: this.id,
    });
  }

  get name(): string {
    return this.pick("name");
  }

  set name(value: string) {
    this.assign("name", value);
  }

  get description(): string | null {
    return this.pick("description");
  }

  set description(value: string | null) {
    this.assign("description", value);
  }

  get domains(): string[] {
    return this.pick("domains");
  }

  set domains(value: string[]) {
    this.assign("domains", value);
  }

  get customFields(): AccountResponse["custom_fields"] {
    return this.pick("custom_fields");
  }

  set customFields(value: AccountResponse["custom_fields"]) {
    this.assign("custom_fields", value);
  }

  get logoUrl(): string | null {
    return this.pick("logo_url");
  }

  get externalId(): string | null {
    return this.pick("external_id");
  }

  get createdAt(): number | undefined {
    return this.pick("created_at");
  }

  get updatedAt(): number | undefined {
    return this.pick("updated_at");
  }

  /**
   * Build the `PATCH` body implied by the current property values.
   * @see https://dev.frontapp.com/reference/update-account
   */
  toUpdateBody(): AccountPatch {
    return accountResponseToUpdateBody(this.state);
  }

  /**
   * Update this account (`PATCH /accounts/{account_id}`). The API returns `200` with the updated resource.
   *
   * **Required scope:** `accounts:write`
   *
   * @param body Fields to change (OpenAPI {@link AccountPatch}). Omitting `custom_fields` leaves them unchanged; including it replaces the full set — see API docs.
   * @see https://dev.frontapp.com/reference/update-account
   */
  async update(body: AccountPatch | Partial<AccountPatch>): Promise<void> {
    await this.patchReplaceFromResponse(body);
  }

  /**
   * List contacts linked to this account (`GET /accounts/{account_id}/contacts`).
   *
   * **Required scope:** `contacts:read`
   *
   * @param query Optional pagination and sort (`sort_by`: `created_at` or `updated_at`).
   * @see https://dev.frontapp.com/reference/list-account-contacts
   */
  async listContacts(
    query?: ListAccountContactsQuery,
  ): Promise<WithNormalizedPagination<ListAccountContactsResponse>> {
    const path = FrontBase.expandPath("/accounts/{account_id}/contacts", {
      account_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListAccountContactsResponse>>(
      "GET",
      path,
      { query: queryFromListAccountContacts(query) },
    );
  }

  /**
   * Add contacts to this account (`POST /accounts/{account_id}/contacts`). The API returns `204`.
   *
   * **Required scope:** `accounts:write`
   *
   * @param body Contact ids or resource aliases (OpenAPI {@link ContactIds}).
   * @see https://dev.frontapp.com/reference/add-contact-to-account
   */
  async addContacts(body: ContactIds): Promise<void> {
    const path = FrontBase.expandPath("/accounts/{account_id}/contacts", {
      account_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * Remove contacts from this account (`DELETE /accounts/{account_id}/contacts`). The API returns `204`.
   *
   * **Required scope:** `accounts:write`
   *
   * @param body Contact ids or resource aliases (OpenAPI {@link ContactIds}).
   * @see https://dev.frontapp.com/reference/remove-contact-from-account
   */
  async removeContacts(body: ContactIds): Promise<void> {
    const path = FrontBase.expandPath("/accounts/{account_id}/contacts", {
      account_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }
}

/**
 * Company accounts (`GET/POST /accounts`, `GET/PATCH/DELETE /accounts/{account_id}`) and account custom-field definitions.
 *
 * @see https://dev.frontapp.com/reference/accounts
 */
export class FrontAccounts {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List accounts for the company (`GET /accounts`).
   *
   * **Required scope:** `accounts:read`
   *
   * @param query Optional pagination and sort (`sort_by`: `created_at` or `updated_at`).
   * @see https://dev.frontapp.com/reference/list-accounts
   */
  async list(query?: ListAccountsQuery): Promise<WithNormalizedPagination<ListAccountsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListAccountsResponse>>(
      "GET",
      "/accounts",
      {
        query: queryFromListAccounts(query),
      },
    );
  }

  /**
   * Create an account (`POST /accounts`). The API returns `201` with the new account body.
   *
   * **Required scope:** `accounts:write`
   *
   * @param body Account fields (OpenAPI {@link Account}).
   * @see https://dev.frontapp.com/reference/create-account
   */
  async create(body: Account): Promise<FrontAccount> {
    const data = await this.base.requestJson<AccountResponse>("POST", "/accounts", {
      body,
    });
    return new FrontAccount(this.base, data);
  }

  /**
   * Fetch one account (`GET /accounts/{account_id}`).
   *
   * **Required scope:** `accounts:read`
   *
   * @param accountId Account id or supported [resource alias](https://dev.frontapp.com/docs/resource-aliases-1) (domain, external id).
   * @see https://dev.frontapp.com/reference/fetch-an-account
   */
  async get(accountId: string): Promise<FrontAccount> {
    const path = FrontBase.expandPath("/accounts/{account_id}", {
      account_id: accountId,
    });
    const data = await this.base.requestJson<AccountResponse>("GET", path);
    return new FrontAccount(this.base, data);
  }

  /**
   * List custom fields that can be attached to accounts (`GET /accounts/custom_fields`).
   *
   * **Required scope:** `custom_fields:read`
   *
   * @see https://dev.frontapp.com/reference/list-account-custom-fields
   */
  async listCustomFields(): Promise<WithNormalizedPagination<ListAccountCustomFieldsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListAccountCustomFieldsResponse>>(
      "GET",
      "/accounts/custom_fields",
    );
  }
}
