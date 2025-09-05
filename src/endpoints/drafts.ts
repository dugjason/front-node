import { APIResource } from "../core/resource"
import { deleteDraft, editDraft } from "../generated/sdk.gen"
import type {
  EditDraftData,
  EditDraftResponse,
  MessageResponse,
} from "../generated/types.gen"
import { FrontDraft } from "../resources/drafts"

export class Drafts extends APIResource<FrontDraft, MessageResponse> {
  protected makeItem(raw: MessageResponse): FrontDraft {
    return new FrontDraft(raw)
  }

  async update(
    draftId: string,
    body: EditDraftData["body"],
  ): Promise<{ draft: FrontDraft; response: Response }> {
    const { response, data } = await editDraft({
      path: { message_id: draftId },
      body,
    })
    // editDraft returns the updated Message as body
    const updated = data as EditDraftResponse | undefined
    if (!updated) throw new Error("Missing data")
    return { draft: this.makeItem(updated), response }
  }

  async delete(draftId: string, version?: string | number): Promise<void> {
    await deleteDraft({
      path: { draft_id: draftId },
      body: version !== undefined ? { version: String(version) } : undefined,
    })
  }
}
