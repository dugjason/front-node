import type { InboxResponse } from "../generated/types.gen"

export class FrontInbox {
  constructor(private data: InboxResponse) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get isPrivate() {
    return this.data.is_private
  }

  get isPublic() {
    return this.data.is_public
  }

  get customFields() {
    return this.data.custom_fields
  }

  toJSON(): InboxResponse {
    return this.data
  }
}
