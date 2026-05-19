import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";
import { FrontTeammate } from "./teammates";

export type ShiftResponse = components["schemas"]["ShiftResponse"];
export type CreateShift = components["schemas"]["CreateShift"];
export type UpdateShift = components["schemas"]["UpdateShift"];

type ListShiftsResponse =
  operations["list-shifts"]["responses"][200]["content"]["application/json"];

type ListShiftsTeammatesResponse =
  operations["list-shifts-teammates"]["responses"][200]["content"]["application/json"];

const mergeShiftSnapshot = (current: ShiftResponse, patch: Partial<UpdateShift>): ShiftResponse => {
  const { times: patchTimes, ...restPatch } = patch;
  const filteredRest = Object.fromEntries(
    Object.entries(restPatch).filter(([, value]) => value !== undefined),
  ) as Partial<Omit<UpdateShift, "times">>;
  let next: ShiftResponse = { ...current, ...filteredRest };
  if (patchTimes !== undefined) {
    next = {
      ...next,
      times: { ...current.times, ...patchTimes },
    };
  }
  return next;
};

const shiftResponseToUpdateBody = (state: ShiftResponse): UpdateShift => ({
  color: state.color,
  name: state.name,
  times: state.times,
  timezone: state.timezone,
});

/**
 * One shift (`/shifts/{shift_id}` and `/shifts/{shift_id}/teammates`).
 *
 * Writable: `name`, `color`, `timezone`, `times`. Read-only: `id`, `createdAt`, `updatedAt`, `links`.
 * `PATCH` returns `204`; {@link update} and {@link save} merge the request into local state.
 *
 * @see https://dev.frontapp.com/reference/shifts
 */
export class FrontShift extends FrontResource<ShiftResponse, UpdateShift> {
  protected selfPath(): string {
    return FrontBase.expandPath("/shifts/{shift_id}", { shift_id: this.id });
  }

  get name(): string {
    return this.pick("name");
  }

  set name(value: string) {
    this.assign("name", value);
  }

  get color(): ShiftResponse["color"] {
    return this.pick("color");
  }

  set color(value: ShiftResponse["color"]) {
    this.assign("color", value);
  }

  get timezone(): string {
    return this.pick("timezone");
  }

  set timezone(value: string) {
    this.assign("timezone", value);
  }

  get times(): ShiftResponse["times"] {
    return this.pick("times");
  }

  set times(value: ShiftResponse["times"]) {
    this.assign("times", value);
  }

  get createdAt(): number | undefined {
    return this.pick("created_at");
  }

  get updatedAt(): number | undefined {
    return this.pick("updated_at");
  }

  toUpdateBody(): UpdateShift {
    return shiftResponseToUpdateBody(this.state);
  }

  /**
   * Update this shift (`PATCH /shifts/{shift_id}`). Returns `204`; local state is merged.
   *
   * **Required scope:** `shifts:write`
   *
   * @see https://dev.frontapp.com/reference/update-shift
   */
  async update(body: UpdateShift | Partial<UpdateShift>): Promise<void> {
    await this.patchNoContent(body, mergeShiftSnapshot);
  }

  /**
   * List teammates on the shift (`GET /shifts/{shift_id}/teammates`).
   *
   * **Required scope:** `teammates:read`
   *
   * @see https://dev.frontapp.com/reference/list-shifts-teammates
   */
  async listTeammates(): Promise<FrontTeammate[]> {
    const path = FrontBase.expandPath("/shifts/{shift_id}/teammates", {
      shift_id: this.id,
    });
    const json = await this.base.requestJson<WithNormalizedPagination<ListShiftsTeammatesResponse>>(
      "GET",
      path,
    );
    const results = json._results ?? [];
    return results.map((row) => new FrontTeammate(this.base, row));
  }

  /**
   * Add teammates (`POST /shifts/{shift_id}/teammates`).
   *
   * **Required scope:** `shifts:write`
   *
   * @see https://dev.frontapp.com/reference/add-teammates-to-shift
   */
  async addTeammates(body: components["schemas"]["TeammateIds"]): Promise<void> {
    const path = FrontBase.expandPath("/shifts/{shift_id}/teammates", {
      shift_id: this.id,
    });
    await this.base.requestJson<undefined>("POST", path, { body });
  }

  /**
   * Remove teammates (`DELETE /shifts/{shift_id}/teammates`).
   *
   * **Required scope:** `shifts:write`
   *
   * @see https://dev.frontapp.com/reference/remove-teammates-from-shift
   */
  async removeTeammates(body: components["schemas"]["TeammateIds"]): Promise<void> {
    const path = FrontBase.expandPath("/shifts/{shift_id}/teammates", {
      shift_id: this.id,
    });
    await this.base.requestJson<undefined>("DELETE", path, { body });
  }
}

/**
 * Shifts under `/shifts`.
 *
 * @see https://dev.frontapp.com/reference/shifts
 */
export class FrontShifts {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List shifts (`GET /shifts`).
   *
   * **Required scope:** `shifts:read`
   *
   * @see https://dev.frontapp.com/reference/list-shifts
   */
  async list(): Promise<WithNormalizedPagination<ListShiftsResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListShiftsResponse>>(
      "GET",
      "/shifts",
    );
  }

  /**
   * Create a shift (`POST /shifts`).
   *
   * **Required scope:** `shifts:write`
   *
   * @see https://dev.frontapp.com/reference/create-shift
   */
  async create(body: CreateShift): Promise<FrontShift> {
    const data = await this.base.requestJson<ShiftResponse>("POST", "/shifts", {
      body,
    });
    return new FrontShift(this.base, data);
  }

  /**
   * Fetch one shift (`GET /shifts/{shift_id}`).
   *
   * **Required scope:** `shifts:read`
   *
   * @see https://dev.frontapp.com/reference/get-shift
   */
  async get(shiftId: string): Promise<FrontShift> {
    const path = FrontBase.expandPath("/shifts/{shift_id}", {
      shift_id: shiftId,
    });
    const data = await this.base.requestJson<ShiftResponse>("GET", path);
    return new FrontShift(this.base, data);
  }
}
