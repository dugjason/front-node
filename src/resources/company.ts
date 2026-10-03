import type { FrontBase, NextPageParams } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { PaginationInfo, WithNormalizedPagination } from "../normalize-response";
import type { TagResponse } from "./tags";

export type RuleResponse = components["schemas"]["RuleResponse"];
export type StatusResponse = components["schemas"]["StatusResponse"];

type ListCompanyRulesResponse =
  operations["list-all-company-rules"]["responses"][200]["content"]["application/json"];

type ListCompanyTicketStatusesResponse =
  operations["list-company-ticket-statuses"]["responses"][200]["content"]["application/json"];

export type ListCompanyTagsParams = NonNullable<
  operations["list-company-tags"]["parameters"]["query"]
> &
  NextPageParams;
export type CreateCompanyTagParams =
  operations["create-company-tag"]["requestBody"]["content"]["application/json"];

type ListCompanyTagsResponse =
  operations["list-company-tags"]["responses"][200]["content"]["application/json"] & {
    pagination?: PaginationInfo;
  };

/**
 * Company-scoped rules, ticket statuses, and tags (`/company/rules`, `/company/statuses`, `/company/tags`).
 *
 * @see https://dev.frontapp.com/reference/introduction
 */
export class FrontCompany {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List company rules (`GET /company/rules`).
   *
   * **Required scope:** `rules:read`
   */
  async listRules(): Promise<WithNormalizedPagination<ListCompanyRulesResponse>> {
    return await this.base.requestOperation("list-all-company-rules");
  }

  /**
   * List ticket statuses (`GET /company/statuses`). Returns `404` when ticketing is not enabled (throws {@link FrontApiError}).
   *
   * **Required scope:** `statuses:read`
   */
  async listTicketStatuses(): Promise<WithNormalizedPagination<ListCompanyTicketStatusesResponse>> {
    return await this.base.requestOperation("list-company-ticket-statuses");
  }

  /**
   * Fetch one ticket status (`GET /company/statuses/{status_id}`).
   *
   * **Required scope:** `statuses:read`
   */
  async getTicketStatus(statusId: string): Promise<StatusResponse> {
    return await this.base.requestOperation("get-ticket-status-by-id", {
      path: { status_id: statusId },
    });
  }

  /**
   * List company tags (`GET /company/tags`). `nextPageUrl` overrides other list parameters.
   *
   * **Required scope:** `tags:read`
   */
  async listTags(
    query?: ListCompanyTagsParams,
  ): Promise<WithNormalizedPagination<ListCompanyTagsResponse>> {
    return await this.base.requestOperation("list-company-tags", {
      nextPageUrl: query?.nextPageUrl,
      query,
    });
  }

  /**
   * Create a company tag (`POST /company/tags`). Returns `201` with the new tag.
   *
   * **Required scope:** `tags:write`
   */
  async createTag(body: CreateCompanyTagParams): Promise<TagResponse> {
    return await this.base.requestOperation("create-company-tag", { body });
  }
}
