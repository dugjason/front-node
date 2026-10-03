import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type MessageTemplateFolderResponse = components["schemas"]["MessageTemplateFolderResponse"];

export type ListMessageTemplateFoldersParams = OperationListParams<"list-folders">;
export type CreateMessageTemplateFolderParams = NonNullable<
  OperationParams<"create-folder">["body"]
>;
export type UpdateMessageTemplateFolderParams = NonNullable<
  OperationParams<"update-folder">["body"]
>;
export type CreateMessageTemplateFolderChildFolderParams = NonNullable<
  OperationParams<"create-child-folder">["body"]
>;
export type CreateMessageTemplateFolderChildTemplateParams = NonNullable<
  OperationParams<"create-child-template">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontMessageTemplateFolders {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /message_template_folders
   * Required scope: `message_templates:read`
   * @see https://dev.frontapp.com/reference/list-folders
   */
  async list(
    params?: ListMessageTemplateFoldersParams,
  ): Promise<OperationResponse<"list-folders">> {
    return await this.base.requestOperation("list-folders", { query: params });
  }

  /** POST /message_template_folders
   * Required scope: `message_templates:write`
   * @see https://dev.frontapp.com/reference/create-folder
   */
  async create(
    body: CreateMessageTemplateFolderParams,
  ): Promise<OperationResponse<"create-folder">> {
    return await this.base.requestOperation("create-folder", { body });
  }

  /** GET /message_template_folders/{message_template_folder_id}
   * Required scope: `message_templates:read`
   * @see https://dev.frontapp.com/reference/get-folder
   */
  async get(messageTemplateFolderId: string): Promise<OperationResponse<"get-folder">> {
    return await this.base.requestOperation("get-folder", {
      path: { message_template_folder_id: messageTemplateFolderId },
    });
  }

  /** PATCH /message_template_folders/{message_template_folder_id}
   * Required scope: `message_templates:write`
   * @see https://dev.frontapp.com/reference/update-folder
   */
  async update(
    messageTemplateFolderId: string,
    body: UpdateMessageTemplateFolderParams,
  ): Promise<OperationResponse<"update-folder">> {
    return await this.base.requestOperation("update-folder", {
      body,
      path: { message_template_folder_id: messageTemplateFolderId },
    });
  }

  /** DELETE /message_template_folders/{message_template_folder_id}
   * Required scope: `message_templates:delete`
   * @see https://dev.frontapp.com/reference/delete-folder
   */
  async delete(messageTemplateFolderId: string): Promise<OperationResponse<"delete-folder">> {
    return await this.base.requestOperation("delete-folder", {
      path: { message_template_folder_id: messageTemplateFolderId },
    });
  }

  /** GET /message_template_folders/{message_template_folder_id}/message_template_folders
   * Required scope: `message_templates:read`
   * @see https://dev.frontapp.com/reference/get-child-folders
   */
  async listChildFolders(
    messageTemplateFolderId: string,
  ): Promise<OperationResponse<"get-child-folders">> {
    return await this.base.requestOperation("get-child-folders", {
      path: { message_template_folder_id: messageTemplateFolderId },
    });
  }

  /** POST /message_template_folders/{message_template_folder_id}/message_template_folders
   * Required scope: `message_templates:write`
   * @see https://dev.frontapp.com/reference/create-child-folder
   */
  async createChildFolder(
    messageTemplateFolderId: string,
    body: CreateMessageTemplateFolderChildFolderParams,
  ): Promise<OperationResponse<"create-child-folder">> {
    return await this.base.requestOperation("create-child-folder", {
      body,
      path: { message_template_folder_id: messageTemplateFolderId },
    });
  }

  /** GET /message_template_folders/{message_template_folder_id}/message_templates
   * Required scope: `message_templates:read`
   * @see https://dev.frontapp.com/reference/get-child-templates
   */
  async listChildTemplates(
    messageTemplateFolderId: string,
  ): Promise<OperationResponse<"get-child-templates">> {
    return await this.base.requestOperation("get-child-templates", {
      path: { message_template_folder_id: messageTemplateFolderId },
    });
  }

  /** POST /message_template_folders/{message_template_folder_id}/message_templates
   * Required scope: `message_templates:write`
   * @see https://dev.frontapp.com/reference/create-child-template
   */
  async createChildTemplate(
    messageTemplateFolderId: string,
    body: CreateMessageTemplateFolderChildTemplateParams,
  ): Promise<OperationResponse<"create-child-template">> {
    return await this.base.requestOperation("create-child-template", {
      body,
      path: { message_template_folder_id: messageTemplateFolderId },
    });
  }
}
