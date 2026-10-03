import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type ViewResponse = components["schemas"]["SharedViewResponse"];

export type ListViewsParams = OperationListParams<"list-views">;
export type UpdateViewParams = NonNullable<OperationParams<"update-view">["body"]>;
export type AddViewTeammatesParams = NonNullable<OperationParams<"add-view-teammates">["body"]>;

/** Collection operations returning Front response data. */
export class FrontViews {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /views
   * Required scope: `views:read`
   * @see https://dev.frontapp.com/reference/list-views
   */
  async list(params?: ListViewsParams): Promise<OperationResponse<"list-views">> {
    return await this.base.requestOperation("list-views", {
      nextPageUrl: params?.nextPageUrl,
      query: params,
    });
  }

  /** GET /views/{view_id}
   * Required scope: `views:read`
   * @see https://dev.frontapp.com/reference/get-view
   */
  async get(viewId: string): Promise<OperationResponse<"get-view">> {
    return await this.base.requestOperation("get-view", { path: { view_id: viewId } });
  }

  /** PATCH /views/{view_id}
   * Required scope: `views:write`
   * @see https://dev.frontapp.com/reference/update-view
   */
  async update(viewId: string, body: UpdateViewParams): Promise<OperationResponse<"update-view">> {
    return await this.base.requestOperation("update-view", { body, path: { view_id: viewId } });
  }

  /** POST /views/{view_id}/teammates
   * Required scope: `views:write`
   * @see https://dev.frontapp.com/reference/add-view-teammates
   */
  async addTeammates(
    viewId: string,
    body: AddViewTeammatesParams,
  ): Promise<OperationResponse<"add-view-teammates">> {
    return await this.base.requestOperation("add-view-teammates", {
      body,
      path: { view_id: viewId },
    });
  }
}
