import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";

export type ViewResponse = components["schemas"]["SharedViewResponse"];
export type UpdateView = components["schemas"]["UpdateView"];

type ListViewsQuery = NonNullable<operations["list-views"]["parameters"]["query"]>;

type ListViewsResponse = operations["list-views"]["responses"][200]["content"]["application/json"];

type AddViewTeammatesBody = NonNullable<
  NonNullable<operations["add-view-teammates"]["requestBody"]>["content"]
>["application/json"];

const queryFromListViews = (q?: ListViewsQuery): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.limit !== undefined) {
    out.limit = String(q.limit);
  }
  if (q.page_token !== undefined) {
    out.page_token = String(q.page_token);
  }
  return out;
};

const mergeViewSnapshot = (current: ViewResponse, patch: Partial<UpdateView>): ViewResponse => {
  const filtered = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Partial<UpdateView>;
  let next: ViewResponse = { ...current, ...filtered };
  if (Object.hasOwn(patch, "highlight")) {
    next = {
      ...next,
      highlight: patch.highlight ?? null,
    };
  }
  return next;
};

const viewResponseToUpdateBody = (state: ViewResponse): UpdateView => ({
  assignee_ids: state.assignee_ids,
  highlight: state.highlight ?? undefined,
  inbox_ids: state.inbox_ids,
  name: state.name,
  no_tags: state.no_tags,
  not_assignee_ids: state.not_assignee_ids,
  not_tag_ids: state.not_tag_ids,
  tag_ids: state.tag_ids,
});

/**
 * One shared view (`/views/{view_id}` and `POST /views/{view_id}/teammates`).
 *
 * Writable fields follow {@link UpdateView}. Read-only: `id`, `links`.
 * `PATCH` returns `204`; {@link update} and {@link save} merge the request into local state.
 *
 * @see https://dev.frontapp.com/reference/views
 */
export class FrontViews extends FrontResource<ViewResponse, UpdateView> {
  protected selfPath(): string {
    return FrontBase.expandPath("/views/{view_id}", { view_id: this.id });
  }

  get name(): string {
    return this.pick("name");
  }

  set name(value: string) {
    this.assign("name", value);
  }

  get highlight(): string | null {
    return this.pick("highlight");
  }

  set highlight(value: string | null) {
    this.assign("highlight", value);
  }

  get inboxIds(): string[] {
    return this.pick("inbox_ids");
  }

  set inboxIds(value: string[]) {
    this.assign("inbox_ids", value);
  }

  get tagIds(): string[] {
    return this.pick("tag_ids");
  }

  set tagIds(value: string[]) {
    this.assign("tag_ids", value);
  }

  get notTagIds(): string[] {
    return this.pick("not_tag_ids");
  }

  set notTagIds(value: string[]) {
    this.assign("not_tag_ids", value);
  }

  get noTags(): boolean {
    return this.pick("no_tags");
  }

  set noTags(value: boolean) {
    this.assign("no_tags", value);
  }

  get assigneeIds(): string[] {
    return this.pick("assignee_ids");
  }

  set assigneeIds(value: string[]) {
    this.assign("assignee_ids", value);
  }

  get notAssigneeIds(): string[] {
    return this.pick("not_assignee_ids");
  }

  set notAssigneeIds(value: string[]) {
    this.assign("not_assignee_ids", value);
  }

  toUpdateBody(): UpdateView {
    return viewResponseToUpdateBody(this.state);
  }

  /**
   * Update this view (`PATCH /views/{view_id}`). Returns `204`; local state is merged.
   *
   * **Required scope:** `views:write`
   *
   * @see https://dev.frontapp.com/reference/update-view
   */
  async update(body: UpdateView | Partial<UpdateView>): Promise<void>;
  async update(viewId: string, body: UpdateView | Partial<UpdateView>): Promise<void>;
  async update(
    bodyOrViewId: string | UpdateView | Partial<UpdateView>,
    body?: UpdateView | Partial<UpdateView>,
  ): Promise<void> {
    if (typeof bodyOrViewId === "string") {
      if (body === undefined) {
        throw new Error("Updating a view by ID requires a request body.");
      }
      await this.target(bodyOrViewId).update(body);
      return;
    }
    await this.patchNoContent(bodyOrViewId, mergeViewSnapshot);
  }

  /**
   * Add this view to teammates' sidebars (`POST /views/{view_id}/teammates`).
   *
   * **Required scope:** `views:write`
   *
   * @see https://dev.frontapp.com/reference/add-view-teammates
   */
  async addTeammates(body: AddViewTeammatesBody): Promise<void> {
    const path = FrontBase.expandPath("/views/{view_id}/teammates", {
      view_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }
  /**
   * Views under `/views`.
   *
   * @see https://dev.frontapp.com/reference/views
   */
  /**
   * List views (`GET /views`).
   *
   * **Required scope:** `views:read`
   *
   * @param query Optional pagination (`limit`, `page_token`).
   * @see https://dev.frontapp.com/reference/list-views
   */
  async list(query?: ListViewsQuery): Promise<WithNormalizedPagination<ListViewsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListViewsResponse>>(
      "GET",
      "/views",
      { query: queryFromListViews(query) },
    );
  }

  /**
   * Fetch one view (`GET /views/{view_id}`).
   *
   * **Required scope:** `views:read`
   *
   * @see https://dev.frontapp.com/reference/get-view
   */
  async get(viewId: string): Promise<FrontViews> {
    const view = this.target(viewId);
    await view.refresh();
    return view;
  }

  /** Target a view by id without calling the API first. */
  private target(viewId: string): FrontViews {
    return new FrontViews(this.base, undefined, viewId);
  }
}
