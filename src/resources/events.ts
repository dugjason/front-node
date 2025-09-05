import type { EventResponse } from "../generated/types.gen"

export class FrontEvent {
  constructor(private data: EventResponse) {}

  get id() {
    return this.data.id ?? ""
  }

  get type() {
    return this.data.type
  }

  get emittedAt() {
    return this.data.emitted_at
  }

  get source() {
    return this.data.source
  }

  get target() {
    return this.data.target
  }

  get conversation() {
    return this.data.conversation
  }

  toJSON(): EventResponse {
    return this.data
  }
}
