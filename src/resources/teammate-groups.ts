import type { TeammateGroupResponse } from "../generated/types.gen"

export class FrontTeammateGroup {
  constructor(private data: TeammateGroupResponse) {}

  get id() {
    return this.data.id ?? ""
  }

  get name() {
    return this.data.name
  }

  get description() {
    return this.data.description ?? null
  }

  get isManagedByScim() {
    return this.data.is_managed_by_scim ?? false
  }

  get permissions() {
    return this.data.permissions
  }

  toJSON() {
    return this.data
  }
}
