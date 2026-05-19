import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import type { CreateTag } from "./tags";
import { FrontTag } from "./tags";

export type RuleResponse = components["schemas"]["RuleResponse"];
export type StatusResponse = components["schemas"]["StatusResponse"];

type ListCompanyRulesResponse =
  operations["list-all-company-rules"]["responses"][200]["content"]["application/json"];

type ListCompanyTicketStatusesResponse =
  operations["list-company-ticket-statuses"]["responses"][200]["content"]["application/json"];

type ListCompanyTagsQuery = NonNullable<operations["list-company-tags"]["parameters"]["query"]>;

type ListCompanyTagsResponse =
  operations["list-company-tags"]["responses"][200]["content"]["application/json"];

const queryFromListCompanyTags = (
  q?: ListCompanyTagsQuery,
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
    return await this.base.requestJson<WithNormalizedPagination<ListCompanyRulesResponse>>(
      "GET",
      "/company/rules",
    );
  }

  /**
   * List ticket statuses (`GET /company/statuses`). Returns `404` when ticketing is not enabled (throws {@link FrontApiError}).
   *
   * **Required scope:** `statuses:read`
   */
  async listTicketStatuses(): Promise<WithNormalizedPagination<ListCompanyTicketStatusesResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListCompanyTicketStatusesResponse>>(
      "GET",
      "/company/statuses",
    );
  }

  /**
   * Fetch one ticket status (`GET /company/statuses/{status_id}`).
   *
   * **Required scope:** `statuses:read`
   */
  async getTicketStatus(statusId: string): Promise<StatusResponse> {
    const path = FrontBase.expandPath("/company/statuses/{status_id}", {
      status_id: statusId,
    });
    return await this.base.requestJson<StatusResponse>("GET", path);
  }

  /**
   * List company tags (`GET /company/tags`).
   *
   * **Required scope:** `tags:read`
   */
  async listTags(
    query?: ListCompanyTagsQuery,
  ): Promise<WithNormalizedPagination<ListCompanyTagsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListCompanyTagsResponse>>(
      "GET",
      "/company/tags",
      { query: queryFromListCompanyTags(query) },
    );
  }

  /**
   * Create a company tag (`POST /company/tags`). Returns `201` with the new tag.
   *
   * **Required scope:** `tags:write`
   */
  async createTag(body: CreateTag): Promise<FrontTag> {
    const data = await this.base.requestJson<components["schemas"]["TagResponse"]>(
      "POST",
      "/company/tags",
      { body },
    );
    return new FrontTag(this.base, data);
  }
}
