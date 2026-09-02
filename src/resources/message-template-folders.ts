import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";
import { FrontMessageTemplates } from "./message-templates";

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
export class FrontMessageTemplateFolders extends FrontResource<
  MessageTemplateFolderResponse,
  UpdateMessageTemplateFolder
> {
  private parentFolderIdForUpdate: string | null | undefined;

  constructor(base: FrontBase, snapshot?: MessageTemplateFolderResponse, folderId?: string) {
    super(base, snapshot, folderId);
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
  ): Promise<void>;
  async update(
    folderId: string,
    body: UpdateMessageTemplateFolder | Partial<UpdateMessageTemplateFolder>,
  ): Promise<void>;
  async update(
    bodyOrFolderId: UpdateMessageTemplateFolder | Partial<UpdateMessageTemplateFolder> | string,
    directBody?: UpdateMessageTemplateFolder | Partial<UpdateMessageTemplateFolder>,
  ): Promise<void> {
    if (typeof bodyOrFolderId === "string") {
      await this.target(bodyOrFolderId).update(directBody ?? {});
      return;
    }
    await this.patchReplaceFromResponse(bodyOrFolderId);
    if ("parent_folder_id" in bodyOrFolderId) {
      this.parentFolderIdForUpdate =
        bodyOrFolderId.parent_folder_id === null || bodyOrFolderId.parent_folder_id === undefined
          ? undefined
          : bodyOrFolderId.parent_folder_id;
    }
  }

  /**
   * Delete this folder (`DELETE /message_template_folders/{message_template_folder_id}`). Returns `202` with a small JSON body (handled internally).
   *
   * **Required scope:** `message_templates:delete`
   */
  override async delete(folderId?: string): Promise<void> {
    if (folderId !== undefined) {
      await this.target(folderId).delete();
      return;
    }
    await this.base.requestJson<AcceptedFolderDeletionBody>("DELETE", this.selfPath());
  }

  /**
   * List child folders (`GET /message_template_folders/{message_template_folder_id}/message_template_folders`).
   *
   * **Required scope:** `message_templates:read`
   */
  async listChildFolders(
    folderId?: string,
  ): Promise<WithNormalizedPagination<ListFoldersResponse>> {
    if (folderId !== undefined) {
      return await this.target(folderId).listChildFolders();
    }
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
  ): Promise<FrontMessageTemplateFolders>;
  async createChildFolder(
    folderId: string,
    body: CreateMessageTemplateFolderAsChild,
  ): Promise<FrontMessageTemplateFolders>;
  async createChildFolder(
    bodyOrFolderId: CreateMessageTemplateFolderAsChild | string,
    directBody?: CreateMessageTemplateFolderAsChild,
  ): Promise<FrontMessageTemplateFolders> {
    if (typeof bodyOrFolderId === "string") {
      if (directBody === undefined) {
        throw new Error("Creating a child folder requires a request body.");
      }
      return await this.target(bodyOrFolderId).createChildFolder(directBody);
    }
    const path = FrontBase.expandPath(
      "/message_template_folders/{message_template_folder_id}/message_template_folders",
      { message_template_folder_id: this.id },
    );
    const data = await this.base.requestJson<MessageTemplateFolderResponse>("POST", path, {
      body: bodyOrFolderId,
    });
    return new FrontMessageTemplateFolders(this.base, data);
  }

  /**
   * List child templates (`GET /message_template_folders/{message_template_folder_id}/message_templates`).
   * The OpenAPI spec types the `200` body like {@link listChildFolders}; callers should rely on the live API shape.
   *
   * **Required scope:** `message_templates:read`
   */
  async listChildTemplates(
    folderId?: string,
  ): Promise<WithNormalizedPagination<ListFoldersResponse>> {
    if (folderId !== undefined) {
      return await this.target(folderId).listChildTemplates();
    }
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
  ): Promise<FrontMessageTemplates>;
  async createChildTemplate(
    folderId: string,
    body: components["schemas"]["CreateMessageTemplateAsChild"],
  ): Promise<FrontMessageTemplates>;
  async createChildTemplate(
    bodyOrFolderId: components["schemas"]["CreateMessageTemplateAsChild"] | string,
    directBody?: components["schemas"]["CreateMessageTemplateAsChild"],
  ): Promise<FrontMessageTemplates> {
    if (typeof bodyOrFolderId === "string") {
      if (directBody === undefined) {
        throw new Error("Creating a child template requires a request body.");
      }
      return await this.target(bodyOrFolderId).createChildTemplate(directBody);
    }
    const path = FrontBase.expandPath(
      "/message_template_folders/{message_template_folder_id}/message_templates",
      { message_template_folder_id: this.id },
    );
    const data = await this.base.requestJson<components["schemas"]["MessageTemplateResponse"]>(
      "POST",
      path,
      { body: bodyOrFolderId },
    );
    return new FrontMessageTemplates(this.base, data);
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
  async create(body: CreateMessageTemplateFolder): Promise<FrontMessageTemplateFolders> {
    const data = await this.base.requestJson<MessageTemplateFolderResponse>(
      "POST",
      "/message_template_folders",
      { body },
    );
    return new FrontMessageTemplateFolders(this.base, data);
  }

  /**
   * Fetch one folder (`GET /message_template_folders/{message_template_folder_id}`).
   *
   * **Required scope:** `message_templates:read`
   */
  async get(folderId: string): Promise<FrontMessageTemplateFolders> {
    return await this.target(folderId).refresh();
  }

  /** Target a message template folder by id without calling the API first. */
  private target(folderId: string): FrontMessageTemplateFolders {
    return new FrontMessageTemplateFolders(this.base, undefined, folderId);
  }
}
