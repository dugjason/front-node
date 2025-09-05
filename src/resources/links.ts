import type { LinkResponse } from "../generated/types.gen"

export class FrontLink {
  constructor(private data: LinkResponse) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get type() {
    return this.data.type
  }

  get externalUrl() {
    return this.data.external_url
  }

  get customFields() {
    return this.data.custom_fields
  }

  toJSON(): LinkResponse {
    return this.data
  }
}
