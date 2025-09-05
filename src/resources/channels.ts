import type { ChannelResponse } from "../generated/types.gen"

export class FrontChannel {
  constructor(private data: ChannelResponse) {}

  get id() {
    return this.data.id ?? ""
  }

  get name() {
    return this.data.name
  }

  get address() {
    return this.data.address
  }

  // The API field is `types`; expose as `type` for ergonomic access
  get type() {
    return this.data.types
  }

  get sendAs() {
    return this.data.send_as
  }

  get settings() {
    return this.data.settings
  }

  get isPrivate() {
    return this.data.is_private
  }

  get isValid() {
    return this.data.is_valid
  }

  toJSON(): ChannelResponse {
    return this.data
  }
}
