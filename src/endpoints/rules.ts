import { APIResource } from "../core/resource"
import { getRule, listRules } from "../generated/sdk.gen"
import type {
  GetRuleResponse,
  ListRulesResponse,
  RuleResponse,
} from "../generated/types.gen"
import { FrontRule } from "../resources/rules"

export class Rules extends APIResource<FrontRule, RuleResponse> {
  protected makeItem(raw: RuleResponse): FrontRule {
    return new FrontRule(raw)
  }

  /** READ **/
  async list(): Promise<{ response: Response; data: FrontRule[] }> {
    return this.listWithoutPagination<ListRulesResponse>({
      listCall: () => listRules(),
    })
  }

  async get(ruleId: string): Promise<{ rule: FrontRule; response: Response }> {
    const { item, response } = await this.getOne<GetRuleResponse>({
      getCall: () => getRule({ path: { rule_id: ruleId } }),
    })
    return { rule: item, response }
  }
}
