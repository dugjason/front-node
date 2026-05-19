import { FrontBase } from "../base";

/**
 * Attachment download by link id (`GET /download/{attachment_link_id}`).
 *
 * **Required scope:** `attachments:read`
 *
 * @see https://dev.frontapp.com/reference/download-attachment
 */
export class FrontDownloads {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * Download an attachment (`GET /download/{attachment_link_id}`). Returns the raw `Response` (binary body not parsed as JSON).
   *
   * **Required scope:** `attachments:read`
   */
  async download(attachmentLinkId: string): Promise<Response> {
    const path = FrontBase.expandPath("/download/{attachment_link_id}", {
      attachment_link_id: attachmentLinkId,
    });
    return await this.base.requestWithoutParsingBody("GET", path);
  }
}
