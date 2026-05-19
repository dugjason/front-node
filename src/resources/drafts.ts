import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";

export type DeleteDraft = components["schemas"]["DeleteDraft"];
export type EditDraft = components["schemas"]["EditDraft"];

type EditDraftMessageResponse =
  operations["edit-draft"]["responses"][200]["content"]["application/json"];

/**
 * Standalone draft delete and edit (`DELETE /drafts/{draft_id}`, `PATCH /drafts/{message_id}/`).
 *
 * @see https://dev.frontapp.com/reference/delete-draft
 * @see https://dev.frontapp.com/reference/edit-draft
 */
export class FrontDrafts {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * Delete a draft (`DELETE /drafts/{draft_id}`).
   *
   * **Required scope:** `drafts:delete`
   */
  async delete(draftId: string, body?: DeleteDraft): Promise<void> {
    const path = FrontBase.expandPath("/drafts/{draft_id}", {
      draft_id: draftId,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }

  /**
   * Edit a draft (`PATCH /drafts/{message_id}/`). The path keeps a trailing slash after the message id.
   *
   * **Required scope:** `drafts:write`
   */
  async edit(messageId: string, body: EditDraft): Promise<EditDraftMessageResponse> {
    const path = FrontBase.expandPath("/drafts/{message_id}/", {
      message_id: messageId,
    });
    return await this.base.requestJson<EditDraftMessageResponse>("PATCH", path, {
      body,
    });
  }
}
