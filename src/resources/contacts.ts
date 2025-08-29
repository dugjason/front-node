import type { ContactResponse } from "../generated/types.gen"

export class FrontContact {
  constructor(private data: ContactResponse) {}
  get id() {
    return this.data.id ?? ""
  }
  get name() {
    return this.data.name
  }
  get description() {
    return this.data.description
  }
  get avatarUrl() {
    return this.data.avatar_url
  }
  get links() {
    return this.data.links
  }
  get lists() {
    return this.data.lists
  }
  get handles() {
    return this.data.handles
  }
  get customFields() {
    return this.data.custom_fields
  }
  get isPrivate() {
    return this.data.is_private
  }
  toJSON() {
    return this.data
  }
}
