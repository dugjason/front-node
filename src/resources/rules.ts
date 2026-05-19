import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";

export type RuleResponse = components["schemas"]["RuleResponse"];

type ListRulesResponse = operations["list-rules"]["responses"][200]["content"]["application/json"];

/**
 * Company rules under `/rules` (list and fetch by id only).
 *
 * @see https://dev.frontapp.com/reference/rules
 */
export class FrontRules {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List rules (`GET /rules`).
   *
   * **Required scope:** `rules:read`
   *
   * @see https://dev.frontapp.com/reference/list-rules
   */
  async list(): Promise<WithNormalizedPagination<ListRulesResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListRulesResponse>>(
      "GET",
      "/rules",
    );
  }

  /**
   * Fetch one rule (`GET /rules/{rule_id}`).
   *
   * **Required scope:** `rules:read`
   *
   * @see https://dev.frontapp.com/reference/get-rule
   */
  async get(ruleId: string): Promise<RuleResponse> {
    const path = FrontBase.expandPath("/rules/{rule_id}", { rule_id: ruleId });
    return await this.base.requestJson<RuleResponse>("GET", path);
  }
}
