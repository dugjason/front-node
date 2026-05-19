import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";
import { FrontTeammate } from "./teammates";

export type TeammateGroupResponse = components["schemas"]["TeammateGroupResponse"];
export type CreateTeammateGroup = components["schemas"]["CreateTeammateGroup"];
export type UpdateTeammateGroup = components["schemas"]["UpdateTeammateGroup"];

type ListTeammateGroupsResponse =
  operations["list-company-teammate-groups"]["responses"][200]["content"]["application/json"];

type ListTeammateGroupInboxesResponse =
  operations["list-company-teammate-group-team-inboxes"]["responses"][200]["content"]["application/json"];

type ListTeammateGroupTeammatesResponse =
  operations["list-company-teammate-group-teammates"]["responses"][200]["content"]["application/json"];

type ListTeammateGroupTeamsResponse =
  operations["list-company-teammate-group-teams"]["responses"][200]["content"]["application/json"];

const mergeTeammateGroupSnapshot = (
  current: TeammateGroupResponse,
  patch: Partial<UpdateTeammateGroup>,
): TeammateGroupResponse => {
  const { permissions: patchPermissions, ...restPatch } = patch;
  const filteredRest = Object.fromEntries(
    Object.entries(restPatch).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<UpdateTeammateGroup, "permissions">>;
  let next: TeammateGroupResponse = { ...current, ...filteredRest };
  if (patchPermissions !== undefined) {
    const patchContacts = patchPermissions.contacts;
    const currentContacts = current.permissions.contacts;
    next = {
      ...next,
      permissions: {
        ...current.permissions,
        ...patchPermissions,
        contacts:
          patchContacts === undefined
            ? currentContacts
            : {
                ...currentContacts,
                ...patchContacts,
              },
      },
    };
  }
  return next;
};

const permissionsToUpdateBody = (
  permissions: TeammateGroupResponse["permissions"],
): UpdateTeammateGroup["permissions"] | undefined => {
  const c = permissions.contacts;
  if (c === undefined) {
    return;
  }
  const { access } = c;
  if (access === undefined) {
    return;
  }
  const contacts: NonNullable<UpdateTeammateGroup["permissions"]>["contacts"] = { access };
  if (c.contact_list_ids !== undefined) {
    contacts.contact_list_ids = c.contact_list_ids;
  }
  return { contacts };
};

const teammateGroupResponseToUpdateBody = (state: TeammateGroupResponse): UpdateTeammateGroup => {
  const body: UpdateTeammateGroup = { name: state.name };
  if (state.description !== null) {
    body.description = state.description;
  }
  const permissions = permissionsToUpdateBody(state.permissions);
  if (permissions !== undefined) {
    body.permissions = permissions;
  }
  return body;
};

/**
 * One company teammate group (`/teammate_groups/{teammate_group_id}` and related routes).
 *
 * Writable: `name`, `description`, `permissions`. Read-only: `id`, `isManagedByScim`, `links`.
 * `PATCH` returns `204`; {@link update} and {@link save} merge the request into local state.
 *
 * @see https://dev.frontapp.com/reference/teammate-groups
 */
export class FrontTeammateGroup extends FrontResource<TeammateGroupResponse, UpdateTeammateGroup> {
  protected selfPath(): string {
    return FrontBase.expandPath("/teammate_groups/{teammate_group_id}", {
      teammate_group_id: this.id,
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

  get isManagedByScim(): boolean {
    return this.pick("is_managed_by_scim");
  }

  get permissions(): TeammateGroupResponse["permissions"] {
    return this.pick("permissions");
  }

  set permissions(value: TeammateGroupResponse["permissions"]) {
    this.assign("permissions", value);
  }

  toUpdateBody(): UpdateTeammateGroup {
    return teammateGroupResponseToUpdateBody(this.state);
  }

  /**
   * Update this teammate group (`PATCH /teammate_groups/{teammate_group_id}`). Returns `204`; local state is merged.
   *
   * **Required scope:** `teammate_groups:write`
   *
   * @see https://dev.frontapp.com/reference/update-a-company-teammate-group
   */
  async update(body: UpdateTeammateGroup | Partial<UpdateTeammateGroup>): Promise<void> {
    await this.patchNoContent(body, mergeTeammateGroupSnapshot);
  }

  /**
   * List inboxes this group can access via its teams (`GET /teammate_groups/{teammate_group_id}/inboxes`).
   *
   * **Required scope:** `teammate_groups:read`
   *
   * @see https://dev.frontapp.com/reference/list-company-teammate-group-team-inboxes
   */
  async listInboxes(): Promise<WithNormalizedPagination<ListTeammateGroupInboxesResponse>> {
    const path = FrontBase.expandPath("/teammate_groups/{teammate_group_id}/inboxes", {
      teammate_group_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeammateGroupInboxesResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Link non-public inboxes (`POST /teammate_groups/{teammate_group_id}/inboxes`).
   *
   * **Required scope:** `teammate_groups:write`
   *
   * @see https://dev.frontapp.com/reference/add-company-teammate-group-team-inboxes
   */
  async addInboxes(body: components["schemas"]["InboxIds"]): Promise<void> {
    const path = FrontBase.expandPath("/teammate_groups/{teammate_group_id}/inboxes", {
      teammate_group_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * Unlink non-public inboxes (`DELETE /teammate_groups/{teammate_group_id}/inboxes`).
   *
   * **Required scope:** `teammate_groups:write`
   *
   * @see https://dev.frontapp.com/reference/remove-company-teammate-group-team-inboxes
   */
  async removeInboxes(body: components["schemas"]["InboxIds"]): Promise<void> {
    const path = FrontBase.expandPath("/teammate_groups/{teammate_group_id}/inboxes", {
      teammate_group_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }

  /**
   * List teammates in the group (`GET /teammate_groups/{teammate_group_id}/teammates`).
   *
   * **Required scope:** `teammate_groups:read`
   *
   * @see https://dev.frontapp.com/reference/list-company-teammate-group-teammates
   */
  async listTeammates(): Promise<FrontTeammate[]> {
    const path = FrontBase.expandPath("/teammate_groups/{teammate_group_id}/teammates", {
      teammate_group_id: this.id,
    });
    const json = await this.base.requestJson<
      WithNormalizedPagination<ListTeammateGroupTeammatesResponse>
    >("GET", path);
    const results = json._results ?? [];
    return results.map((row) => new FrontTeammate(this.base, row));
  }

  /**
   * Add teammates (`POST /teammate_groups/{teammate_group_id}/teammates`).
   *
   * **Required scope:** `teammate_groups:write`
   *
   * @see https://dev.frontapp.com/reference/add-company-teammate-group-teammates
   */
  async addTeammates(body: components["schemas"]["TeammateIds"]): Promise<void> {
    const path = FrontBase.expandPath("/teammate_groups/{teammate_group_id}/teammates", {
      teammate_group_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * Remove teammates (`DELETE /teammate_groups/{teammate_group_id}/teammates`).
   *
   * **Required scope:** `teammate_groups:write`
   *
   * @see https://dev.frontapp.com/reference/remove-company-teammate-group-teammates
   */
  async removeTeammates(body: components["schemas"]["TeammateIds"]): Promise<void> {
    const path = FrontBase.expandPath("/teammate_groups/{teammate_group_id}/teammates", {
      teammate_group_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }

  /**
   * List teams on the group (`GET /teammate_groups/{teammate_group_id}/teams`).
   *
   * **Required scope:** `teammate_groups:read`
   *
   * @see https://dev.frontapp.com/reference/list-company-teammate-group-teams
   */
  async listTeams(): Promise<WithNormalizedPagination<ListTeammateGroupTeamsResponse>> {
    const path = FrontBase.expandPath("/teammate_groups/{teammate_group_id}/teams", {
      teammate_group_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeammateGroupTeamsResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Add teams (`POST /teammate_groups/{teammate_group_id}/teams`).
   *
   * **Required scope:** `teammate_groups:write`
   *
   * @see https://dev.frontapp.com/reference/add-company-teammate-group-teams
   */
  async addTeams(body: components["schemas"]["TeamIds"]): Promise<void> {
    const path = FrontBase.expandPath("/teammate_groups/{teammate_group_id}/teams", {
      teammate_group_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * Remove teams (`DELETE /teammate_groups/{teammate_group_id}/teams`).
   *
   * **Required scope:** `teammate_groups:write`
   *
   * @see https://dev.frontapp.com/reference/remove-company-teammate-group-teams
   */
  async removeTeams(body: components["schemas"]["TeamIds"]): Promise<void> {
    const path = FrontBase.expandPath("/teammate_groups/{teammate_group_id}/teams", {
      teammate_group_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }
}

/**
 * Company teammate groups under `/teammate_groups`.
 *
 * @see https://dev.frontapp.com/reference/teammate-groups
 */
export class FrontTeammateGroups {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List teammate groups (`GET /teammate_groups`).
   *
   * **Required scope:** `teammate_groups:read`
   *
   * @see https://dev.frontapp.com/reference/list-company-teammate-groups
   */
  async list(): Promise<WithNormalizedPagination<ListTeammateGroupsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListTeammateGroupsResponse>>(
      "GET",
      "/teammate_groups",
    );
  }

  /**
   * Create a teammate group (`POST /teammate_groups`).
   *
   * **Required scope:** `teammate_groups:write`
   *
   * @see https://dev.frontapp.com/reference/create-company-teammate-group
   */
  async create(body: CreateTeammateGroup): Promise<FrontTeammateGroup> {
    const data = await this.base.requestJson<TeammateGroupResponse>("POST", "/teammate_groups", {
      body,
    });
    return new FrontTeammateGroup(this.base, data);
  }

  /**
   * Fetch one teammate group (`GET /teammate_groups/{teammate_group_id}`).
   *
   * **Required scope:** `teammate_groups:read`
   *
   * @see https://dev.frontapp.com/reference/get-company-teammate-group
   */
  async get(teammateGroupId: string): Promise<FrontTeammateGroup> {
    const path = FrontBase.expandPath("/teammate_groups/{teammate_group_id}", {
      teammate_group_id: teammateGroupId,
    });
    const data = await this.base.requestJson<TeammateGroupResponse>("GET", path);
    return new FrontTeammateGroup(this.base, data);
  }
}
