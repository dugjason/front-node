import type { ConversationResponse } from "../generated/types.gen"

export class FrontConversation {
  constructor(private data: ConversationResponse) {}

  get id() {
    return this.data.id ?? ""
  }

  get subject() {
    return this.data.subject
  }

  get status() {
    return this.data.status
  }

  get statusId() {
    return this.data.status_id
  }

  get statusCategory() {
    return this.data.status_category
  }

  get assignee() {
    return this.data.assignee
  }

  get recipient() {
    return this.data.recipient
  }

  get tags() {
    return this.data.tags
  }

  get links() {
    return this.data.links
  }

  get customFields() {
    return this.data.custom_fields
  }

  get createdAt() {
    return this.data.created_at
  }

  get waitingSince() {
    return this.data.waiting_since
  }

  get isPrivate() {
    return this.data.is_private
  }

  get scheduledReminders() {
    return this.data.scheduled_reminders
  }

  get metadata() {
    return this.data.metadata
  }

  toJSON(): ConversationResponse {
    return this.data
  }
}
