import type { PagePair } from "../core/paginator"
import { buildPageFromListResponse, makePagedResult } from "../core/paginator"
import { APIResource } from "../core/resource"
import {
  createChildFolder,
  createChildTemplate,
  createFolder,
  deleteFolder,
  getChildFolders,
  getChildTemplates,
  getFolder,
  listFolders,
  updateFolder,
} from "../generated/sdk.gen"
import type {
  CreateChildFolderData,
  CreateChildTemplateData,
  CreateFolderData,
  GetChildFoldersResponse,
  GetChildTemplatesResponse,
  GetFolderResponse,
  ListFoldersData,
  ListFoldersResponse,
  MessageTemplateFolderResponse,
  MessageTemplateResponse,
  UpdateMessageTemplateFolder,
} from "../generated/types.gen"
import { FrontMessageTemplateFolder } from "../resources/message-template-folders"
import { FrontMessageTemplate } from "../resources/message-templates"

export class MessageTemplateFolders extends APIResource<
  FrontMessageTemplateFolder,
  MessageTemplateFolderResponse
> {
  protected makeItem(
    raw: MessageTemplateFolderResponse,
  ): FrontMessageTemplateFolder {
    return new FrontMessageTemplateFolder(raw)
  }

  /** CREATE **/
  async create(
    body: CreateFolderData["body"],
  ): Promise<{ folder: FrontMessageTemplateFolder; response: Response }> {
    const { item, response } =
      await this.createOne<MessageTemplateFolderResponse>({
        createCall: () => createFolder({ body }),
      })
    return { folder: item, response }
  }

  /** READ **/
  async list(
    query?: ListFoldersData["query"],
  ): Promise<
    PagePair<FrontMessageTemplateFolder> &
      AsyncIterable<PagePair<FrontMessageTemplateFolder>>
  > {
    const { response, data } = await listFolders({ query })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontMessageTemplateFolder,
      ListFoldersResponse
    >({
      data,
      mapItems: (d) =>
        (d._results ?? []).map((raw) => new FrontMessageTemplateFolder(raw)),
      fetchNext: async (pageToken) => {
        const next = await listFolders({
          query: {
            ...(query ?? {}),
            page_token: pageToken,
          } as unknown as ListFoldersData["query"],
        })
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  async get(
    folderId: string,
  ): Promise<{ folder: FrontMessageTemplateFolder; response: Response }> {
    const { item, response } = await this.getOne<GetFolderResponse>({
      getCall: () =>
        getFolder({ path: { message_template_folder_id: folderId } }),
    })
    return { folder: item, response }
  }

  /** UPDATE **/
  async update(
    folderId: string,
    body: UpdateMessageTemplateFolder,
  ): Promise<{ folder: FrontMessageTemplateFolder; response: Response }> {
    const { response } = await updateFolder({
      path: { message_template_folder_id: folderId },
      body,
    })
    const refreshed = await this.get(folderId)
    return { folder: refreshed.folder, response }
  }

  /** DELETE **/
  async delete(folderId: string): Promise<void> {
    deleteFolder({ path: { message_template_folder_id: folderId } })
  }

  /** CHILD COLLECTIONS **/
  async listChildFolders(
    folderId: string,
  ): Promise<
    PagePair<FrontMessageTemplateFolder> &
      AsyncIterable<PagePair<FrontMessageTemplateFolder>>
  > {
    const { response, data } = await getChildFolders({
      path: { message_template_folder_id: folderId },
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontMessageTemplateFolder,
      GetChildFoldersResponse
    >({
      data,
      mapItems: (d) =>
        (d._results ?? []).map((raw) => new FrontMessageTemplateFolder(raw)),
      fetchNext: async (pageToken) => {
        const next = await getChildFolders({
          path: { message_template_folder_id: folderId },
          query: { page_token: pageToken },
        } as unknown as Parameters<typeof getChildFolders>[0])
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  async createChildFolder(
    folderId: string,
    body: CreateChildFolderData["body"],
  ): Promise<{ folder: FrontMessageTemplateFolder; response: Response }> {
    const { item, response } =
      await this.createOne<MessageTemplateFolderResponse>({
        createCall: () =>
          createChildFolder({
            path: { message_template_folder_id: folderId },
            body,
          }),
      })
    return { folder: item, response }
  }

  async listChildTemplates(
    folderId: string,
  ): Promise<
    PagePair<FrontMessageTemplate> &
      AsyncIterable<PagePair<FrontMessageTemplate>>
  > {
    const { response, data } = await getChildTemplates({
      path: { message_template_folder_id: folderId },
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontMessageTemplate,
      GetChildTemplatesResponse
    >({
      data,
      mapItems: (d) =>
        (d._results ?? []).map(
          (raw) => new FrontMessageTemplate(raw as MessageTemplateResponse),
        ),
      fetchNext: async (pageToken) => {
        const next = await getChildTemplates({
          path: { message_template_folder_id: folderId },
          query: { page_token: pageToken },
        } as unknown as Parameters<typeof getChildTemplates>[0])
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  async createChildTemplate(
    folderId: string,
    body: CreateChildTemplateData["body"],
  ): Promise<{ messageTemplate: FrontMessageTemplate; response: Response }> {
    const { response, data } = await createChildTemplate({
      path: { message_template_folder_id: folderId },
      body,
    })
    if (!data) throw new Error("Missing data")
    return { messageTemplate: new FrontMessageTemplate(data), response }
  }
}
