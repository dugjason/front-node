import type { MessageResponse } from "../generated/types.gen"

export class FrontDraft {
  constructor(private data: MessageResponse) {}

  get id() {
    return this.data.id ?? ""
  }

  get messageUid() {
    return this.data.message_uid
  }

  get subject() {
    return this.data.subject
  }

  get body() {
    return this.data.body
  }

  get text() {
    return this.data.text
  }

  get draftMode() {
    return this.data.draft_mode
  }

  get recipients() {
    return this.data.recipients
  }

  get attachments() {
    return this.data.attachments
  }

  toJSON(): MessageResponse {
    return this.data
  }
}
