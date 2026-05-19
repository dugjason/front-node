import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";
import { FrontMessageTemplate } from "./message-templates";

export type MessageTemplateFolderResponse = components["schemas"]["MessageTemplateFolderResponse"];
export type CreateMessageTemplateFolder = components["schemas"]["CreateMessageTemplateFolder"];
export type CreateMessageTemplateFolderAsChild =
  components["schemas"]["CreateMessageTemplateFolderAsChild"];
export type UpdateMessageTemplateFolder = components["schemas"]["UpdateMessageTemplateFolder"];

type ListFoldersQuery = NonNullable<operations["list-folders"]["parameters"]["query"]>;
type ListFoldersResponse =
  components["responses"]["listOfCannedAnswerFolders"]["content"]["application/json"];

type AcceptedFolderDeletionBody =
  components["responses"]["acceptedCannedAnswerFolderDeletion"]["content"]["application/json"];

const queryFromListFolders = (
  q?: ListFoldersQuery,
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

const folderResponseToUpdateBody = (
  state: MessageTemplateFolderResponse,
  parentFolderId: string | null | undefined,
): UpdateMessageTemplateFolder => {
  const body: UpdateMessageTemplateFolder = { name: state.name };
  if (parentFolderId !== undefined) {
    body.parent_folder_id = parentFolderId ?? undefined;
  }
  return body;
};

/**
 * One message template folder (`/message_template_folders/{message_template_folder_id}` and child routes).
 *
 * @see https://dev.frontapp.com/reference/message-template-folders
 */
export class FrontMessageTemplateFolder extends FrontResource<
  MessageTemplateFolderResponse,
  UpdateMessageTemplateFolder
> {
  private parentFolderIdForUpdate: string | null | undefined;

  constructor(base: FrontBase, snapshot: MessageTemplateFolderResponse) {
    super(base, snapshot);
    this.parentFolderIdForUpdate = undefined;
  }

  protected override onAfterRefresh(): void {
    this.parentFolderIdForUpdate = undefined;
  }

  protected selfPath(): string {
    return FrontBase.expandPath("/message_template_folders/{message_template_folder_id}", {
      message_template_folder_id: this.id,
    });
  }

  get name(): string {
    return this.pick("name");
  }

  set name(value: string) {
    this.assign("name", value);
  }

  /**
   * Parent folder id for `PATCH` only (OpenAPI update payload).
   */
  get parentFolderId(): string | null | undefined {
    return this.parentFolderIdForUpdate;
  }

  set parentFolderId(value: string | null | undefined) {
    this.parentFolderIdForUpdate = value;
  }

  toUpdateBody(): UpdateMessageTemplateFolder {
    return folderResponseToUpdateBody(this.state, this.parentFolderIdForUpdate);
  }

  async update(
    body: UpdateMessageTemplateFolder | Partial<UpdateMessageTemplateFolder>,
  ): Promise<void> {
    await this.patchReplaceFromResponse(body);
    if ("parent_folder_id" in body) {
      this.parentFolderIdForUpdate =
        body.parent_folder_id === null || body.parent_folder_id === undefined
          ? undefined
          : body.parent_folder_id;
    }
  }

  /**
   * Delete this folder (`DELETE /message_template_folders/{message_template_folder_id}`). Returns `202` with a small JSON body (handled internally).
   *
   * **Required scope:** `message_templates:delete`
   */
  override async delete(): Promise<void> {
    await this.base.requestJson<AcceptedFolderDeletionBody>("DELETE", this.selfPath());
  }

  /**
   * List child folders (`GET /message_template_folders/{message_template_folder_id}/message_template_folders`).
   *
   * **Required scope:** `message_templates:read`
   */
  async listChildFolders(): Promise<WithNormalizedPagination<ListFoldersResponse>> {
    const path = FrontBase.expandPath(
      "/message_template_folders/{message_template_folder_id}/message_template_folders",
      { message_template_folder_id: this.id },
    );
    return await this.base.requestJson<WithNormalizedPagination<ListFoldersResponse>>("GET", path);
  }

  /**
   * Create a child folder (`POST /message_template_folders/{message_template_folder_id}/message_template_folders`).
   *
   * **Required scope:** `message_templates:write`
   */
  async createChildFolder(
    body: CreateMessageTemplateFolderAsChild,
  ): Promise<FrontMessageTemplateFolder> {
    const path = FrontBase.expandPath(
      "/message_template_folders/{message_template_folder_id}/message_template_folders",
      { message_template_folder_id: this.id },
    );
    const data = await this.base.requestJson<MessageTemplateFolderResponse>("POST", path, { body });
    return new FrontMessageTemplateFolder(this.base, data);
  }

  /**
   * List child templates (`GET /message_template_folders/{message_template_folder_id}/message_templates`).
   * The OpenAPI spec types the `200` body like {@link listChildFolders}; callers should rely on the live API shape.
   *
   * **Required scope:** `message_templates:read`
   */
  async listChildTemplates(): Promise<WithNormalizedPagination<ListFoldersResponse>> {
    const path = FrontBase.expandPath(
      "/message_template_folders/{message_template_folder_id}/message_templates",
      { message_template_folder_id: this.id },
    );
    return await this.base.requestJson<WithNormalizedPagination<ListFoldersResponse>>("GET", path);
  }

  /**
   * Create a child template (`POST /message_template_folders/{message_template_folder_id}/message_templates`).
   *
   * **Required scope:** `message_templates:write`
   */
  async createChildTemplate(
    body: components["schemas"]["CreateMessageTemplateAsChild"],
  ): Promise<FrontMessageTemplate> {
    const path = FrontBase.expandPath(
      "/message_template_folders/{message_template_folder_id}/message_templates",
      { message_template_folder_id: this.id },
    );
    const data = await this.base.requestJson<components["schemas"]["MessageTemplateResponse"]>(
      "POST",
      path,
      { body },
    );
    return new FrontMessageTemplate(this.base, data);
  }
}

/**
 * Message template folders (`/message_template_folders`).
 *
 * @see https://dev.frontapp.com/reference/message-template-folders
 */
export class FrontMessageTemplateFolders {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List folders (`GET /message_template_folders`).
   *
   * **Required scope:** `message_templates:read`
   */
  async list(query?: ListFoldersQuery): Promise<WithNormalizedPagination<ListFoldersResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListFoldersResponse>>(
      "GET",
      "/message_template_folders",
      {
        query: queryFromListFolders(query),
      },
    );
  }

  /**
   * Create a folder (`POST /message_template_folders`).
   *
   * **Required scope:** `message_templates:write`
   */
  async create(body: CreateMessageTemplateFolder): Promise<FrontMessageTemplateFolder> {
    const data = await this.base.requestJson<MessageTemplateFolderResponse>(
      "POST",
      "/message_template_folders",
      { body },
    );
    return new FrontMessageTemplateFolder(this.base, data);
  }

  /**
   * Fetch one folder (`GET /message_template_folders/{message_template_folder_id}`).
   *
   * **Required scope:** `message_templates:read`
   */
  async get(folderId: string): Promise<FrontMessageTemplateFolder> {
    const path = FrontBase.expandPath("/message_template_folders/{message_template_folder_id}", {
      message_template_folder_id: folderId,
    });
    const data = await this.base.requestJson<MessageTemplateFolderResponse>("GET", path);
    return new FrontMessageTemplateFolder(this.base, data);
  }
}
