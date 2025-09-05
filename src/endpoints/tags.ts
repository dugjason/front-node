import type { PagePair } from "../core/paginator"
import { APIResource } from "../core/resource"
import {
  createTag,
  deleteTag,
  getTag,
  listTagChildren,
  listTags,
  updateATag,
} from "../generated/sdk.gen"
import type {
  CreateTag,
  GetTagResponse,
  ListTagChildrenResponse,
  ListTagsData,
  ListTagsResponse,
  TagResponse,
  UpdateTag,
} from "../generated/types.gen"
import { FrontTag } from "../resources/tags"

export class Tags extends APIResource<FrontTag, TagResponse> {
  protected makeItem(raw: TagResponse): FrontTag {
    return new FrontTag(raw)
  }

  /** CREATE **/
  async create(
    body: CreateTag,
  ): Promise<{ tag: FrontTag; response: Response }> {
    const { item, response } = await this.createOne<TagResponse>({
      createCall: () => createTag({ body }),
    })
    return { tag: item, response }
  }

  /** READ **/

  async get(tagId: string): Promise<{ tag: FrontTag; response: Response }> {
    const { item, response } = await this.getOne<GetTagResponse>({
      getCall: () =>
        getTag({
          path: { tag_id: tagId },
        }),
    })
    return { tag: item, response }
  }

  async list(
    query?: ListTagsData["query"],
  ): Promise<PagePair<FrontTag> & AsyncIterable<PagePair<FrontTag>>> {
    return this.listPaginated<
      ListTagsResponse,
      {
        query?: ListTagsData["query"]
      }
    >({
      initialOptions: { query },
      listCall: (options) => listTags({ ...options }),
    })
  }

  async listTagChildren(
    tagId: string,
  ): Promise<{ response: Response; data: FrontTag[] }> {
    return this.listWithoutPagination<ListTagChildrenResponse>({
      listCall: () => listTagChildren({ path: { tag_id: tagId } }),
    })
  }

  /** UPDATE **/

  async update(
    tagId: string,
    body: UpdateTag,
  ): Promise<{ tag: FrontTag; response: Response }> {
    const { response } = await updateATag({
      path: { tag_id: tagId },
      body,
    })
    const { tag } = await this.get(tagId)
    return { tag, response }
  }

  /** DELETE **/

  async delete(tagId: string): Promise<void> {
    deleteTag({ path: { tag_id: tagId } })
  }
}
