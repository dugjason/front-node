import type { StatusResponse } from "../generated/types.gen"

export class FrontStatus {
  constructor(private data: StatusResponse) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get category() {
    return this.data.category
  }

  get description() {
    return this.data.description
  }

  get createdAt() {
    return this.data.created_at
  }

  get updatedAt() {
    return this.data.updated_at
  }

  toJSON(): StatusResponse {
    return this.data
  }
}
