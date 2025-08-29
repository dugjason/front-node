import type { TeammateResponse } from "../generated/types.gen"

export class FrontTeammate {
  constructor(private data: TeammateResponse) {}

  get id() {
    return this.data.id ?? ""
  }

  get email() {
    return this.data.email
  }

  get username() {
    return this.data.username
  }

  get firstName() {
    return this.data.first_name
  }

  get lastName() {
    return this.data.last_name
  }

  get isAdmin() {
    return this.data.is_admin
  }

  get isAvailable() {
    return this.data.is_available
  }

  get isBlocked() {
    return this.data.is_blocked
  }

  get type() {
    return this.data.type
  }

  get customFields() {
    return this.data.custom_fields
  }

  toJSON() {
    return this.data
  }
}
