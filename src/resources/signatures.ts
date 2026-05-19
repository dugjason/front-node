import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";
import { FrontResource } from "../resource";

export type SignatureResponse = components["schemas"]["SignatureResponse"];
export type UpdateSignature = components["schemas"]["UpdateSignature"];
export type CreatePrivateSignature = components["schemas"]["CreatePrivateSignature"];
export type CreateSharedSignature = components["schemas"]["CreateSharedSignature"];

type ListSignaturesResponse =
  operations["list-teammate-signatures"]["responses"][200]["content"]["application/json"];

const signatureResponseToUpdateBody = (state: SignatureResponse): UpdateSignature => ({
  body: state.body,
  channel_ids: state.channel_ids === null ? undefined : state.channel_ids,
  is_default: state.is_default,
  is_visible_for_all_teammate_channels: state.is_visible_for_all_teammate_channels,
  name: state.name ?? undefined,
  sender_info: state.sender_info ?? undefined,
});

/**
 * One signature (`/signatures/{signature_id}`).
 *
 * Writable camelCase: `name`, `body`, `senderInfo`, `isVisibleForAllTeammateChannels`, `isDefault`, `channelIds`, `links`.
 * Read-only: `id`, `isPrivate`. `PATCH` returns the updated resource JSON; {@link update} and {@link save} replace local state.
 *
 * @see https://dev.frontapp.com/reference/signatures
 */
export class FrontSignature extends FrontResource<SignatureResponse, UpdateSignature> {
  protected selfPath(): string {
    return FrontBase.expandPath("/signatures/{signature_id}", {
      signature_id: this.id,
    });
  }

  get name(): string | null {
    return this.pick("name");
  }

  set name(value: string | null) {
    this.assign("name", value);
  }

  get body(): string {
    return this.pick("body");
  }

  set body(value: string) {
    this.assign("body", value);
  }

  get senderInfo(): string | null {
    return this.pick("sender_info");
  }

  set senderInfo(value: string | null) {
    this.assign("sender_info", value);
  }

  get isVisibleForAllTeammateChannels(): boolean {
    return this.pick("is_visible_for_all_teammate_channels");
  }

  set isVisibleForAllTeammateChannels(value: boolean) {
    this.assign("is_visible_for_all_teammate_channels", value);
  }

  get isDefault(): boolean {
    return this.pick("is_default");
  }

  set isDefault(value: boolean) {
    this.assign("is_default", value);
  }

  get isPrivate(): boolean {
    return this.pick("is_private");
  }

  get channelIds(): string[] | null {
    return this.pick("channel_ids");
  }

  set channelIds(value: string[] | null) {
    this.assign("channel_ids", value);
  }

  /**
   * Build the `PATCH` body implied by the current property values.
   * @see https://dev.frontapp.com/reference/update-signature
   */
  toUpdateBody(): UpdateSignature {
    return signatureResponseToUpdateBody(this.state);
  }

  /**
   * Update this signature (`PATCH /signatures/{signature_id}`). The API returns `200` with the updated resource.
   *
   * **Required scope:** `signatures:write`
   *
   * @param body Fields to change (OpenAPI {@link UpdateSignature}).
   * @see https://dev.frontapp.com/reference/update-signature
   */
  async update(body: UpdateSignature | Partial<UpdateSignature>): Promise<void> {
    await this.patchReplaceFromResponse(body);
  }
}

/**
 * Signatures: `GET/PATCH/DELETE /signatures/{signature_id}` plus teammate/team list and create routes.
 *
 * @see https://dev.frontapp.com/reference/signatures
 */
export class FrontSignatures {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * Fetch one signature (`GET /signatures/{signature_id}`).
   *
   * **Required scope:** `signatures:read`
   *
   * @param signatureId Signature id.
   * @see https://dev.frontapp.com/reference/get-signatures
   */
  async get(signatureId: string): Promise<FrontSignature> {
    const path = FrontBase.expandPath("/signatures/{signature_id}", {
      signature_id: signatureId,
    });
    const data = await this.base.requestJson<SignatureResponse>("GET", path);
    return new FrontSignature(this.base, data);
  }

  /**
   * List signatures for a teammate (`GET /teammates/{teammate_id}/signatures`).
   *
   * **Required scope:** `signatures:read`
   *
   * @param teammateId Teammate id or supported [resource alias](https://dev.frontapp.com/docs/resource-aliases-1).
   * @see https://dev.frontapp.com/reference/list-teammate-signatures
   */
  async listTeammate(
    teammateId: string,
  ): Promise<WithNormalizedPagination<ListSignaturesResponse>> {
    const path = FrontBase.expandPath("/teammates/{teammate_id}/signatures", {
      teammate_id: teammateId,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListSignaturesResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Create a private signature for a teammate (`POST /teammates/{teammate_id}/signatures`).
   *
   * **Required scope:** `signatures:write`
   *
   * @param teammateId Teammate id or supported resource alias.
   * @param body Create payload (OpenAPI {@link CreatePrivateSignature}).
   * @see https://dev.frontapp.com/reference/create-teammate-signature
   */
  async createTeammate(teammateId: string, body: CreatePrivateSignature): Promise<FrontSignature> {
    const path = FrontBase.expandPath("/teammates/{teammate_id}/signatures", {
      teammate_id: teammateId,
    });
    const data = await this.base.requestJson<SignatureResponse>("POST", path, {
      body,
    });
    return new FrontSignature(this.base, data);
  }

  /**
   * List signatures for a team/workspace (`GET /teams/{team_id}/signatures`).
   *
   * **Required scope:** `signatures:read`
   *
   * @param teamId Team id.
   * @see https://dev.frontapp.com/reference/list-team-signatures
   */
  async listTeam(teamId: string): Promise<WithNormalizedPagination<ListSignaturesResponse>> {
    const path = FrontBase.expandPath("/teams/{team_id}/signatures", {
      team_id: teamId,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListSignaturesResponse>>(
      "GET",
      path,
    );
  }

  /**
   * Create a shared signature for a team (`POST /teams/{team_id}/signatures`).
   *
   * **Required scope:** `signatures:write`
   *
   * @param teamId Team id.
   * @param body Create payload (OpenAPI {@link CreateSharedSignature}).
   * @see https://dev.frontapp.com/reference/create-team-signature
   */
  async createTeam(teamId: string, body: CreateSharedSignature): Promise<FrontSignature> {
    const path = FrontBase.expandPath("/teams/{team_id}/signatures", {
      team_id: teamId,
    });
    const data = await this.base.requestJson<SignatureResponse>("POST", path, {
      body,
    });
    return new FrontSignature(this.base, data);
  }
}
