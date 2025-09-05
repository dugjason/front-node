import type { AccountResponse } from "../generated/types.gen"

export class FrontAccount {
  constructor(private data: AccountResponse) {}

  get id() {
    return this.data.id ?? ""
  }

  get name() {
    return this.data.name
  }

  get logoUrl() {
    return this.data.logo_url
  }

  get description() {
    return this.data.description
  }

  get domains() {
    return this.data.domains
  }

  get externalId() {
    return this.data.external_id
  }

  get customFields() {
    return this.data.custom_fields
  }

  get createdAt() {
    return this.data.created_at
  }

  get updatedAt() {
    return this.data.updated_at
  }

  toJSON() {
    return this.data
  }
}
