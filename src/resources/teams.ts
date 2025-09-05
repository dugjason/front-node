import type { TeamPreviewResponse, TeamResponse } from "../generated/types.gen"

function isFullTeam(
  data: TeamResponse | TeamPreviewResponse,
): data is TeamResponse {
  return (
    typeof (data as TeamResponse).id === "string" &&
    Array.isArray((data as TeamResponse).inboxes)
  )
}

export class FrontTeam {
  constructor(private data: TeamResponse | TeamPreviewResponse) {}

  get id() {
    return this.data.id ?? ""
  }

  get name() {
    return this.data.name
  }

  // Only present on full TeamResponse
  get inboxes() {
    return isFullTeam(this.data) ? this.data.inboxes : undefined
  }

  // Only present on full TeamResponse
  get members() {
    return isFullTeam(this.data) ? this.data.members : undefined
  }

  toJSON() {
    return this.data
  }
}
