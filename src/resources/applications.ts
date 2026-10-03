import type { FrontBase } from "../base";
import type { OperationParams, OperationResponse } from "../operation";

export type TriggerApplicationEventParams = NonNullable<
  OperationParams<"trigger-app-event">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontApplications {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** POST /applications/{application_uid}/events
   * Required scope: `feature:app_trigger`
   * @see https://dev.frontapp.com/reference/trigger-app-event
   */
  async triggerEvent(
    applicationUid: string,
    body: TriggerApplicationEventParams,
  ): Promise<OperationResponse<"trigger-app-event">> {
    return await this.base.requestOperation("trigger-app-event", {
      body,
      path: { application_uid: applicationUid },
    });
  }
}
