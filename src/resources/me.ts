import type { FrontBase } from "../base";
import type { OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type IdentityResponse = components["schemas"]["IdentityResponse"];

/** Collection operations returning Front response data. */
export class FrontMe {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /me
   * @see https://dev.frontapp.com/reference/api-token-details
   */
  async details(): Promise<OperationResponse<"api-token-details">> {
    return await this.base.requestOperation("api-token-details");
  }
}
