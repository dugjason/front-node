import { FrontBase } from "../base";
import type { components } from "../gen/schema.gen";

export type AppEvent = components["schemas"]["AppEvent"];

/**
 * Application trigger API (`POST /applications/{application_uid}/events`).
 *
 * @see https://dev.frontapp.com/docs/application-triggers#/
 */
export class FrontApplications {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * Trigger an application event (`POST /applications/{application_uid}/events`). Returns `204` with no body.
   *
   * **Required scope:** `feature:app_trigger`
   */
  async triggerEvent(applicationUid: string, body: AppEvent): Promise<void> {
    const path = FrontBase.expandPath("/applications/{application_uid}/events", {
      application_uid: applicationUid,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }
}
