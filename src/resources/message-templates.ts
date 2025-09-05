import {
  deleteMessageTemplate,
  getMessageTemplate,
  updateMessageTemplate,
} from "../generated/sdk.gen"
import type {
  MessageTemplateResponse,
  UpdateMessageTemplate,
} from "../generated/types.gen"

export class FrontMessageTemplate {
  constructor(private data: MessageTemplateResponse) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get subject() {
    return this.data.subject
  }

  get body() {
    return this.data.body
  }

  get attachments() {
    return this.data.attachments
  }

  get isAvailableForAllInboxes() {
    return this.data.is_available_for_all_inboxes
  }

  get inboxIds() {
    return this.data.inbox_ids
  }

  toJSON(): MessageTemplateResponse {
    return this.data
  }

  async update(body: UpdateMessageTemplate): Promise<FrontMessageTemplate> {
    const { error } = await updateMessageTemplate({
      path: { message_template_id: this.id },
      body,
    })
    if (error) throw new Error("Failed to update message template")
    const { data } = await getMessageTemplate({
      path: { message_template_id: this.id },
    })
    if (!data) throw new Error("Failed to fetch updated message template")
    this.data = data as MessageTemplateResponse
    return this
  }

  async delete(): Promise<void> {
    deleteMessageTemplate({ path: { message_template_id: this.id } })
  }
}
