import { APIResource } from "../core/resource"
import { triggerAppEvent } from "../generated/sdk.gen"
import type { AppEvent, TriggerAppEventData } from "../generated/types.gen"
import { FrontApplication } from "../resources/applications"

export class Applications extends APIResource<
  FrontApplication,
  { uid: string }
> {
  protected makeItem(raw: { uid: string }): FrontApplication {
    return new FrontApplication(raw.uid)
  }

  /** ACTIONS **/
  async triggerEvent(
    applicationUid: string,
    body: AppEvent,
  ): Promise<{ response: Response }> {
    const { response } = await triggerAppEvent({
      path: { application_uid: applicationUid },
      body,
    } as TriggerAppEventData)
    return { response }
  }
}
