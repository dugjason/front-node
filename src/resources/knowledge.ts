import type { FrontBase } from "../base";
import type { OperationParams, OperationListParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type KnowledgeBaseSlimResponse = components["schemas"]["KnowledgeBaseSlimResponse"];
export type KnowledgeBaseArticleSlimResponse =
  components["schemas"]["KnowledgeBaseArticleSlimResponse"];
export type KnowledgeBaseCategorySlimResponse =
  components["schemas"]["KnowledgeBaseCategorySlimResponse"];
export type KnowledgeBaseResponse = components["schemas"]["KnowledgeBaseResponse"];
export type KnowledgeBaseArticleResponse = components["schemas"]["KnowledgeBaseArticleResponse"];
export type KnowledgeBaseCategoryResponse = components["schemas"]["KnowledgeBaseCategoryResponse"];

export type CreateKnowledgeBaseParams = NonNullable<
  OperationParams<"create-a-knowledge-base">["body"]
>;
export type UpdateKnowledgeBaseContentDefaultParams = NonNullable<
  OperationParams<"update-knowledge-base-in-default-locale">["body"]
>;
export type UpdateKnowledgeBaseContentLocaleParams = NonNullable<
  OperationParams<"update-knowledge-base-in-specified-locale">["body"]
>;
export type ListKnowledgeBaseArticlesParams =
  OperationListParams<"list-articles-in-a-knowledge-base">;
export type CreateKnowledgeBaseArticleDefaultParams = NonNullable<
  OperationParams<"create-article-in-a-knowledge-base-in-default-locale">["body"]
>;
export type CreateKnowledgeBaseArticleLocaleParams = NonNullable<
  OperationParams<"create-article-in-a-knowledge-base-in-specified-locale">["body"]
>;
export type ListKnowledgeBaseCategoriesParams =
  OperationListParams<"list-categories-in-a-knowledge-base">;
export type CreateKnowledgeBaseCategoryDefaultParams = NonNullable<
  OperationParams<"create-knowledge-base-category-in-default-locale">["body"]
>;
export type CreateKnowledgeBaseCategoryLocaleParams = NonNullable<
  OperationParams<"create-knowledge-base-category-in-specified-locale">["body"]
>;
export type UpdateKnowledgeBaseArticleContentDefaultParams = NonNullable<
  OperationParams<"update-article-content-in-default-locale">["body"]
>;
export type UpdateKnowledgeBaseArticleContentLocaleParams = NonNullable<
  OperationParams<"update-article-content-in-specified-locale">["body"]
>;
export type ListKnowledgeBaseCategoryArticlesParams =
  OperationListParams<"list-articles-in-a-category">;
export type UpdateKnowledgeBaseCategoryContentDefaultParams = NonNullable<
  OperationParams<"update-knowledge-base-category-in-default-locale">["body"]
>;
export type UpdateKnowledgeBaseCategoryContentLocaleParams = NonNullable<
  OperationParams<"update-knowledge-base-category-in-specified-locale">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontKnowledgeBases {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /knowledge_bases
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/list-knowledge-bases
   */
  async list(): Promise<OperationResponse<"list-knowledge-bases">> {
    return await this.base.requestOperation("list-knowledge-bases");
  }

  /** POST /knowledge_bases
   * Required scope: `knowledge_bases:write`
   * @see https://dev.frontapp.com/reference/create-a-knowledge-base
   */
  async create(
    body: CreateKnowledgeBaseParams,
  ): Promise<OperationResponse<"create-a-knowledge-base">> {
    return await this.base.requestOperation("create-a-knowledge-base", { body });
  }

  /** GET /knowledge_bases/{knowledge_base_id}
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/get-a-knowledge-base
   */
  async get(knowledgeBaseId: string): Promise<OperationResponse<"get-a-knowledge-base">> {
    return await this.base.requestOperation("get-a-knowledge-base", {
      path: { knowledge_base_id: knowledgeBaseId },
    });
  }

  /** GET /knowledge_bases/{knowledge_base_id}/content
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/get-a-knowledge-base-with-content-in-default-locale
   */
  async getContentDefault(
    knowledgeBaseId: string,
  ): Promise<OperationResponse<"get-a-knowledge-base-with-content-in-default-locale">> {
    return await this.base.requestOperation("get-a-knowledge-base-with-content-in-default-locale", {
      path: { knowledge_base_id: knowledgeBaseId },
    });
  }

  /** PATCH /knowledge_bases/{knowledge_base_id}/content
   * Required scope: `knowledge_bases:write`
   * @see https://dev.frontapp.com/reference/update-knowledge-base-in-default-locale
   */
  async updateContentDefault(
    knowledgeBaseId: string,
    body: UpdateKnowledgeBaseContentDefaultParams,
  ): Promise<OperationResponse<"update-knowledge-base-in-default-locale">> {
    return await this.base.requestOperation("update-knowledge-base-in-default-locale", {
      body,
      path: { knowledge_base_id: knowledgeBaseId },
    });
  }

  /** GET /knowledge_bases/{knowledge_base_id}/locales/{locale}/content
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/get-a-knowledge-base-with-content-in-specified-locale
   */
  async getContentLocale(
    knowledgeBaseId: string,
    locale: string,
  ): Promise<OperationResponse<"get-a-knowledge-base-with-content-in-specified-locale">> {
    return await this.base.requestOperation(
      "get-a-knowledge-base-with-content-in-specified-locale",
      { path: { knowledge_base_id: knowledgeBaseId, locale } },
    );
  }

  /** PATCH /knowledge_bases/{knowledge_base_id}/locales/{locale}/content
   * Required scope: `knowledge_bases:write`
   * @see https://dev.frontapp.com/reference/update-knowledge-base-in-specified-locale
   */
  async updateContentLocale(
    knowledgeBaseId: string,
    locale: string,
    body: UpdateKnowledgeBaseContentLocaleParams,
  ): Promise<OperationResponse<"update-knowledge-base-in-specified-locale">> {
    return await this.base.requestOperation("update-knowledge-base-in-specified-locale", {
      body,
      path: { knowledge_base_id: knowledgeBaseId, locale },
    });
  }

  /** GET /knowledge_bases/{knowledge_base_id}/articles
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/list-articles-in-a-knowledge-base
   */
  async listArticles(
    knowledgeBaseId: string,
    params?: ListKnowledgeBaseArticlesParams,
  ): Promise<OperationResponse<"list-articles-in-a-knowledge-base">> {
    return await this.base.requestOperation("list-articles-in-a-knowledge-base", {
      nextPageUrl: params?.nextPageUrl,
      path: { knowledge_base_id: knowledgeBaseId },
      query: params,
    });
  }

  /** POST /knowledge_bases/{knowledge_base_id}/articles
   * Required scope: `knowledge_bases:write`
   * @see https://dev.frontapp.com/reference/create-article-in-a-knowledge-base-in-default-locale
   */
  async createArticleDefault(
    knowledgeBaseId: string,
    body: CreateKnowledgeBaseArticleDefaultParams,
  ): Promise<OperationResponse<"create-article-in-a-knowledge-base-in-default-locale">> {
    return await this.base.requestOperation(
      "create-article-in-a-knowledge-base-in-default-locale",
      { body, path: { knowledge_base_id: knowledgeBaseId } },
    );
  }

  /** POST /knowledge_bases/{knowledge_base_id}/locales/{locale}/articles
   * Required scope: `knowledge_bases:write`
   * @see https://dev.frontapp.com/reference/create-article-in-a-knowledge-base-in-specified-locale
   */
  async createArticleLocale(
    knowledgeBaseId: string,
    locale: string,
    body: CreateKnowledgeBaseArticleLocaleParams,
  ): Promise<OperationResponse<"create-article-in-a-knowledge-base-in-specified-locale">> {
    return await this.base.requestOperation(
      "create-article-in-a-knowledge-base-in-specified-locale",
      { body, path: { knowledge_base_id: knowledgeBaseId, locale } },
    );
  }

  /** GET /knowledge_bases/{knowledge_base_id}/categories
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/list-categories-in-a-knowledge-base
   */
  async listCategories(
    knowledgeBaseId: string,
    params?: ListKnowledgeBaseCategoriesParams,
  ): Promise<OperationResponse<"list-categories-in-a-knowledge-base">> {
    return await this.base.requestOperation("list-categories-in-a-knowledge-base", {
      nextPageUrl: params?.nextPageUrl,
      path: { knowledge_base_id: knowledgeBaseId },
      query: params,
    });
  }

  /** POST /knowledge_bases/{knowledge_base_id}/categories
   * Required scope: `knowledge_bases:write`
   * @see https://dev.frontapp.com/reference/create-knowledge-base-category-in-default-locale
   */
  async createCategoryDefault(
    knowledgeBaseId: string,
    body: CreateKnowledgeBaseCategoryDefaultParams,
  ): Promise<OperationResponse<"create-knowledge-base-category-in-default-locale">> {
    return await this.base.requestOperation("create-knowledge-base-category-in-default-locale", {
      body,
      path: { knowledge_base_id: knowledgeBaseId },
    });
  }

  /** POST /knowledge_bases/{knowledge_base_id}/locales/{locale}/categories
   * Required scope: `knowledge_bases:write`
   * @see https://dev.frontapp.com/reference/create-knowledge-base-category-in-specified-locale
   */
  async createCategoryLocale(
    knowledgeBaseId: string,
    locale: string,
    body: CreateKnowledgeBaseCategoryLocaleParams,
  ): Promise<OperationResponse<"create-knowledge-base-category-in-specified-locale">> {
    return await this.base.requestOperation("create-knowledge-base-category-in-specified-locale", {
      body,
      path: { knowledge_base_id: knowledgeBaseId, locale },
    });
  }
}

/** Collection operations returning Front response data. */
export class FrontKnowledgeBaseArticles {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /knowledge_base_articles/{article_id}
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/get-a-knowledge-base-article
   */
  async get(articleId: string): Promise<OperationResponse<"get-a-knowledge-base-article">> {
    return await this.base.requestOperation("get-a-knowledge-base-article", {
      path: { article_id: articleId },
    });
  }

  /** DELETE /knowledge_base_articles/{article_id}
   * Required scope: `knowledge_bases:delete`
   * @see https://dev.frontapp.com/reference/delete-an-article
   */
  async delete(articleId: string): Promise<OperationResponse<"delete-an-article">> {
    return await this.base.requestOperation("delete-an-article", {
      path: { article_id: articleId },
    });
  }

  /** GET /knowledge_base_articles/{article_id}/content
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/get-knowledge-base-article-with-content-in-default-locale
   */
  async getContentDefault(
    articleId: string,
  ): Promise<OperationResponse<"get-knowledge-base-article-with-content-in-default-locale">> {
    return await this.base.requestOperation(
      "get-knowledge-base-article-with-content-in-default-locale",
      { path: { article_id: articleId } },
    );
  }

  /** PATCH /knowledge_base_articles/{article_id}/content
   * Required scope: `knowledge_bases:write`
   * @see https://dev.frontapp.com/reference/update-article-content-in-default-locale
   */
  async updateContentDefault(
    articleId: string,
    body: UpdateKnowledgeBaseArticleContentDefaultParams,
  ): Promise<OperationResponse<"update-article-content-in-default-locale">> {
    return await this.base.requestOperation("update-article-content-in-default-locale", {
      body,
      path: { article_id: articleId },
    });
  }

  /** GET /knowledge_base_articles/{article_id}/locales/{locale}/content
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/get-knowledge-base-article-with-content-in-specified-locale
   */
  async getContentLocale(
    articleId: string,
    locale: string,
  ): Promise<OperationResponse<"get-knowledge-base-article-with-content-in-specified-locale">> {
    return await this.base.requestOperation(
      "get-knowledge-base-article-with-content-in-specified-locale",
      { path: { article_id: articleId, locale } },
    );
  }

  /** PATCH /knowledge_base_articles/{article_id}/locales/{locale}/content
   * Required scope: `knowledge_bases:write`
   * @see https://dev.frontapp.com/reference/update-article-content-in-specified-locale
   */
  async updateContentLocale(
    articleId: string,
    locale: string,
    body: UpdateKnowledgeBaseArticleContentLocaleParams,
  ): Promise<OperationResponse<"update-article-content-in-specified-locale">> {
    return await this.base.requestOperation("update-article-content-in-specified-locale", {
      body,
      path: { article_id: articleId, locale },
    });
  }

  /** GET /knowledge_base_articles/{article_id}/download/{attachment_id}
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/download-attachment-from-an-article
   */
  async downloadAttachment(articleId: string, attachmentId: string): Promise<Response> {
    return await this.base.requestOperationRaw("download-attachment-from-an-article", {
      path: { article_id: articleId, attachment_id: attachmentId },
    });
  }
}

/** Collection operations returning Front response data. */
export class FrontKnowledgeBaseCategories {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** GET /knowledge_base_categories/{category_id}
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/get-a-knowledge-base-category
   */
  async get(categoryId: string): Promise<OperationResponse<"get-a-knowledge-base-category">> {
    return await this.base.requestOperation("get-a-knowledge-base-category", {
      path: { category_id: categoryId },
    });
  }

  /** DELETE /knowledge_base_categories/{category_id}
   * Required scope: `knowledge_bases:delete`
   * @see https://dev.frontapp.com/reference/delete-a-knowledge-base-category
   */
  async delete(categoryId: string): Promise<OperationResponse<"delete-a-knowledge-base-category">> {
    return await this.base.requestOperation("delete-a-knowledge-base-category", {
      path: { category_id: categoryId },
    });
  }

  /** GET /knowledge_base_categories/{category_id}/articles
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/list-articles-in-a-category
   */
  async listArticles(
    categoryId: string,
    params?: ListKnowledgeBaseCategoryArticlesParams,
  ): Promise<OperationResponse<"list-articles-in-a-category">> {
    return await this.base.requestOperation("list-articles-in-a-category", {
      nextPageUrl: params?.nextPageUrl,
      path: { category_id: categoryId },
      query: params,
    });
  }

  /** GET /knowledge_base_categories/{category_id}/content
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/get-knowledge-base-category-content-in-default-locale
   */
  async getContentDefault(
    categoryId: string,
  ): Promise<OperationResponse<"get-knowledge-base-category-content-in-default-locale">> {
    return await this.base.requestOperation(
      "get-knowledge-base-category-content-in-default-locale",
      { path: { category_id: categoryId } },
    );
  }

  /** PATCH /knowledge_base_categories/{category_id}/content
   * Required scope: `knowledge_bases:write`
   * @see https://dev.frontapp.com/reference/update-knowledge-base-category-in-default-locale
   */
  async updateContentDefault(
    categoryId: string,
    body: UpdateKnowledgeBaseCategoryContentDefaultParams,
  ): Promise<OperationResponse<"update-knowledge-base-category-in-default-locale">> {
    return await this.base.requestOperation("update-knowledge-base-category-in-default-locale", {
      body,
      path: { category_id: categoryId },
    });
  }

  /** GET /knowledge_base_categories/{category_id}/locales/{locale}/content
   * Required scope: `knowledge_bases:read`
   * @see https://dev.frontapp.com/reference/get-knowledge-base-category-with-content-in-specified-locale
   */
  async getContentLocale(
    categoryId: string,
    locale: string,
  ): Promise<OperationResponse<"get-knowledge-base-category-with-content-in-specified-locale">> {
    return await this.base.requestOperation(
      "get-knowledge-base-category-with-content-in-specified-locale",
      { path: { category_id: categoryId, locale } },
    );
  }

  /** PATCH /knowledge_base_categories/{category_id}/locales/{locale}/content
   * Required scope: `knowledge_bases:write`
   * @see https://dev.frontapp.com/reference/update-knowledge-base-category-in-specified-locale
   */
  async updateContentLocale(
    categoryId: string,
    locale: string,
    body: UpdateKnowledgeBaseCategoryContentLocaleParams,
  ): Promise<OperationResponse<"update-knowledge-base-category-in-specified-locale">> {
    return await this.base.requestOperation("update-knowledge-base-category-in-specified-locale", {
      body,
      path: { category_id: categoryId, locale },
    });
  }
}
