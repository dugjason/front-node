import type { FrontBase } from "../base";
import type { OperationParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type SignatureResponse = components["schemas"]["SignatureResponse"];

export type UpdateSignatureParams = NonNullable<OperationParams<"update-signature">["body"]>;
export type CreateSignatureTeammateParams = NonNullable<
  OperationParams<"create-teammate-signature">["body"]
>;
export type CreateSignatureTeamParams = NonNullable<
  OperationParams<"create-team-signature">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontSignatures {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /signatures/{signature_id}
   * Required scope: `signatures:read`
   * @see https://dev.frontapp.com/reference/get-signatures
   */
  async get(signatureId: string): Promise<OperationResponse<"get-signatures">> {
    return await this.base.requestOperation("get-signatures", {
      path: { signature_id: signatureId },
    });
  }

  /** PATCH /signatures/{signature_id}
   * Required scope: `signatures:write`
   * @see https://dev.frontapp.com/reference/update-signature
   */
  async update(
    signatureId: string,
    body: UpdateSignatureParams,
  ): Promise<OperationResponse<"update-signature">> {
    return await this.base.requestOperation("update-signature", {
      body,
      path: { signature_id: signatureId },
    });
  }

  /** DELETE /signatures/{signature_id}
   * Required scope: `signatures:delete`
   * @see https://dev.frontapp.com/reference/delete-signature
   */
  async delete(signatureId: string): Promise<OperationResponse<"delete-signature">> {
    return await this.base.requestOperation("delete-signature", {
      path: { signature_id: signatureId },
    });
  }

  /** GET /teammates/{teammate_id}/signatures
   * Required scope: `signatures:read`
   * @see https://dev.frontapp.com/reference/list-teammate-signatures
   */
  async listTeammate(teammateId: string): Promise<OperationResponse<"list-teammate-signatures">> {
    return await this.base.requestOperation("list-teammate-signatures", {
      path: { teammate_id: teammateId },
    });
  }

  /** POST /teammates/{teammate_id}/signatures
   * Required scope: `signatures:write`
   * @see https://dev.frontapp.com/reference/create-teammate-signature
   */
  async createTeammate(
    teammateId: string,
    body: CreateSignatureTeammateParams,
  ): Promise<OperationResponse<"create-teammate-signature">> {
    return await this.base.requestOperation("create-teammate-signature", {
      body,
      path: { teammate_id: teammateId },
    });
  }

  /** GET /teams/{team_id}/signatures
   * Required scope: `signatures:read`
   * @see https://dev.frontapp.com/reference/list-team-signatures
   */
  async listTeam(teamId: string): Promise<OperationResponse<"list-team-signatures">> {
    return await this.base.requestOperation("list-team-signatures", { path: { team_id: teamId } });
  }

  /** POST /teams/{team_id}/signatures
   * Required scope: `signatures:write`
   * @see https://dev.frontapp.com/reference/create-team-signature
   */
  async createTeam(
    teamId: string,
    body: CreateSignatureTeamParams,
  ): Promise<OperationResponse<"create-team-signature">> {
    return await this.base.requestOperation("create-team-signature", {
      body,
      path: { team_id: teamId },
    });
  }
}
