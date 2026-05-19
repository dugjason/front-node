import type { FrontBase } from "../base";
import type { components } from "../gen/schema.gen";

export type IdentityResponse = components["schemas"]["IdentityResponse"];

type ApiTokenDetailsResponse = components["responses"]["identity"]["content"]["application/json"];

/**
 * API token / identity (`GET /me`).
 *
 * @see https://dev.frontapp.com/reference/me
 */
export class FrontMe {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * Fetch API token details (`GET /me`).
   */
  async details(): Promise<ApiTokenDetailsResponse> {
    return await this.base.requestJson<ApiTokenDetailsResponse>("GET", "/me");
  }
}
