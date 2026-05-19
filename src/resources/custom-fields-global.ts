import type { FrontBase } from "../base";
import type { components } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";

type ListCustomFieldsResponse =
  components["responses"]["listOfCustomFields"]["content"]["application/json"];

/**
 * Deprecated global custom fields list (`GET /custom_fields`, same shape as contact custom fields).
 *
 * **Required scope:** `custom_fields:read`
 *
 * @see https://dev.frontapp.com/reference/list-contacts-custom-fields
 */
export class FrontCustomFieldsGlobal {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List custom fields (`GET /custom_fields`).
   *
   * **Required scope:** `custom_fields:read`
   */
  async list(): Promise<WithNormalizedPagination<ListCustomFieldsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListCustomFieldsResponse>>(
      "GET",
      "/custom_fields",
    );
  }
}
