import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";

export type TeammateResponse = components["schemas"]["TeammateResponse"];
export type UpdateTeammate = components["schemas"]["UpdateTeammate"];
export type CustomFieldParameter = components["schemas"]["CustomFieldParameter"];

type ListTeammatesResponse =
  operations["list-teammates"]["responses"][200]["content"]["application/json"];

type ListAssignedConversationsQuery = NonNullable<
  operations["list-assigned-conversations"]["parameters"]["query"]
>;
type ListAssignedConversationsResponse =
  operations["list-assigned-conversations"]["responses"][200]["content"]["application/json"];

const queryFromAssignedConversations = (
  q?: ListAssignedConversationsQuery,
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
  return out;
};

const mergeTeammateSnapshot = (
  current: TeammateResponse,
  patch: Partial<UpdateTeammate>,
): TeammateResponse => {
  const filtered = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<TeammateResponse>;
  return { ...current, ...filtered };
};

const teammateResponseToUpdateBody = (state: TeammateResponse): UpdateTeammate => ({
  custom_fields: state.custom_fields,
  first_name: state.first_name,
  is_available: state.is_available,
  last_name: state.last_name,
  username: state.username,
});

/**
 * One teammate (`/teammates/{teammate_id}`).
 *
 * Writable camelCase: `username`, `firstName`, `lastName`, `isAvailable`, `customFields`, `links`.
 * Read-only: `id`, `email`, `isAdmin`, `isBlocked`, `type`. Raw JSON: {@link FrontResource.data}.
 *
 * `PATCH` returns `204`; {@link update} and {@link save} merge the request into local state.
 *
 * @see https://dev.frontapp.com/reference/teammates
 */
export class FrontTeammate extends FrontResource<TeammateResponse, UpdateTeammate> {
  protected selfPath(): string {
    return FrontBase.expandPath("/teammates/{teammate_id}", {
      teammate_id: this.id,
    });
  }

  get email(): string {
    return this.pick("email");
  }

  get username(): string {
    return this.pick("username");
  }

  set username(value: string) {
    this.assign("username", value);
  }

  get firstName(): string {
    return this.pick("first_name");
  }

  set firstName(value: string) {
    this.assign("first_name", value);
  }

  get lastName(): string {
    return this.pick("last_name");
  }

  set lastName(value: string) {
    this.assign("last_name", value);
  }

  get isAdmin(): boolean {
    return this.pick("is_admin");
  }

  get isAvailable(): boolean {
    return this.pick("is_available");
  }

  set isAvailable(value: boolean) {
    this.assign("is_available", value);
  }

  get isBlocked(): boolean {
    return this.pick("is_blocked");
  }

  get type(): TeammateResponse["type"] {
    return this.pick("type");
  }

  get customFields(): TeammateResponse["custom_fields"] {
    return this.pick("custom_fields");
  }

  set customFields(value: TeammateResponse["custom_fields"]) {
    this.assign("custom_fields", value);
  }

  /**
   * Build the `PATCH` body implied by the current property values (username, names, availability, custom fields).
   * @see https://dev.frontapp.com/reference/update-teammate
   */
  toUpdateBody(): UpdateTeammate {
    return teammateResponseToUpdateBody(this.state);
  }

  /**
   * Update this teammate (`PATCH /teammates/{teammate_id}`). The API returns `204`; local state is merged from the body.
   *
   * **Required scope:** `teammates:write`
   *
   * @param body Fields to change (OpenAPI {@link UpdateTeammate}). Sending `custom_fields` replaces omitted keys — see API docs.
   * @see https://dev.frontapp.com/reference/update-teammate
   */
  async update(body: UpdateTeammate | Partial<UpdateTeammate>): Promise<void> {
    await this.patchNoContent(body, mergeTeammateSnapshot);
  }

  /**
   * List conversations assigned to this teammate (`GET /teammates/{teammate_id}/conversations`), most recently updated first.
   *
   * **Required scope:** `conversations:read`
   *
   * @param query Optional `q` ([query object](https://dev.frontapp.com/docs/query-object-q)), `limit`, and `page_token`.
   * @see https://dev.frontapp.com/reference/list-assigned-conversations
   */
  async listAssignedConversations(
    query?: ListAssignedConversationsQuery,
  ): Promise<WithNormalizedPagination<ListAssignedConversationsResponse>> {
    const path = FrontBase.expandPath("/teammates/{teammate_id}/conversations", {
      teammate_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListAssignedConversationsResponse>>(
      "GET",
      path,
      {
        query: queryFromAssignedConversations(query),
      },
    );
  }
}

/**
 * Company teammates (`GET /teammates`, `GET /teammates/{teammate_id}`).
 *
 * @see https://dev.frontapp.com/reference/teammates
 */
export class FrontTeammates {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List teammates in the company (`GET /teammates`).
   *
   * **Required scope:** `teammates:read`
   *
   * @see https://dev.frontapp.com/reference/list-teammates
   */
  async list(): Promise<WithNormalizedPagination<ListTeammatesResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListTeammatesResponse>>(
      "GET",
      "/teammates",
    );
  }

  /**
   * Fetch one teammate (`GET /teammates/{teammate_id}`).
   *
   * **Required scope:** `teammates:read`
   *
   * @param teammateId Teammate id or supported [resource alias](https://dev.frontapp.com/docs/resource-aliases-1).
   * @see https://dev.frontapp.com/reference/get-teammate
   */
  async get(teammateId: string): Promise<FrontTeammate> {
    const path = FrontBase.expandPath("/teammates/{teammate_id}", {
      teammate_id: teammateId,
    });
    const data = await this.base.requestJson<TeammateResponse>("GET", path);
    return new FrontTeammate(this.base, data);
  }
}
