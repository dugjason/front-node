import type { FrontBase } from "../base";

/** Collection operations returning Front response data. */
export class FrontDownloads {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /download/{attachment_link_id}
   * Required scope: `attachments:read`
   * @see https://dev.frontapp.com/reference/download-attachment
   */
  async download(attachmentLinkId: string): Promise<Response> {
    return await this.base.requestOperationRaw("download-attachment", {
      path: { attachment_link_id: attachmentLinkId },
    });
  }
}
