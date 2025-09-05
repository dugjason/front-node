import { APIResource } from "../core/resource"
import {
  createTeammateSignature,
  createTeamSignature,
  deleteSignature,
  getSignatures,
  listTeammateSignatures,
  listTeamSignatures,
  updateSignature,
} from "../generated/sdk.gen"
import type {
  CreateTeammateSignatureData,
  CreateTeamSignatureData,
  GetSignaturesResponse,
  ListTeammateSignaturesResponse,
  ListTeamSignaturesResponse,
  SignatureResponse,
  UpdateSignature,
} from "../generated/types.gen"
import { FrontSignature } from "../resources/signatures"

export class Signatures extends APIResource<FrontSignature, SignatureResponse> {
  protected makeItem(raw: SignatureResponse): FrontSignature {
    return new FrontSignature(raw)
  }

  /** READ **/
  async get(
    signatureId: string,
  ): Promise<{ signature: FrontSignature; response: Response }> {
    const { item, response } = await this.getOne<GetSignaturesResponse>({
      getCall: () => getSignatures({ path: { signature_id: signatureId } }),
    })
    return { signature: item, response }
  }

  /** UPDATE **/
  async update(
    signatureId: string,
    body: UpdateSignature,
  ): Promise<{ signature: FrontSignature; response: Response }> {
    const { response } = await updateSignature({
      path: { signature_id: signatureId },
      body,
    })
    const refreshed = await this.get(signatureId)
    return { signature: refreshed.signature, response }
  }

  /** DELETE **/
  async delete(signatureId: string): Promise<void> {
    deleteSignature({ path: { signature_id: signatureId } })
  }

  /** SUB-COLLECTIONS **/
  async listTeammateSignatures(
    teammateId: string,
  ): Promise<{ response: Response; data: FrontSignature[] }> {
    return this.listWithoutPagination<ListTeammateSignaturesResponse>({
      listCall: () =>
        listTeammateSignatures({ path: { teammate_id: teammateId } }),
    })
  }

  async createTeammateSignature(
    teammateId: string,
    body: CreateTeammateSignatureData["body"],
  ): Promise<{ signature: FrontSignature; response: Response }> {
    const { item, response } = await this.createOne<SignatureResponse>({
      createCall: () =>
        createTeammateSignature({ path: { teammate_id: teammateId }, body }),
    })
    return { signature: item, response }
  }

  async listTeamSignatures(
    teamId: string,
  ): Promise<{ response: Response; data: FrontSignature[] }> {
    return this.listWithoutPagination<ListTeamSignaturesResponse>({
      listCall: () => listTeamSignatures({ path: { team_id: teamId } }),
    })
  }

  async createTeamSignature(
    teamId: string,
    body: CreateTeamSignatureData["body"],
  ): Promise<{ signature: FrontSignature; response: Response }> {
    const { item, response } = await this.createOne<SignatureResponse>({
      createCall: () =>
        createTeamSignature({ path: { team_id: teamId }, body }),
    })
    return { signature: item, response }
  }
}
