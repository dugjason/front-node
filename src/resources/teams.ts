import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontInbox } from "./inboxes";
import type { CreateSharedSignature, SignatureResponse } from "./signatures";
import { FrontSignature } from "./signatures";
import type { CreateTag, TagResponse } from "./tags";
import { FrontTag } from "./tags";

type CreateContact = components["schemas"]["CreateContact"];
type CreateContactList = components["schemas"]["CreateContactList"];
type ContactResponse = components["schemas"]["ContactResponse"];

export type TeamResponse = components["schemas"]["TeamResponse"];
export type CreateTeamInbox = components["schemas"]["CreateTeamInbox"];
export type CreateMessageTemplateFolder = components["schemas"]["CreateMessageTemplateFolder"];
export type CreateSharedMessageTemplate = components["schemas"]["CreateSharedMessageTemplate"];
export type CreateShift = components["schemas"]["CreateShift"];
export type CreateView = components["schemas"]["CreateView"];
export type MessageTemplateResponse = components["schemas"]["MessageTemplateResponse"];
export type MessageTemplateFolderResponse = components["schemas"]["MessageTemplateFolderResponse"];
export type ShiftResponse = components["schemas"]["ShiftResponse"];
export type SharedViewResponse = components["schemas"]["SharedViewResponse"];

type ListTeamsResponse = operations["list-teams"]["responses"][200]["content"]["application/json"];

type ListTeamChannelsResponse =
  operations["list-team-channels"]["responses"][200]["content"]["application/json"];

type ListTeamGroupsResponse =
  operations["list-team-groups"]["responses"][200]["content"]["application/json"];

type ListTeamContactListsResponse =
  operations["list-team-contact-lists"]["responses"][200]["content"]["application/json"];

type ListTeamContactsQuery = NonNullable<operations["list-team-contacts"]["parameters"]["query"]>;
type ListTeamContactsResponse =
  operations["list-team-contacts"]["responses"][200]["content"]["application/json"];

type ListTeamInboxesResponse =
  operations["list-team-inboxes"]["responses"][200]["content"]["application/json"];

type ListTeamFoldersQuery = NonNullable<operations["list-team-folders"]["parameters"]["query"]>;
type ListTeamFoldersResponse =
  operations["list-team-folders"]["responses"][200]["content"]["application/json"];

type ListTeamMessageTemplatesQuery = NonNullable<
  operations["list-team-message-templates"]["parameters"]["query"]
>;
type ListTeamMessageTemplatesResponse =
  operations["list-team-message-templates"]["responses"][200]["content"]["application/json"];

type ListTeamRulesResponse =
  operations["list-team-rules"]["responses"][200]["content"]["application/json"];

type ListTeamShiftsResponse =
  operations["list-team-shifts"]["responses"][200]["content"]["application/json"];

type ListTeamSignaturesResponse =
  operations["list-team-signatures"]["responses"][200]["content"]["application/json"];

type ListTeamTagsQuery = NonNullable<operations["list-team-tags"]["parameters"]["query"]>;
type ListTeamTagsResponse =
  operations["list-team-tags"]["responses"][200]["content"]["application/json"];

type ListTeamViewsQuery = NonNullable<operations["list-team-views"]["parameters"]["query"]>;
type ListTeamViewsResponse =
  operations["list-team-views"]["responses"][200]["content"]["application/json"];

const queryFromListTeamContacts = (
  q?: ListTeamContactsQuery,
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

const queryFromListTeamFolders = (
  q?: ListTeamFoldersQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.sort_by !== undefined) {
    out.sort_by = String(q.sort_by);
  }
  if (q.sort_order !== undefined) {
    out.sort_order = String(q.sort_order);
  }
  return out;
};

const queryFromListTeamMessageTemplates = (
  q?: ListTeamMessageTemplatesQuery,
): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.sort_by !== undefined) {
    out.sort_by = String(q.sort_by);
  }
  if (q.sort_order !== undefined) {
    out.sort_order = String(q.sort_order);
  }
  return out;
};

const queryFromListTeamTags = (
  q?: ListTeamTagsQuery,
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

const queryFromListTeamViews = (
  q?: ListTeamViewsQuery,
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
  return out;
};

/**
 * One team / workspace (`GET /teams/{team_id}`). There is no team `PATCH` in the OpenAPI spec; use {@link refresh} after changes elsewhere.
 *
 * @see https://dev.frontapp.com/reference/teams
 */
export class FrontTeam {
  private state: TeamResponse;
  private readonly base: FrontBase;

  constructor(base: FrontBase, snapshot: TeamResponse) {
    this.base = base;
    this.state = structuredClone(snapshot);
  }

  get id(): string {
    return this.state.id;
  }

  get links(): TeamResponse["_links"] {
    return this.state._links;
  }

  /** Full team JSON from the last fetch. */
  get data(): Readonly<TeamResponse> {
    return this.state;
  }

  private selfPath(): string {
    return FrontBase.expandPath("/teams/{team_id}", { team_id: this.id });
  }

  /**
   * Fetch team (`GET /teams/{team_id}`).
   *
   * **Required scope:** `teams:read`
   */
  async refresh(): Promise<this> {
    const next = await this.base.requestJson<TeamResponse>("GET", this.selfPath());
    this.state = structuredClone(next);
    return this;
  }

  /**
   * List team channels (`GET /teams/{team_id}/channels`).
   *
   * **Required scope:** `channels:read`
   */
  async listChannels(): Promise<WithNormalizedPagination<ListTeamChannelsResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/channels", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamChannelsResponse>>(
      "GET",
      path,
    );
  }

  /**
   * List contact groups (deprecated; `GET /teams/{team_id}/contact_groups`).
   *
   * **Required scope:** `contacts:read`
   */
  async listContactGroups(): Promise<WithNormalizedPagination<ListTeamGroupsResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/contact_groups", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamGroupsResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Create a contact group (deprecated; `POST /teams/{team_id}/contact_groups`). The API returns `204`.
   *
   * **Required scope:** `contacts:write`
   */
  async createContactGroup(body: CreateContactList): Promise<void> {
    const path = FrontBase.expandPath("/teams/{team_id}/contact_groups", {
      team_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * List contact lists (`GET /teams/{team_id}/contact_lists`).
   *
   * **Required scope:** `contacts:read`
   */
  async listContactLists(): Promise<WithNormalizedPagination<ListTeamContactListsResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/contact_lists", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamContactListsResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Create a contact list (`POST /teams/{team_id}/contact_lists`). The API returns `204`.
   *
   * **Required scope:** `contacts:write`
   */
  async createContactList(body: CreateContactList): Promise<void> {
    const path = FrontBase.expandPath("/teams/{team_id}/contact_lists", {
      team_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * List team contacts (`GET /teams/{team_id}/contacts`).
   *
   * **Required scope:** `contacts:read`
   */
  async listContacts(
    query?: ListTeamContactsQuery,
  ): Promise<WithNormalizedPagination<ListTeamContactsResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/contacts", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamContactsResponse>>(
      "GET",
      path,
      {
        query: queryFromListTeamContacts(query),
      },
    );
  }

  /**
   * Create a team contact (`POST /teams/{team_id}/contacts`).
   *
   * **Required scope:** `contacts:write`
   */
  async createContact(body: CreateContact): Promise<ContactResponse> {
    const path = FrontBase.expandPath("/teams/{team_id}/contacts", {
      team_id: this.id,
    });
    return await this.base.requestJson<ContactResponse>("POST", path, { body });
  }

  /**
   * List team inboxes (`GET /teams/{team_id}/inboxes`).
   *
   * **Required scope:** `inboxes:read`
   */
  async listInboxes(): Promise<WithNormalizedPagination<ListTeamInboxesResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/inboxes", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamInboxesResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Create a team inbox (`POST /teams/{team_id}/inboxes`).
   *
   * **Required scope:** `inboxes:write`
   */
  async createInbox(body: CreateTeamInbox): Promise<FrontInbox> {
    const path = FrontBase.expandPath("/teams/{team_id}/inboxes", {
      team_id: this.id,
    });
    const data = await this.base.requestJson<
      operations["create-team-inbox"]["responses"][201]["content"]["application/json"]
    >("POST", path, { body });
    return new FrontInbox(this.base, data);
  }

  /**
   * List message template folders (`GET /teams/{team_id}/message_template_folders`).
   *
   * **Required scope:** `message_templates:read`
   */
  async listMessageTemplateFolders(
    query?: ListTeamFoldersQuery,
  ): Promise<WithNormalizedPagination<ListTeamFoldersResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/message_template_folders", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamFoldersResponse>>(
      "GET",
      path,
      {
        query: queryFromListTeamFolders(query),
      },
    );
  }

  /**
   * Create a message template folder (`POST /teams/{team_id}/message_template_folders`).
   *
   * **Required scope:** `message_templates:write`
   */
  async createMessageTemplateFolder(
    body: CreateMessageTemplateFolder,
  ): Promise<MessageTemplateFolderResponse> {
    const path = FrontBase.expandPath("/teams/{team_id}/message_template_folders", {
      team_id: this.id,
    });
    return await this.base.requestJson<MessageTemplateFolderResponse>("POST", path, { body });
  }

  /**
   * List message templates (`GET /teams/{team_id}/message_templates`).
   *
   * **Required scope:** `message_templates:read`
   */
  async listMessageTemplates(
    query?: ListTeamMessageTemplatesQuery,
  ): Promise<WithNormalizedPagination<ListTeamMessageTemplatesResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/message_templates", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamMessageTemplatesResponse>>(
      "GET",
      path,
      {
        query: queryFromListTeamMessageTemplates(query),
      },
    );
  }

  /**
   * Create a message template (`POST /teams/{team_id}/message_templates`).
   *
   * **Required scope:** `message_templates:write`
   */
  async createMessageTemplate(body: CreateSharedMessageTemplate): Promise<MessageTemplateResponse> {
    const path = FrontBase.expandPath("/teams/{team_id}/message_templates", {
      team_id: this.id,
    });
    return await this.base.requestJson<MessageTemplateResponse>("POST", path, {
      body,
    });
  }

  /**
   * List team rules (`GET /teams/{team_id}/rules`).
   *
   * **Required scope:** `rules:read`
   */
  async listRules(): Promise<WithNormalizedPagination<ListTeamRulesResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/rules", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamRulesResponse>>(
      "GET",
      path,
    );
  }

  /**
   * List team shifts (`GET /teams/{team_id}/shifts`).
   *
   * **Required scope:** `shifts:read`
   */
  async listShifts(): Promise<WithNormalizedPagination<ListTeamShiftsResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/shifts", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamShiftsResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Create a team shift (`POST /teams/{team_id}/shifts`).
   *
   * **Required scope:** `shifts:write`
   */
  async createShift(body: CreateShift): Promise<ShiftResponse> {
    const path = FrontBase.expandPath("/teams/{team_id}/shifts", {
      team_id: this.id,
    });
    return await this.base.requestJson<ShiftResponse>("POST", path, { body });
  }

  /**
   * List team signatures (`GET /teams/{team_id}/signatures`).
   *
   * **Required scope:** `signatures:read`
   */
  async listSignatures(): Promise<WithNormalizedPagination<ListTeamSignaturesResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/signatures", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamSignaturesResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Create a shared team signature (`POST /teams/{team_id}/signatures`).
   *
   * **Required scope:** `signatures:write`
   */
  async createSignature(body: CreateSharedSignature): Promise<FrontSignature> {
    const path = FrontBase.expandPath("/teams/{team_id}/signatures", {
      team_id: this.id,
    });
    const data = await this.base.requestJson<SignatureResponse>("POST", path, {
      body,
    });
    return new FrontSignature(this.base, data);
  }

  /**
   * List team tags (`GET /teams/{team_id}/tags`).
   *
   * **Required scope:** `tags:read`
   */
  async listTags(
    query?: ListTeamTagsQuery,
  ): Promise<WithNormalizedPagination<ListTeamTagsResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/tags", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamTagsResponse>>(
      "GET",
      path,
      {
        query: queryFromListTeamTags(query),
      },
    );
  }

  /**
   * Create a team tag (`POST /teams/{team_id}/tags`).
   *
   * **Required scope:** `tags:write`
   */
  async createTag(body: CreateTag): Promise<FrontTag> {
    const path = FrontBase.expandPath("/teams/{team_id}/tags", {
      team_id: this.id,
    });
    const data = await this.base.requestJson<TagResponse>("POST", path, {
      body,
    });
    return new FrontTag(this.base, data);
  }

  /**
   * Add teammates to the team (`POST /teams/{team_id}/teammates`). The API returns `204`.
   *
   * **Required scope:** `teams:write`
   */
  async addTeammates(body: components["schemas"]["TeammateIds"]): Promise<void> {
    const path = FrontBase.expandPath("/teams/{team_id}/teammates", {
      team_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * Remove teammates from the team (`DELETE /teams/{team_id}/teammates`). The API returns `204`.
   *
   * **Required scope:** `teams:write`
   */
  async removeTeammates(body: components["schemas"]["TeammateIds"]): Promise<void> {
    const path = FrontBase.expandPath("/teams/{team_id}/teammates", {
      team_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }

  /**
   * List team views (`GET /teams/{team_id}/views`).
   *
   * **Required scope:** `views:read`
   */
  async listViews(
    query?: ListTeamViewsQuery,
  ): Promise<WithNormalizedPagination<ListTeamViewsResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/views", {
      team_id: this.id,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListTeamViewsResponse>>(
      "GET",
      path,
      {
        query: queryFromListTeamViews(query),
      },
    );
  }

  /**
   * Create a team view (`POST /teams/{team_id}/views`).
   *
   * **Required scope:** `views:write`
   */
  async createView(body: CreateView): Promise<SharedViewResponse> {
    const path = FrontBase.expandPath("/teams/{team_id}/views", {
      team_id: this.id,
    });
    return await this.base.requestJson<SharedViewResponse>("POST", path, {
      body,
    });
  }
}

/**
 * Teams / workspaces (`GET /teams`, `GET /teams/{team_id}`) and {@link FrontTeam} sub-routes.
 *
 * @see https://dev.frontapp.com/reference/teams
 */
export class FrontTeams {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List teams (`GET /teams`).
   *
   * **Required scope:** `teams:read`
   */
  async listTeams(): Promise<WithNormalizedPagination<ListTeamsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListTeamsResponse>>(
      "GET",
      "/teams",
    );
  }

  /**
   * Fetch one team (`GET /teams/{team_id}`).
   *
   * **Required scope:** `teams:read`
   */
  async getTeam(teamId: string): Promise<FrontTeam> {
    const path = FrontBase.expandPath("/teams/{team_id}", { team_id: teamId });
    const data = await this.base.requestJson<TeamResponse>("GET", path);
    return new FrontTeam(this.base, data);
  }
}
