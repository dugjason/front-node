import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";

export type LinkResponse = components["schemas"]["LinkResponse"];
export type CreateLink = components["schemas"]["CreateLink"];
export type UpdateLink = components["schemas"]["UpdateLink"];

type ListLinksQuery = NonNullable<operations["list-links"]["parameters"]["query"]>;
type ListLinksResponse = operations["list-links"]["responses"][200]["content"]["application/json"];

type ListLinkCustomFieldsResponse =
  operations["list-link-custom-fields"]["responses"][200]["content"]["application/json"];

type ListLinkConversationsQuery = NonNullable<
  operations["list-link-conversations"]["parameters"]["query"]
>;
type ListLinkConversationsResponse =
  operations["list-link-conversations"]["responses"][200]["content"]["application/json"];

const queryFromListLinks = (q?: ListLinksQuery): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.q !== undefined) {
    out.q = String(q.q);
  }
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

const queryFromListLinkConversations = (
  q?: ListLinkConversationsQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.q !== undefined) {
    out.q = String(q.q);
  }
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

const mergeLinkSnapshot = (current: LinkResponse, patch: Partial<UpdateLink>): LinkResponse => {
  const filtered = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<LinkResponse>;
  return { ...current, ...filtered };
};

const linkResponseToUpdateBody = (state: LinkResponse): UpdateLink => ({
  name: state.name,
});

/**
 * One link (`/links/{link_id}` and related routes).
 *
 * **Required scopes:** `links:read` (read), `links:write` (update).
 *
 * @see https://dev.frontapp.com/reference/links
 */
export class FrontLink extends FrontResource<LinkResponse, UpdateLink> {
  protected selfPath(): string {
    return FrontBase.expandPath("/links/{link_id}", { link_id: this.id });
  }

  get name(): string {
    return this.pick("name");
  }

  set name(value: string) {
    this.assign("name", value);
  }

  get type(): string {
    return this.pick("type");
  }

  get externalUrl(): string {
    return this.pick("external_url");
  }

  get customFields(): LinkResponse["custom_fields"] {
    return this.pick("custom_fields");
  }

  /**
   * The Front API does not expose `DELETE /links/{link_id}` on this path.
   */
  override delete(): Promise<void> {
    return Promise.reject(
      new Error(`Deleting link ${this.id} is not supported by the Front REST API for this path.`),
    );
  }

  toUpdateBody(): UpdateLink {
    return linkResponseToUpdateBody(this.state);
  }

  /**
   * `PATCH /links/{link_id}`. Returns `204`; local state is merged from the body.
   *
   * **Required scope:** `links:write`
   */
  async update(body: UpdateLink | Partial<UpdateLink>): Promise<void> {
    await this.patchNoContent(body, mergeLinkSnapshot);
  }

  /**
   * `GET /links/{link_id}/conversations`.
   *
   * **Required scope:** `conversations:read`
   */
  async listConversations(
    query?: ListLinkConversationsQuery,
  ): Promise<WithNormalizedPagination<ListLinkConversationsResponse>> {
    const path = FrontBase.expandPath("/links/{link_id}/conversations", {
      link_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListLinkConversationsResponse>>(
      "GET",
      path,
      { query: queryFromListLinkConversations(query) },
    );
  }
}

/**
 * Links (`/links`, `/links/custom_fields`, `/links/{link_id}`).
 *
 * @see https://dev.frontapp.com/reference/links
 */
export class FrontLinks {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * `GET /links`.
   *
   * **Required scope:** `links:read`
   */
  async list(query?: ListLinksQuery): Promise<WithNormalizedPagination<ListLinksResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListLinksResponse>>(
      "GET",
      "/links",
      { query: queryFromListLinks(query) },
    );
  }

  /**
   * `POST /links`.
   *
   * **Required scope:** `links:write`
   */
  async create(body: CreateLink): Promise<FrontLink> {
    const data = await this.base.requestJson<LinkResponse>("POST", "/links", {
      body,
    });
    return new FrontLink(this.base, data);
  }

  /**
   * `GET /links/custom_fields`.
   *
   * **Required scope:** `custom_fields:read`
   */
  async listCustomFields(): Promise<WithNormalizedPagination<ListLinkCustomFieldsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListLinkCustomFieldsResponse>>(
      "GET",
      "/links/custom_fields",
    );
  }

  /**
   * `GET /links/{link_id}`.
   *
   * **Required scope:** `links:read`
   */
  async get(linkId: string): Promise<FrontLink> {
    const path = FrontBase.expandPath("/links/{link_id}", { link_id: linkId });
    const data = await this.base.requestJson<LinkResponse>("GET", path);
    return new FrontLink(this.base, data);
  }
}
