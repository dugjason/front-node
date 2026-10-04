import type { FrontBase } from "../base";
import type { OperationParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type TeammateGroupResponse = components["schemas"]["TeammateGroupResponse"];

export type CreateTeammateGroupParams = NonNullable<
  OperationParams<"create-company-teammate-group">["body"]
>;
export type UpdateTeammateGroupParams = NonNullable<
  OperationParams<"update-a-company-teammate-group">["body"]
>;
export type AddTeammateGroupInboxesParams = NonNullable<
  OperationParams<"add-company-teammate-group-team-inboxes">["body"]
>;
export type RemoveTeammateGroupInboxesParams = NonNullable<
  OperationParams<"remove-company-teammate-group-team-inboxes">["body"]
>;
export type AddTeammateGroupTeammatesParams = NonNullable<
  OperationParams<"add-company-teammate-group-teammates">["body"]
>;
export type RemoveTeammateGroupTeammatesParams = NonNullable<
  OperationParams<"remove-company-teammate-group-teammates">["body"]
>;
export type AddTeammateGroupTeamsParams = NonNullable<
  OperationParams<"add-company-teammate-group-teams">["body"]
>;
export type RemoveTeammateGroupTeamsParams = NonNullable<
  OperationParams<"remove-company-teammate-group-teams">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontTeammateGroups {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /teammate_groups
   * Required scope: `teammate_groups:read`
   * @see https://dev.frontapp.com/reference/list-company-teammate-groups
   */
  async list(): Promise<OperationResponse<"list-company-teammate-groups">> {
    return await this.base.requestOperation("list-company-teammate-groups");
  }

  /** POST /teammate_groups
   * Required scope: `teammate_groups:write`
   * @see https://dev.frontapp.com/reference/create-company-teammate-group
   */
  async create(
    body: CreateTeammateGroupParams,
  ): Promise<OperationResponse<"create-company-teammate-group">> {
    return await this.base.requestOperation("create-company-teammate-group", { body });
  }

  /** GET /teammate_groups/{teammate_group_id}
   * Required scope: `teammate_groups:read`
   * @see https://dev.frontapp.com/reference/get-company-teammate-group
   */
  async get(teammateGroupId: string): Promise<OperationResponse<"get-company-teammate-group">> {
    return await this.base.requestOperation("get-company-teammate-group", {
      path: { teammate_group_id: teammateGroupId },
    });
  }

  /** PATCH /teammate_groups/{teammate_group_id}
   * Required scope: `teammate_groups:write`
   * @see https://dev.frontapp.com/reference/update-a-company-teammate-group
   */
  async update(
    teammateGroupId: string,
    body: UpdateTeammateGroupParams,
  ): Promise<OperationResponse<"update-a-company-teammate-group">> {
    return await this.base.requestOperation("update-a-company-teammate-group", {
      body,
      path: { teammate_group_id: teammateGroupId },
    });
  }

  /** DELETE /teammate_groups/{teammate_group_id}
   * Required scope: `teammate_groups:delete`
   * @see https://dev.frontapp.com/reference/delete-company-teammate-group
   */
  async delete(
    teammateGroupId: string,
  ): Promise<OperationResponse<"delete-company-teammate-group">> {
    return await this.base.requestOperation("delete-company-teammate-group", {
      path: { teammate_group_id: teammateGroupId },
    });
  }

  /** GET /teammate_groups/{teammate_group_id}/inboxes
   * Required scope: `inboxes:read`
   * @see https://dev.frontapp.com/reference/list-company-teammate-group-team-inboxes
   */
  async listInboxes(
    teammateGroupId: string,
  ): Promise<OperationResponse<"list-company-teammate-group-team-inboxes">> {
    return await this.base.requestOperation("list-company-teammate-group-team-inboxes", {
      path: { teammate_group_id: teammateGroupId },
    });
  }

  /** POST /teammate_groups/{teammate_group_id}/inboxes
   * Required scope: `teammate_groups:write`
   * @see https://dev.frontapp.com/reference/add-company-teammate-group-team-inboxes
   */
  async addInboxes(
    teammateGroupId: string,
    body: AddTeammateGroupInboxesParams,
  ): Promise<OperationResponse<"add-company-teammate-group-team-inboxes">> {
    return await this.base.requestOperation("add-company-teammate-group-team-inboxes", {
      body,
      path: { teammate_group_id: teammateGroupId },
    });
  }

  /** DELETE /teammate_groups/{teammate_group_id}/inboxes
   * Required scope: `teammate_groups:write`
   * @see https://dev.frontapp.com/reference/remove-company-teammate-group-team-inboxes
   */
  async removeInboxes(
    teammateGroupId: string,
    body?: RemoveTeammateGroupInboxesParams,
  ): Promise<OperationResponse<"remove-company-teammate-group-team-inboxes">> {
    return await this.base.requestOperation("remove-company-teammate-group-team-inboxes", {
      body,
      path: { teammate_group_id: teammateGroupId },
    });
  }

  /** GET /teammate_groups/{teammate_group_id}/teammates
   * Required scope: `teammates:read`
   * @see https://dev.frontapp.com/reference/list-company-teammate-group-teammates
   */
  async listTeammates(
    teammateGroupId: string,
  ): Promise<OperationResponse<"list-company-teammate-group-teammates">> {
    return await this.base.requestOperation("list-company-teammate-group-teammates", {
      path: { teammate_group_id: teammateGroupId },
    });
  }

  /** POST /teammate_groups/{teammate_group_id}/teammates
   * Required scope: `teammate_groups:write`
   * @see https://dev.frontapp.com/reference/add-company-teammate-group-teammates
   */
  async addTeammates(
    teammateGroupId: string,
    body: AddTeammateGroupTeammatesParams,
  ): Promise<OperationResponse<"add-company-teammate-group-teammates">> {
    return await this.base.requestOperation("add-company-teammate-group-teammates", {
      body,
      path: { teammate_group_id: teammateGroupId },
    });
  }

  /** DELETE /teammate_groups/{teammate_group_id}/teammates
   * Required scope: `teammate_groups:write`
   * @see https://dev.frontapp.com/reference/remove-company-teammate-group-teammates
   */
  async removeTeammates(
    teammateGroupId: string,
    body?: RemoveTeammateGroupTeammatesParams,
  ): Promise<OperationResponse<"remove-company-teammate-group-teammates">> {
    return await this.base.requestOperation("remove-company-teammate-group-teammates", {
      body,
      path: { teammate_group_id: teammateGroupId },
    });
  }

  /** GET /teammate_groups/{teammate_group_id}/teams
   * Required scope: `teams:read`
   * @see https://dev.frontapp.com/reference/list-company-teammate-group-teams
   */
  async listTeams(
    teammateGroupId: string,
  ): Promise<OperationResponse<"list-company-teammate-group-teams">> {
    return await this.base.requestOperation("list-company-teammate-group-teams", {
      path: { teammate_group_id: teammateGroupId },
    });
  }

  /** POST /teammate_groups/{teammate_group_id}/teams
   * Required scope: `teammate_groups:write`
   * @see https://dev.frontapp.com/reference/add-company-teammate-group-teams
   */
  async addTeams(
    teammateGroupId: string,
    body: AddTeammateGroupTeamsParams,
  ): Promise<OperationResponse<"add-company-teammate-group-teams">> {
    return await this.base.requestOperation("add-company-teammate-group-teams", {
      body,
      path: { teammate_group_id: teammateGroupId },
    });
  }

  /** DELETE /teammate_groups/{teammate_group_id}/teams
   * Required scope: `teammate_groups:write`
   * @see https://dev.frontapp.com/reference/remove-company-teammate-group-teams
   */
  async removeTeams(
    teammateGroupId: string,
    body?: RemoveTeammateGroupTeamsParams,
  ): Promise<OperationResponse<"remove-company-teammate-group-teams">> {
    return await this.base.requestOperation("remove-company-teammate-group-teams", {
      body,
      path: { teammate_group_id: teammateGroupId },
    });
  }
}
