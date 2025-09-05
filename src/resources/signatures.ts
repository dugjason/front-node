import {
  deleteSignature,
  getSignatures,
  updateSignature,
} from "../generated/sdk.gen"
import type { SignatureResponse, UpdateSignature } from "../generated/types.gen"

export class FrontSignature {
  constructor(private data: SignatureResponse) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get body() {
    return this.data.body
  }

  get senderInfo() {
    return this.data.sender_info
  }

  get isVisibleForAllTeammateChannels() {
    return this.data.is_visible_for_all_teammate_channels
  }

  get isDefault() {
    return this.data.is_default
  }

  get isPrivate() {
    return this.data.is_private
  }

  get channelIds() {
    return this.data.channel_ids
  }

  toJSON(): SignatureResponse {
    return this.data
  }

  async update(body: UpdateSignature): Promise<FrontSignature> {
    const { error } = await updateSignature({
      path: { signature_id: this.id },
      body,
    })
    if (error) throw new Error("Failed to update signature")

    const { data } = await getSignatures({ path: { signature_id: this.id } })
    if (!data) throw new Error("Failed to fetch updated signature")
    this.data = data
    return this
  }

  async delete(): Promise<void> {
    deleteSignature({ path: { signature_id: this.id } })
  }
}
