import type { FrontBase } from "../base";
import type { OperationParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type ShiftResponse = components["schemas"]["ShiftResponse"];

export type CreateShiftParams = NonNullable<OperationParams<"create-shift">["body"]>;
export type UpdateShiftParams = NonNullable<OperationParams<"update-shift">["body"]>;
export type AddShiftTeammatesParams = NonNullable<
  OperationParams<"add-teammates-to-shift">["body"]
>;
export type RemoveShiftTeammatesParams = NonNullable<
  OperationParams<"remove-teammates-from-shift">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontShifts {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /shifts
   * Required scope: `shifts:read`
   * @see https://dev.frontapp.com/reference/list-shifts
   */
  async list(): Promise<OperationResponse<"list-shifts">> {
    return await this.base.requestOperation("list-shifts");
  }

  /** POST /shifts
   * Required scope: `shifts:write`
   * @see https://dev.frontapp.com/reference/create-shift
   */
  async create(body: CreateShiftParams): Promise<OperationResponse<"create-shift">> {
    return await this.base.requestOperation("create-shift", { body });
  }

  /** GET /shifts/{shift_id}
   * Required scope: `shifts:read`
   * @see https://dev.frontapp.com/reference/get-shift
   */
  async get(shiftId: string): Promise<OperationResponse<"get-shift">> {
    return await this.base.requestOperation("get-shift", { path: { shift_id: shiftId } });
  }

  /** PATCH /shifts/{shift_id}
   * Required scope: `shifts:write`
   * @see https://dev.frontapp.com/reference/update-shift
   */
  async update(
    shiftId: string,
    body: UpdateShiftParams,
  ): Promise<OperationResponse<"update-shift">> {
    return await this.base.requestOperation("update-shift", { body, path: { shift_id: shiftId } });
  }

  /** GET /shifts/{shift_id}/teammates
   * Required scope: `teammates:read`
   * @see https://dev.frontapp.com/reference/list-shifts-teammates
   */
  async listTeammates(shiftId: string): Promise<OperationResponse<"list-shifts-teammates">> {
    return await this.base.requestOperation("list-shifts-teammates", {
      path: { shift_id: shiftId },
    });
  }

  /** POST /shifts/{shift_id}/teammates
   * Required scope: `shifts:write`
   * @see https://dev.frontapp.com/reference/add-teammates-to-shift
   */
  async addTeammates(
    shiftId: string,
    body: AddShiftTeammatesParams,
  ): Promise<OperationResponse<"add-teammates-to-shift">> {
    return await this.base.requestOperation("add-teammates-to-shift", {
      body,
      path: { shift_id: shiftId },
    });
  }

  /** DELETE /shifts/{shift_id}/teammates
   * Required scope: `shifts:write`
   * @see https://dev.frontapp.com/reference/remove-teammates-from-shift
   */
  async removeTeammates(
    shiftId: string,
    body?: RemoveShiftTeammatesParams,
  ): Promise<OperationResponse<"remove-teammates-from-shift">> {
    return await this.base.requestOperation("remove-teammates-from-shift", {
      body,
      path: { shift_id: shiftId },
    });
  }
}
