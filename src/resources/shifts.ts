import type { ShiftResponse } from "../generated/types.gen"

export class FrontShift {
  constructor(private data: ShiftResponse) {}

  get id() {
    return this.data.id ?? ""
  }

  get name() {
    return this.data.name
  }

  get color() {
    return this.data.color
  }

  get timezone() {
    return this.data.timezone
  }

  get times() {
    return this.data.times
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
