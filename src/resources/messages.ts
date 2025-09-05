import type { MessageResponse } from "../generated/types.gen"

export class FrontMessage {
  constructor(private data: MessageResponse) {}

  get id() {
    return this.data.id ?? ""
  }

  get messageUid() {
    return this.data.message_uid
  }

  get type() {
    return this.data.type
  }

  get isInbound() {
    return this.data.is_inbound
  }

  get draftMode() {
    return this.data.draft_mode
  }

  get createdAt() {
    return this.data.created_at
  }

  get subject() {
    return this.data.subject
  }

  get blurb() {
    return this.data.blurb
  }

  get author() {
    return this.data.author
  }

  get recipients() {
    return this.data.recipients
  }

  get body() {
    return this.data.body
  }

  get text() {
    return this.data.text
  }

  get attachments() {
    return this.data.attachments
  }

  get signature() {
    return this.data.signature
  }

  get metadata() {
    return this.data.metadata
  }

  toJSON(): MessageResponse {
    return this.data
  }
}
