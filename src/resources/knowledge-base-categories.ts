import type {
  KnowledgeBaseCategoryResponse,
  KnowledgeBaseCategorySlimResponse,
} from "../generated/types.gen"

export class FrontKnowledgeBaseCategory {
  constructor(
    private data:
      | KnowledgeBaseCategoryResponse
      | KnowledgeBaseCategorySlimResponse,
  ) {}

  get id() {
    return this.data.id
  }

  get slug(): string | undefined {
    return (this.data as KnowledgeBaseCategorySlimResponse).slug
  }

  get name(): string | null | undefined {
    return (this.data as KnowledgeBaseCategoryResponse).name
  }

  get description(): string | null | undefined {
    return (this.data as KnowledgeBaseCategoryResponse).description
  }

  get isHidden(): boolean {
    return this.data.is_hidden
  }

  get locale(): string | undefined {
    return (this.data as KnowledgeBaseCategoryResponse).locale
  }

  get locales(): string[] | undefined {
    return (this.data as KnowledgeBaseCategorySlimResponse).locales
  }

  get createdAt() {
    return this.data.created_at
  }

  get updatedAt() {
    return this.data.updated_at
  }

  toJSON(): KnowledgeBaseCategoryResponse | KnowledgeBaseCategorySlimResponse {
    return this.data
  }
}
