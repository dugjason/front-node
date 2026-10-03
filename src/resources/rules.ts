import type { FrontBase } from "../base";
import type { OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type RuleResponse = components["schemas"]["RuleResponse"];

/** Collection operations returning Front response data. */
export class FrontRules {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /rules
   * Required scope: `rules:read`
   * @see https://dev.frontapp.com/reference/list-rules
   */
  async list(): Promise<OperationResponse<"list-rules">> {
    return await this.base.requestOperation("list-rules");
  }

  /** GET /rules/{rule_id}
   * Required scope: `rules:read`
   * @see https://dev.frontapp.com/reference/get-rule
   */
  async get(ruleId: string): Promise<OperationResponse<"get-rule">> {
    return await this.base.requestOperation("get-rule", { path: { rule_id: ruleId } });
  }
}
