import type {
  KnowledgeBaseResponse,
  KnowledgeBaseSlimResponse,
} from "../generated/types.gen"

export class FrontKnowledgeBase {
  constructor(
    private data: KnowledgeBaseResponse | KnowledgeBaseSlimResponse,
  ) {}

  get id(): string {
    return this.data.id
  }

  get name(): string | undefined {
    return (this.data as KnowledgeBaseResponse).name
  }

  get status(): ("published" | "unpublished") | undefined {
    return (this.data as KnowledgeBaseResponse).status
  }

  get type(): "internal" | "external" {
    // Present on both shapes
    return this.data.type
  }

  get locale(): string | undefined {
    return (this.data as KnowledgeBaseResponse).locale
  }

  get locales(): string[] | undefined {
    return (this.data as KnowledgeBaseSlimResponse).locales
  }

  get createdAt() {
    return this.data.created_at
  }

  get updatedAt() {
    return this.data.updated_at
  }

  toJSON(): KnowledgeBaseResponse | KnowledgeBaseSlimResponse {
    return this.data
  }
}
