import type { RuleResponse } from "../generated/types.gen"

export class FrontRule {
  constructor(private data: RuleResponse) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get actions() {
    return this.data.actions
  }

  get isPrivate() {
    return this.data.is_private
  }

  toJSON() {
    return this.data
  }
}
