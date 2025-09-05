import type {
  KnowledgeBaseArticleResponse,
  KnowledgeBaseArticleSlimResponse,
} from "../generated/types.gen"

export class FrontKnowledgeBaseArticle {
  constructor(
    private data:
      | KnowledgeBaseArticleResponse
      | KnowledgeBaseArticleSlimResponse,
  ) {}

  get id(): string {
    return this.data.id
  }

  get slug(): string {
    return this.data.slug
  }

  get name(): string | undefined {
    return (this.data as KnowledgeBaseArticleResponse).name
  }

  get content(): string | undefined {
    return (this.data as KnowledgeBaseArticleResponse).content
  }

  get locale(): string | undefined {
    return (this.data as KnowledgeBaseArticleResponse).locale
  }

  get locales(): string[] | undefined {
    return (this.data as KnowledgeBaseArticleSlimResponse).locales
  }

  get createdAt() {
    return this.data.created_at
  }

  get updatedAt() {
    return this.data.updated_at
  }

  toJSON(): KnowledgeBaseArticleResponse | KnowledgeBaseArticleSlimResponse {
    return this.data
  }
}
