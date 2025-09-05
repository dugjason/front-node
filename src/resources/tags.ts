import { deleteTag, getTag, updateATag } from "../generated/sdk.gen"
import type { TagResponse, UpdateTag } from "../generated/types.gen"

export class FrontTag {
  constructor(private data: TagResponse) {}
  get id() {
    return this.data.id
  }
  get name() {
    return this.data.name
  }
  get description() {
    return this.data.description
  }
  get highlight() {
    return this.data.highlight
  }
  get isPrivate() {
    return this.data.is_private
  }
  get isVisibleInConversationLists() {
    return this.data.is_visible_in_conversation_lists
  }
  get createdAt() {
    return this.data.created_at
  }
  get updatedAt() {
    return this.data.updated_at
  }
  toJSON(): TagResponse {
    return this.data
  }

  async update(body: UpdateTag): Promise<FrontTag> {
    const { error } = await updateATag({
      path: { tag_id: this.id },
      body,
    })
    if (error) throw new Error("Failed to update tag")
    const { data } = await getTag({
      path: { tag_id: this.id },
    })
    if (!data) throw new Error("Failed to fetch updated tag")
    this.data = data as TagResponse
    return this
  }

  async delete(): Promise<void> {
    deleteTag({ path: { tag_id: this.id } })
  }
}
