import { FrontBase } from "../base";
import type { components, operations } from "../gen/schema.gen";
import type { WithNormalizedPagination } from "../normalize-response";

export type KnowledgeBaseCreate = components["schemas"]["KnowledgeBaseCreate"];
export type KnowledgeBasePatch = components["schemas"]["KnowledgeBasePatch"];
export type KnowledgeBaseSlimResponse = components["schemas"]["KnowledgeBaseSlimResponse"];
export type KnowledgeBaseResponse = components["schemas"]["KnowledgeBaseResponse"];
export type KnowledgeBaseArticleCreate = components["schemas"]["KnowledgeBaseArticleCreate"];
export type KnowledgeBaseArticlePatch = components["schemas"]["KnowledgeBaseArticlePatch"];
export type KnowledgeBaseArticleSlimResponse =
  components["schemas"]["KnowledgeBaseArticleSlimResponse"];
export type KnowledgeBaseArticleResponse = components["schemas"]["KnowledgeBaseArticleResponse"];
export type KnowledgeBaseCategoryCreate = components["schemas"]["KnowledgeBaseCategoryCreate"];
export type KnowledgeBaseCategoryPatch = components["schemas"]["KnowledgeBaseCategoryPatch"];
export type KnowledgeBaseCategorySlimResponse =
  components["schemas"]["KnowledgeBaseCategorySlimResponse"];
export type KnowledgeBaseCategoryResponse = components["schemas"]["KnowledgeBaseCategoryResponse"];

type ListKnowledgeBasesResponse =
  operations["list-knowledge-bases"]["responses"][200]["content"]["application/json"];

type ListArticlesInKnowledgeBaseQuery = NonNullable<
  operations["list-articles-in-a-knowledge-base"]["parameters"]["query"]
>;
type ListArticlesInKnowledgeBaseResponse =
  operations["list-articles-in-a-knowledge-base"]["responses"][200]["content"]["application/json"];

type ListCategoriesInKnowledgeBaseQuery = NonNullable<
  operations["list-categories-in-a-knowledge-base"]["parameters"]["query"]
>;
type ListCategoriesInKnowledgeBaseResponse =
  operations["list-categories-in-a-knowledge-base"]["responses"][200]["content"]["application/json"];

type ListArticlesInCategoryQuery = NonNullable<
  operations["list-articles-in-a-category"]["parameters"]["query"]
>;
type ListArticlesInCategoryResponse =
  operations["list-articles-in-a-category"]["responses"][200]["content"]["application/json"];

const queryFromPaged = (q?: {
  limit?: unknown;
  page_token?: unknown;
}): Record<string, string | undefined> | undefined => {
  if (!q) {
    return;
  }
  const out: Record<string, string | undefined> = {};
  if (q.limit !== undefined) {
    out.limit = String(q.limit);
  }
  if (q.page_token !== undefined) {
    out.page_token = String(q.page_token);
  }
  return Object.keys(out).length > 0 ? out : undefined;
};

/**
 * Knowledge bases (`/knowledge_bases`, `/knowledge_bases/{knowledge_base_id}/…`).
 *
 * @see https://dev.frontapp.com/reference/knowledge-bases
 */
export class FrontKnowledgeBases {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * List knowledge bases (`GET /knowledge_bases`).
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async list(): Promise<WithNormalizedPagination<ListKnowledgeBasesResponse>> {
    return await this.base.requestJson<WithNormalizedPagination<ListKnowledgeBasesResponse>>(
      "GET",
      "/knowledge_bases",
    );
  }

  /**
   * Create a knowledge base (`POST /knowledge_bases`).
   *
   * **Required scope:** `knowledge_bases:write`
   */
  async create(body: KnowledgeBaseCreate): Promise<FrontKnowledgeBase> {
    const created = await this.base.requestJson<KnowledgeBaseResponse>("POST", "/knowledge_bases", {
      body,
    });
    return new FrontKnowledgeBase(this.base, created.id, created);
  }

  /**
   * Fetch one knowledge base (`GET /knowledge_bases/{knowledge_base_id}`).
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async get(knowledgeBaseId: string): Promise<FrontKnowledgeBase> {
    const path = FrontBase.expandPath("/knowledge_bases/{knowledge_base_id}", {
      knowledge_base_id: knowledgeBaseId,
    });
    const slim = await this.base.requestJson<KnowledgeBaseSlimResponse>("GET", path);
    return new FrontKnowledgeBase(this.base, slim.id, slim);
  }

  /** Target a knowledge base by id without calling the API first. */
  withId(knowledgeBaseId: string): FrontKnowledgeBase {
    return new FrontKnowledgeBase(this.base, knowledgeBaseId);
  }

  /** Target a knowledge base article by id (`/knowledge_base_articles/{article_id}`). */
  article(articleId: string): FrontKnowledgeBaseArticle {
    return new FrontKnowledgeBaseArticle(this.base, articleId);
  }

  /** Target a knowledge base category by id (`/knowledge_base_categories/{category_id}`). */
  category(categoryId: string): FrontKnowledgeBaseCategory {
    return new FrontKnowledgeBaseCategory(this.base, categoryId);
  }
}

/**
 * One knowledge base and its `/knowledge_bases/{knowledge_base_id}/…` subtree.
 */
export class FrontKnowledgeBase {
  private readonly base: FrontBase;
  private readonly knowledgeBaseId: string;
  private snapshot: KnowledgeBaseSlimResponse | KnowledgeBaseResponse | undefined;

  constructor(
    base: FrontBase,
    knowledgeBaseId: string,
    snapshot?: KnowledgeBaseSlimResponse | KnowledgeBaseResponse,
  ) {
    this.base = base;
    this.knowledgeBaseId = knowledgeBaseId;
    this.snapshot = snapshot;
  }

  get id(): string {
    return this.knowledgeBaseId;
  }

  /** Latest slim or full payload from {@link refresh} or constructors; `undefined` until loaded. */
  get data(): Readonly<KnowledgeBaseSlimResponse | KnowledgeBaseResponse> | undefined {
    return this.snapshot;
  }

  /**
   * `GET /knowledge_bases/{knowledge_base_id}` — replaces {@link data} with the slim response.
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async refresh(): Promise<this> {
    const path = FrontBase.expandPath("/knowledge_bases/{knowledge_base_id}", {
      knowledge_base_id: this.knowledgeBaseId,
    });
    this.snapshot = await this.base.requestJson<KnowledgeBaseSlimResponse>("GET", path);
    return this;
  }

  /**
   * `GET /knowledge_bases/{knowledge_base_id}/content` (default locale).
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async getContentDefault(): Promise<KnowledgeBaseResponse> {
    const path = FrontBase.expandPath("/knowledge_bases/{knowledge_base_id}/content", {
      knowledge_base_id: this.knowledgeBaseId,
    });
    return await this.base.requestJson<KnowledgeBaseResponse>("GET", path);
  }

  /**
   * `PATCH /knowledge_bases/{knowledge_base_id}/content` (default locale).
   *
   * **Required scope:** `knowledge_bases:write`
   */
  async updateContentDefault(body: KnowledgeBasePatch): Promise<KnowledgeBaseResponse> {
    const path = FrontBase.expandPath("/knowledge_bases/{knowledge_base_id}/content", {
      knowledge_base_id: this.knowledgeBaseId,
    });
    return await this.base.requestJson<KnowledgeBaseResponse>("PATCH", path, {
      body,
    });
  }

  /**
   * `GET /knowledge_bases/{knowledge_base_id}/locales/{locale}/content`.
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async getContentLocale(locale: string): Promise<KnowledgeBaseResponse> {
    const path = FrontBase.expandPath(
      "/knowledge_bases/{knowledge_base_id}/locales/{locale}/content",
      { knowledge_base_id: this.knowledgeBaseId, locale },
    );
    return await this.base.requestJson<KnowledgeBaseResponse>("GET", path);
  }

  /**
   * `PATCH /knowledge_bases/{knowledge_base_id}/locales/{locale}/content`.
   *
   * **Required scope:** `knowledge_bases:write`
   */
  async updateContentLocale(
    locale: string,
    body: KnowledgeBasePatch,
  ): Promise<KnowledgeBaseResponse> {
    const path = FrontBase.expandPath(
      "/knowledge_bases/{knowledge_base_id}/locales/{locale}/content",
      { knowledge_base_id: this.knowledgeBaseId, locale },
    );
    return await this.base.requestJson<KnowledgeBaseResponse>("PATCH", path, {
      body,
    });
  }

  /**
   * `GET /knowledge_bases/{knowledge_base_id}/articles`.
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async listArticles(
    query?: ListArticlesInKnowledgeBaseQuery,
  ): Promise<WithNormalizedPagination<ListArticlesInKnowledgeBaseResponse>> {
    const path = FrontBase.expandPath("/knowledge_bases/{knowledge_base_id}/articles", {
      knowledge_base_id: this.knowledgeBaseId,
    });
    return await this.base.requestJson<
      WithNormalizedPagination<ListArticlesInKnowledgeBaseResponse>
    >("GET", path, { query: queryFromPaged(query) });
  }

  /**
   * `POST /knowledge_bases/{knowledge_base_id}/articles` (default locale).
   *
   * **Required scope:** `knowledge_bases:write`
   */
  async createArticleDefault(body: KnowledgeBaseArticleCreate): Promise<FrontKnowledgeBaseArticle> {
    const path = FrontBase.expandPath("/knowledge_bases/{knowledge_base_id}/articles", {
      knowledge_base_id: this.knowledgeBaseId,
    });
    const data = await this.base.requestJson<KnowledgeBaseArticleResponse>("POST", path, { body });
    return new FrontKnowledgeBaseArticle(this.base, data.id, data);
  }

  /**
   * `POST /knowledge_bases/{knowledge_base_id}/locales/{locale}/articles`.
   *
   * **Required scope:** `knowledge_bases:write`
   */
  async createArticleLocale(
    locale: string,
    body: KnowledgeBaseArticleCreate,
  ): Promise<FrontKnowledgeBaseArticle> {
    const path = FrontBase.expandPath(
      "/knowledge_bases/{knowledge_base_id}/locales/{locale}/articles",
      { knowledge_base_id: this.knowledgeBaseId, locale },
    );
    const data = await this.base.requestJson<KnowledgeBaseArticleResponse>("POST", path, { body });
    return new FrontKnowledgeBaseArticle(this.base, data.id, data);
  }

  /**
   * `GET /knowledge_bases/{knowledge_base_id}/categories`.
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async listCategories(
    query?: ListCategoriesInKnowledgeBaseQuery,
  ): Promise<WithNormalizedPagination<ListCategoriesInKnowledgeBaseResponse>> {
    const path = FrontBase.expandPath("/knowledge_bases/{knowledge_base_id}/categories", {
      knowledge_base_id: this.knowledgeBaseId,
    });
    return await this.base.requestJson<
      WithNormalizedPagination<ListCategoriesInKnowledgeBaseResponse>
    >("GET", path, { query: queryFromPaged(query) });
  }

  /**
   * `POST /knowledge_bases/{knowledge_base_id}/categories` (default locale).
   *
   * **Required scope:** `knowledge_bases:write`
   */
  async createCategoryDefault(
    body: KnowledgeBaseCategoryCreate,
  ): Promise<FrontKnowledgeBaseCategory> {
    const path = FrontBase.expandPath("/knowledge_bases/{knowledge_base_id}/categories", {
      knowledge_base_id: this.knowledgeBaseId,
    });
    const data = await this.base.requestJson<KnowledgeBaseCategoryResponse>("POST", path, { body });
    return new FrontKnowledgeBaseCategory(this.base, data.id, data);
  }

  /**
   * `POST /knowledge_bases/{knowledge_base_id}/locales/{locale}/categories`.
   *
   * **Required scope:** `knowledge_bases:write`
   */
  async createCategoryLocale(
    locale: string,
    body: KnowledgeBaseCategoryCreate,
  ): Promise<FrontKnowledgeBaseCategory> {
    const path = FrontBase.expandPath(
      "/knowledge_bases/{knowledge_base_id}/locales/{locale}/categories",
      { knowledge_base_id: this.knowledgeBaseId, locale },
    );
    const data = await this.base.requestJson<KnowledgeBaseCategoryResponse>("POST", path, { body });
    return new FrontKnowledgeBaseCategory(this.base, data.id, data);
  }
}

/**
 * One knowledge base article (`/knowledge_base_articles/{article_id}/…`).
 */
export class FrontKnowledgeBaseArticle {
  private readonly base: FrontBase;
  private readonly articleId: string;
  private snapshot: KnowledgeBaseArticleSlimResponse | KnowledgeBaseArticleResponse | undefined;

  constructor(
    base: FrontBase,
    articleId: string,
    snapshot?: KnowledgeBaseArticleSlimResponse | KnowledgeBaseArticleResponse,
  ) {
    this.base = base;
    this.articleId = articleId;
    this.snapshot = snapshot;
  }

  get id(): string {
    return this.articleId;
  }

  get data():
    | Readonly<KnowledgeBaseArticleSlimResponse | KnowledgeBaseArticleResponse>
    | undefined {
    return this.snapshot;
  }

  /**
   * `GET /knowledge_base_articles/{article_id}`.
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async refresh(): Promise<this> {
    const path = FrontBase.expandPath("/knowledge_base_articles/{article_id}", {
      article_id: this.articleId,
    });
    this.snapshot = await this.base.requestJson<KnowledgeBaseArticleSlimResponse>("GET", path);
    return this;
  }

  /**
   * `DELETE /knowledge_base_articles/{article_id}`.
   *
   * **Required scope:** `knowledge_bases:delete`
   */
  async delete(): Promise<KnowledgeBaseArticleSlimResponse> {
    const path = FrontBase.expandPath("/knowledge_base_articles/{article_id}", {
      article_id: this.articleId,
    });
    return await this.base.requestJson<KnowledgeBaseArticleSlimResponse>("DELETE", path);
  }

  /**
   * `GET /knowledge_base_articles/{article_id}/content` (default locale).
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async getContentDefault(): Promise<KnowledgeBaseArticleResponse> {
    const path = FrontBase.expandPath("/knowledge_base_articles/{article_id}/content", {
      article_id: this.articleId,
    });
    return await this.base.requestJson<KnowledgeBaseArticleResponse>("GET", path);
  }

  /**
   * `PATCH /knowledge_base_articles/{article_id}/content` (default locale).
   *
   * **Required scope:** `knowledge_bases:write`
   */
  async updateContentDefault(
    body: KnowledgeBaseArticlePatch,
  ): Promise<KnowledgeBaseArticleResponse> {
    const path = FrontBase.expandPath("/knowledge_base_articles/{article_id}/content", {
      article_id: this.articleId,
    });
    return await this.base.requestJson<KnowledgeBaseArticleResponse>("PATCH", path, {
      body,
    });
  }

  /**
   * `GET /knowledge_base_articles/{article_id}/locales/{locale}/content`.
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async getContentLocale(locale: string): Promise<KnowledgeBaseArticleResponse> {
    const path = FrontBase.expandPath(
      "/knowledge_base_articles/{article_id}/locales/{locale}/content",
      { article_id: this.articleId, locale },
    );
    return await this.base.requestJson<KnowledgeBaseArticleResponse>("GET", path);
  }

  /**
   * `PATCH /knowledge_base_articles/{article_id}/locales/{locale}/content`.
   *
   * **Required scope:** `knowledge_bases:write`
   */
  async updateContentLocale(
    locale: string,
    body: KnowledgeBaseArticlePatch,
  ): Promise<KnowledgeBaseArticleResponse> {
    const path = FrontBase.expandPath(
      "/knowledge_base_articles/{article_id}/locales/{locale}/content",
      { article_id: this.articleId, locale },
    );
    return await this.base.requestJson<KnowledgeBaseArticleResponse>("PATCH", path, {
      body,
    });
  }

  /**
   * `GET /knowledge_base_articles/{article_id}/download/{attachment_id}` — raw {@link Response} (binary).
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async downloadAttachment(attachmentId: string): Promise<Response> {
    const path = FrontBase.expandPath(
      "/knowledge_base_articles/{article_id}/download/{attachment_id}",
      { article_id: this.articleId, attachment_id: attachmentId },
    );
    return await this.base.requestWithoutParsingBody("GET", path);
  }
}

/**
 * One knowledge base category (`/knowledge_base_categories/{category_id}/…`).
 */
export class FrontKnowledgeBaseCategory {
  private readonly base: FrontBase;
  private readonly categoryId: string;
  private snapshot: KnowledgeBaseCategorySlimResponse | KnowledgeBaseCategoryResponse | undefined;

  constructor(
    base: FrontBase,
    categoryId: string,
    snapshot?: KnowledgeBaseCategorySlimResponse | KnowledgeBaseCategoryResponse,
  ) {
    this.base = base;
    this.categoryId = categoryId;
    this.snapshot = snapshot;
  }

  get id(): string {
    return this.categoryId;
  }

  get data():
    | Readonly<KnowledgeBaseCategorySlimResponse | KnowledgeBaseCategoryResponse>
    | undefined {
    return this.snapshot;
  }

  /**
   * `GET /knowledge_base_categories/{category_id}`.
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async refresh(): Promise<this> {
    const path = FrontBase.expandPath("/knowledge_base_categories/{category_id}", {
      category_id: this.categoryId,
    });
    this.snapshot = await this.base.requestJson<KnowledgeBaseCategorySlimResponse>("GET", path);
    return this;
  }

  /**
   * `DELETE /knowledge_base_categories/{category_id}`.
   *
   * **Required scope:** `knowledge_bases:delete`
   */
  async delete(): Promise<void> {
    const path = FrontBase.expandPath("/knowledge_base_categories/{category_id}", {
      category_id: this.categoryId,
    });
    await this.base.requestJson<undefined>("DELETE", path);
  }

  /**
   * `GET /knowledge_base_categories/{category_id}/articles`.
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async listArticles(
    query?: ListArticlesInCategoryQuery,
  ): Promise<WithNormalizedPagination<ListArticlesInCategoryResponse>> {
    const path = FrontBase.expandPath("/knowledge_base_categories/{category_id}/articles", {
      category_id: this.categoryId,
    });
    return await this.base.requestJson<WithNormalizedPagination<ListArticlesInCategoryResponse>>(
      "GET",
      path,
      { query: queryFromPaged(query) },
    );
  }

  /**
   * `GET /knowledge_base_categories/{category_id}/content` (default locale).
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async getContentDefault(): Promise<KnowledgeBaseCategoryResponse> {
    const path = FrontBase.expandPath("/knowledge_base_categories/{category_id}/content", {
      category_id: this.categoryId,
    });
    return await this.base.requestJson<KnowledgeBaseCategoryResponse>("GET", path);
  }

  /**
   * `PATCH /knowledge_base_categories/{category_id}/content` (default locale).
   *
   * **Required scope:** `knowledge_bases:write`
   */
  async updateContentDefault(
    body: KnowledgeBaseCategoryPatch,
  ): Promise<KnowledgeBaseCategoryResponse> {
    const path = FrontBase.expandPath("/knowledge_base_categories/{category_id}/content", {
      category_id: this.categoryId,
    });
    return await this.base.requestJson<KnowledgeBaseCategoryResponse>("PATCH", path, {
      body,
    });
  }

  /**
   * `GET /knowledge_base_categories/{category_id}/locales/{locale}/content`.
   *
   * **Required scope:** `knowledge_bases:read`
   */
  async getContentLocale(locale: string): Promise<KnowledgeBaseCategoryResponse> {
    const path = FrontBase.expandPath(
      "/knowledge_base_categories/{category_id}/locales/{locale}/content",
      { category_id: this.categoryId, locale },
    );
    return await this.base.requestJson<KnowledgeBaseCategoryResponse>("GET", path);
  }

  /**
   * `PATCH /knowledge_base_categories/{category_id}/locales/{locale}/content`.
   *
   * **Required scope:** `knowledge_bases:write`
   */
  async updateContentLocale(
    locale: string,
    body: KnowledgeBaseCategoryPatch,
  ): Promise<KnowledgeBaseCategoryResponse> {
    const path = FrontBase.expandPath(
      "/knowledge_base_categories/{category_id}/locales/{locale}/content",
      { category_id: this.categoryId, locale },
    );
    return await this.base.requestJson<KnowledgeBaseCategoryResponse>("PATCH", path, {
      body,
    });
  }
}
