import { deleteFolder, getFolder, updateFolder } from "../generated/sdk.gen"
import type {
  MessageTemplateFolderResponse,
  UpdateMessageTemplateFolder,
} from "../generated/types.gen"

export class FrontMessageTemplateFolder {
  constructor(private data: MessageTemplateFolderResponse) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get createdAt() {
    return this.data.created_at
  }

  get updatedAt() {
    return this.data.updated_at
  }

  toJSON(): MessageTemplateFolderResponse {
    return this.data
  }

  async update(
    body: UpdateMessageTemplateFolder,
  ): Promise<FrontMessageTemplateFolder> {
    const { error } = await updateFolder({
      path: { message_template_folder_id: this.id },
      body,
    })
    if (error) throw new Error("Failed to update message template folder")
    const { data } = await getFolder({
      path: { message_template_folder_id: this.id },
    })
    if (!data)
      throw new Error("Failed to fetch updated message template folder")
    this.data = data
    return this
  }

  async delete(): Promise<void> {
    deleteFolder({ path: { message_template_folder_id: this.id } })
  }
}
