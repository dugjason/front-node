import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type TeamResponse = components["schemas"]["TeamResponse"];
export type MessageTemplateResponse = components["schemas"]["MessageTemplateResponse"];
export type MessageTemplateFolderResponse = components["schemas"]["MessageTemplateFolderResponse"];
export type ShiftResponse = components["schemas"]["ShiftResponse"];
export type SharedViewResponse = components["schemas"]["SharedViewResponse"];

export type AddTeamTeammatesParams = NonNullable<OperationParams<"add-teammates-to-team">["body"]>;
export type RemoveTeamTeammatesParams = NonNullable<
  OperationParams<"remove-teammates-from-team">["body"]
>;
export type CreateTeamContactListParams = NonNullable<
  OperationParams<"create-team-contact-list">["body"]
>;
export type ListTeamContactsParams = OperationListParams<"list-team-contacts">;
export type CreateTeamContactParams = NonNullable<OperationParams<"create-team-contact">["body"]>;
export type ListTeamMessageTemplateFoldersParams = OperationListParams<"list-team-folders">;
export type CreateTeamMessageTemplateFolderParams = NonNullable<
  OperationParams<"create-team-folder">["body"]
>;
export type ListTeamMessageTemplatesParams = OperationListParams<"list-team-message-templates">;
export type CreateTeamMessageTemplateParams = NonNullable<
  OperationParams<"create-team-message-template">["body"]
>;
export type CreateTeamShiftParams = NonNullable<OperationParams<"create-team-shift">["body"]>;
export type CreateTeamSignatureParams = NonNullable<
  OperationParams<"create-team-signature">["body"]
>;
export type ListTeamTagsParams = OperationListParams<"list-team-tags">;
export type CreateTeamTagParams = NonNullable<OperationParams<"create-team-tag">["body"]>;
export type ListTeamViewsParams = OperationListParams<"list-team-views">;
export type CreateTeamViewParams = NonNullable<OperationParams<"create-team-view">["body"]>;

export type CreateTeamInboxParams = NonNullable<OperationParams<"create-team-inbox">["body"]>;

export type ListTeamTimeOffsParams = OperationListParams<"list-team-time-offs">;

/** Collection operations returning Front response data. */
export class FrontTeams {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /teams
   * Required scope: `teams:read`
   * @see https://dev.frontapp.com/reference/list-teams
   */
  async listTeams(): Promise<OperationResponse<"list-teams">> {
    return await this.base.requestOperation("list-teams");
  }

  /** GET /teams/{team_id}
   * Required scope: `teams:read`
   * @see https://dev.frontapp.com/reference/get-team
   */
  async getTeam(teamId: string): Promise<OperationResponse<"get-team">> {
    return await this.base.requestOperation("get-team", { path: { team_id: teamId } });
  }

  /** POST /teams/{team_id}/teammates
   * Required scope: `teams:write`
   * @see https://dev.frontapp.com/reference/add-teammates-to-team
   */
  async addTeammates(
    teamId: string,
    body: AddTeamTeammatesParams,
  ): Promise<OperationResponse<"add-teammates-to-team">> {
    return await this.base.requestOperation("add-teammates-to-team", {
      body,
      path: { team_id: teamId },
    });
  }

  /** DELETE /teams/{team_id}/teammates
   * Required scope: `teams:write`
   * @see https://dev.frontapp.com/reference/remove-teammates-from-team
   */
  async removeTeammates(
    teamId: string,
    body?: RemoveTeamTeammatesParams,
  ): Promise<OperationResponse<"remove-teammates-from-team">> {
    return await this.base.requestOperation("remove-teammates-from-team", {
      body,
      path: { team_id: teamId },
    });
  }

  /** GET /teams/{team_id}/channels
   * Required scope: `channels:read`
   * @see https://dev.frontapp.com/reference/list-team-channels
   */
  async listChannels(teamId: string): Promise<OperationResponse<"list-team-channels">> {
    return await this.base.requestOperation("list-team-channels", { path: { team_id: teamId } });
  }

  /** GET /teams/{team_id}/contact_lists
   * Required scope: `contacts:read`
   * @see https://dev.frontapp.com/reference/list-team-contact-lists
   */
  async listContactLists(teamId: string): Promise<OperationResponse<"list-team-contact-lists">> {
    return await this.base.requestOperation("list-team-contact-lists", {
      path: { team_id: teamId },
    });
  }

  /** POST /teams/{team_id}/contact_lists
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/create-team-contact-list
   */
  async createContactList(
    teamId: string,
    body: CreateTeamContactListParams,
  ): Promise<OperationResponse<"create-team-contact-list">> {
    return await this.base.requestOperation("create-team-contact-list", {
      body,
      path: { team_id: teamId },
    });
  }

  /** GET /teams/{team_id}/contacts
   * Required scope: `contacts:read`
   * @see https://dev.frontapp.com/reference/list-team-contacts
   */
  async listContacts(
    teamId: string,
    params?: ListTeamContactsParams,
  ): Promise<OperationResponse<"list-team-contacts">> {
    return await this.base.requestOperation("list-team-contacts", {
      nextPageUrl: params?.nextPageUrl,
      path: { team_id: teamId },
      query: params,
    });
  }

  /** POST /teams/{team_id}/contacts
   * Required scope: `contacts:write`
   * @see https://dev.frontapp.com/reference/create-team-contact
   */
  async createContact(
    teamId: string,
    body: CreateTeamContactParams,
  ): Promise<OperationResponse<"create-team-contact">> {
    return await this.base.requestOperation("create-team-contact", {
      body,
      path: { team_id: teamId },
    });
  }

  /** GET /teams/{team_id}/inboxes
   * Required scope: `inboxes:read`
   * @see https://dev.frontapp.com/reference/list-team-inboxes
   */
  async listInboxes(teamId: string): Promise<OperationResponse<"list-team-inboxes">> {
    return await this.base.requestOperation("list-team-inboxes", { path: { team_id: teamId } });
  }

  /** GET /teams/{team_id}/message_template_folders
   * Required scope: `message_templates:read`
   * @see https://dev.frontapp.com/reference/list-team-folders
   */
  async listMessageTemplateFolders(
    teamId: string,
    params?: ListTeamMessageTemplateFoldersParams,
  ): Promise<OperationResponse<"list-team-folders">> {
    return await this.base.requestOperation("list-team-folders", {
      path: { team_id: teamId },
      query: params,
    });
  }

  /** POST /teams/{team_id}/message_template_folders
   * Required scope: `message_templates:write`
   * @see https://dev.frontapp.com/reference/create-team-folder
   */
  async createMessageTemplateFolder(
    teamId: string,
    body: CreateTeamMessageTemplateFolderParams,
  ): Promise<OperationResponse<"create-team-folder">> {
    return await this.base.requestOperation("create-team-folder", {
      body,
      path: { team_id: teamId },
    });
  }

  /** GET /teams/{team_id}/message_templates
   * Required scope: `message_templates:read`
   * @see https://dev.frontapp.com/reference/list-team-message-templates
   */
  async listMessageTemplates(
    teamId: string,
    params?: ListTeamMessageTemplatesParams,
  ): Promise<OperationResponse<"list-team-message-templates">> {
    return await this.base.requestOperation("list-team-message-templates", {
      path: { team_id: teamId },
      query: params,
    });
  }

  /** POST /teams/{team_id}/message_templates
   * Required scope: `message_templates:write`
   * @see https://dev.frontapp.com/reference/create-team-message-template
   */
  async createMessageTemplate(
    teamId: string,
    body: CreateTeamMessageTemplateParams,
  ): Promise<OperationResponse<"create-team-message-template">> {
    return await this.base.requestOperation("create-team-message-template", {
      body,
      path: { team_id: teamId },
    });
  }

  /** GET /teams/{team_id}/rules
   * Required scope: `rules:read`
   * @see https://dev.frontapp.com/reference/list-team-rules
   */
  async listRules(teamId: string): Promise<OperationResponse<"list-team-rules">> {
    return await this.base.requestOperation("list-team-rules", { path: { team_id: teamId } });
  }

  /** GET /teams/{team_id}/shifts
   * Required scope: `shifts:read`
   * @see https://dev.frontapp.com/reference/list-team-shifts
   */
  async listShifts(teamId: string): Promise<OperationResponse<"list-team-shifts">> {
    return await this.base.requestOperation("list-team-shifts", { path: { team_id: teamId } });
  }

  /** POST /teams/{team_id}/shifts
   * Required scope: `shifts:write`
   * @see https://dev.frontapp.com/reference/create-team-shift
   */
  async createShift(
    teamId: string,
    body: CreateTeamShiftParams,
  ): Promise<OperationResponse<"create-team-shift">> {
    return await this.base.requestOperation("create-team-shift", {
      body,
      path: { team_id: teamId },
    });
  }

  /** GET /teams/{team_id}/signatures
   * Required scope: `signatures:read`
   * @see https://dev.frontapp.com/reference/list-team-signatures
   */
  async listSignatures(teamId: string): Promise<OperationResponse<"list-team-signatures">> {
    return await this.base.requestOperation("list-team-signatures", { path: { team_id: teamId } });
  }

  /** POST /teams/{team_id}/signatures
   * Required scope: `signatures:write`
   * @see https://dev.frontapp.com/reference/create-team-signature
   */
  async createSignature(
    teamId: string,
    body: CreateTeamSignatureParams,
  ): Promise<OperationResponse<"create-team-signature">> {
    return await this.base.requestOperation("create-team-signature", {
      body,
      path: { team_id: teamId },
    });
  }

  /** GET /teams/{team_id}/tags
   * Required scope: `tags:read`
   * @see https://dev.frontapp.com/reference/list-team-tags
   */
  async listTags(
    teamId: string,
    params?: ListTeamTagsParams,
  ): Promise<OperationResponse<"list-team-tags">> {
    return await this.base.requestOperation("list-team-tags", {
      nextPageUrl: params?.nextPageUrl,
      path: { team_id: teamId },
      query: params,
    });
  }

  /** POST /teams/{team_id}/tags
   * Required scope: `tags:write`
   * @see https://dev.frontapp.com/reference/create-team-tag
   */
  async createTag(
    teamId: string,
    body: CreateTeamTagParams,
  ): Promise<OperationResponse<"create-team-tag">> {
    return await this.base.requestOperation("create-team-tag", { body, path: { team_id: teamId } });
  }

  /** GET /teams/{team_id}/views
   * Required scope: `views:read`
   * @see https://dev.frontapp.com/reference/list-team-views
   */
  async listViews(
    teamId: string,
    params?: ListTeamViewsParams,
  ): Promise<OperationResponse<"list-team-views">> {
    return await this.base.requestOperation("list-team-views", {
      nextPageUrl: params?.nextPageUrl,
      path: { team_id: teamId },
      query: params,
    });
  }

  /** POST /teams/{team_id}/views
   * Required scope: `views:write`
   * @see https://dev.frontapp.com/reference/create-team-view
   */
  async createView(
    teamId: string,
    body: CreateTeamViewParams,
  ): Promise<OperationResponse<"create-team-view">> {
    return await this.base.requestOperation("create-team-view", {
      body,
      path: { team_id: teamId },
    });
  }
  /** POST /teams/{team_id}/inboxes
   * Required scope: `inboxes:write`
   * @see https://dev.frontapp.com/reference/create-team-inbox
   */
  async createInbox(
    teamId: string,
    body: CreateTeamInboxParams,
  ): Promise<OperationResponse<"create-team-inbox">> {
    return await this.base.requestOperation("create-team-inbox", {
      body,
      path: { team_id: teamId },
    });
  }
  /** GET /teams/{team_id}/time_offs
   * Required scope: `time_off:read`
   * @see https://dev.frontapp.com/reference/list-team-time-offs
   */
  async listTimeOffs(
    teamId: string,
    params?: ListTeamTimeOffsParams,
  ): Promise<OperationResponse<"list-team-time-offs">> {
    return await this.base.requestOperation("list-team-time-offs", {
      nextPageUrl: params?.nextPageUrl,
      path: { team_id: teamId },
      query: params,
    });
  }
}
