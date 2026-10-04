import type { FrontBase } from "../base";
import type { OperationParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type TimeOffResponse = components["schemas"]["TimeOffResponse"];

export type UpdateTimeOffParams = NonNullable<OperationParams<"update-time-off">["body"]>;

export class FrontTimeOffs {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /time_offs/{time_off_id}
   * Required scope: `time_off:read`
   * @see https://dev.frontapp.com/reference/get-time-off
   */
  async get(timeOffId: string): Promise<OperationResponse<"get-time-off">> {
    return await this.base.requestOperation("get-time-off", { path: { time_off_id: timeOffId } });
  }

  /** PATCH /time_offs/{time_off_id}
   * Required scope: `time_off:write`
   * @see https://dev.frontapp.com/reference/update-time-off
   */
  async update(
    timeOffId: string,
    body: UpdateTimeOffParams,
  ): Promise<OperationResponse<"update-time-off">> {
    return await this.base.requestOperation("update-time-off", {
      body,
      path: { time_off_id: timeOffId },
    });
  }

  /** DELETE /time_offs/{time_off_id}
   * Required scope: `time_off:delete`
   * @see https://dev.frontapp.com/reference/delete-time-off
   */
  async delete(timeOffId: string): Promise<OperationResponse<"delete-time-off">> {
    return await this.base.requestOperation("delete-time-off", {
      path: { time_off_id: timeOffId },
    });
  }
}
