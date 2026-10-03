import type { FrontBase } from "../base";
import type { OperationParams, OperationResponse } from "../operation";

export type DeleteDraftParams = NonNullable<OperationParams<"delete-draft">["body"]>;
export type EditDraftParams = NonNullable<OperationParams<"edit-draft">["body"]>;

/** Collection operations returning Front response data. */
export class FrontDrafts {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** DELETE /drafts/{draft_id}
   * Required scope: `drafts:delete`
   * @see https://dev.frontapp.com/reference/delete-draft
   */
  async delete(
    draftId: string,
    body?: DeleteDraftParams,
  ): Promise<OperationResponse<"delete-draft">> {
    return await this.base.requestOperation("delete-draft", { body, path: { draft_id: draftId } });
  }

  /** PATCH /drafts/{message_id}
   * Required scope: `drafts:write`
   * @see https://dev.frontapp.com/reference/edit-draft
   */
  async edit(messageId: string, body: EditDraftParams): Promise<OperationResponse<"edit-draft">> {
    return await this.base.requestOperation("edit-draft", {
      body,
      path: { message_id: messageId },
    });
  }
}
