import type { PagePair } from "../core/paginator"
import { buildPageFromListResponse, makePagedResult } from "../core/paginator"
import { APIResource } from "../core/resource"
import {
  createAKnowledgeBase,
  createArticleInAKnowledgeBaseInDefaultLocale,
  createKnowledgeBaseCategoryInDefaultLocale,
  getAKnowledgeBase,
  getAKnowledgeBaseWithContentInDefaultLocale,
  getAKnowledgeBaseWithContentInSpecifiedLocale,
  listArticlesInAKnowledgeBase,
  listCategoriesInAKnowledgeBase,
  listKnowledgeBases,
  updateKnowledgeBaseInDefaultLocale,
  updateKnowledgeBaseInSpecifiedLocale,
} from "../generated/sdk.gen"
import type {
  CreateAKnowledgeBaseData,
  CreateArticleInAKnowledgeBaseInDefaultLocaleData,
  CreateKnowledgeBaseCategoryInDefaultLocaleData,
  GetAKnowledgeBaseResponse,
  GetAKnowledgeBaseWithContentInDefaultLocaleResponse,
  GetAKnowledgeBaseWithContentInSpecifiedLocaleData,
  GetAKnowledgeBaseWithContentInSpecifiedLocaleResponse,
  KnowledgeBaseResponse,
  KnowledgeBaseSlimResponse,
  ListArticlesInAKnowledgeBaseData,
  ListArticlesInAKnowledgeBaseResponse,
  ListCategoriesInAKnowledgeBaseData,
  ListCategoriesInAKnowledgeBaseResponse,
  ListKnowledgeBasesResponse,
  UpdateKnowledgeBaseInDefaultLocaleData,
  UpdateKnowledgeBaseInSpecifiedLocaleData,
} from "../generated/types.gen"
import { FrontKnowledgeBaseArticle } from "../resources/knowledge-base-articles"
import { FrontKnowledgeBaseCategory } from "../resources/knowledge-base-categories"
import { FrontKnowledgeBase } from "../resources/knowledge-bases"

type KnowledgeBaseRaw = KnowledgeBaseResponse | KnowledgeBaseSlimResponse

export class KnowledgeBases extends APIResource<
  FrontKnowledgeBase,
  KnowledgeBaseRaw
> {
  protected makeItem(raw: KnowledgeBaseRaw): FrontKnowledgeBase {
    return new FrontKnowledgeBase(raw)
  }

  // CREATE
  async create(
    body: NonNullable<CreateAKnowledgeBaseData["body"]>,
  ): Promise<{ knowledgeBase: FrontKnowledgeBase; response: Response }> {
    const { item, response } = await this.createOne<KnowledgeBaseResponse>({
      createCall: () => createAKnowledgeBase({ body }),
    })
    return { knowledgeBase: item, response }
  }

  // READ
  async list(): Promise<{ response: Response; data: FrontKnowledgeBase[] }> {
    return this.listWithoutPagination<ListKnowledgeBasesResponse>({
      listCall: () => listKnowledgeBases(),
    })
  }

  async get(
    knowledgeBaseId: string,
  ): Promise<{ knowledgeBase: FrontKnowledgeBase; response: Response }> {
    const { item, response } = await this.getOne<GetAKnowledgeBaseResponse>({
      getCall: () =>
        getAKnowledgeBase({
          path: { knowledge_base_id: knowledgeBaseId },
        }),
    })
    return { knowledgeBase: item, response }
  }

  async getWithContentInDefaultLocale(
    knowledgeBaseId: string,
  ): Promise<{ knowledgeBase: FrontKnowledgeBase; response: Response }> {
    const { item, response } =
      await this.getOne<GetAKnowledgeBaseWithContentInDefaultLocaleResponse>({
        getCall: () =>
          getAKnowledgeBaseWithContentInDefaultLocale({
            path: { knowledge_base_id: knowledgeBaseId },
          }),
      })
    return { knowledgeBase: item, response }
  }

  async getWithContentInSpecifiedLocale(
    knowledgeBaseId: string,
    locale: GetAKnowledgeBaseWithContentInSpecifiedLocaleData["path"]["locale"],
  ): Promise<{ knowledgeBase: FrontKnowledgeBase; response: Response }> {
    const { item, response } =
      await this.getOne<GetAKnowledgeBaseWithContentInSpecifiedLocaleResponse>({
        getCall: () =>
          getAKnowledgeBaseWithContentInSpecifiedLocale({
            path: { knowledge_base_id: knowledgeBaseId, locale },
          }),
      })
    return { knowledgeBase: item, response }
  }

  // UPDATE
  async updateInDefaultLocale(
    knowledgeBaseId: string,
    body: NonNullable<UpdateKnowledgeBaseInDefaultLocaleData["body"]>,
  ): Promise<{ knowledgeBase: FrontKnowledgeBase; response: Response }> {
    const { response } = await updateKnowledgeBaseInDefaultLocale({
      path: { knowledge_base_id: knowledgeBaseId },
      body,
    })
    const refreshed = await this.getWithContentInDefaultLocale(knowledgeBaseId)
    return { knowledgeBase: refreshed.knowledgeBase, response }
  }

  async updateInSpecifiedLocale(
    knowledgeBaseId: string,
    locale: UpdateKnowledgeBaseInSpecifiedLocaleData["path"]["locale"],
    body: NonNullable<UpdateKnowledgeBaseInSpecifiedLocaleData["body"]>,
  ): Promise<{ knowledgeBase: FrontKnowledgeBase; response: Response }> {
    const { response } = await updateKnowledgeBaseInSpecifiedLocale({
      path: { knowledge_base_id: knowledgeBaseId, locale },
      body,
    })
    const refreshed = await this.getWithContentInSpecifiedLocale(
      knowledgeBaseId,
      locale,
    )
    return { knowledgeBase: refreshed.knowledgeBase, response }
  }

  // SUB-COLLECTIONS
  async listArticles(
    knowledgeBaseId: string,
    query?: ListArticlesInAKnowledgeBaseData["query"],
  ): Promise<
    PagePair<FrontKnowledgeBaseArticle> &
      AsyncIterable<PagePair<FrontKnowledgeBaseArticle>>
  > {
    const { response, data } = await listArticlesInAKnowledgeBase({
      path: { knowledge_base_id: knowledgeBaseId },
      query,
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontKnowledgeBaseArticle,
      ListArticlesInAKnowledgeBaseResponse
    >({
      data,
      mapItems: (d) =>
        (d._results ?? []).map((raw) => new FrontKnowledgeBaseArticle(raw)),
      fetchNext: async (pageToken) => {
        const next = await listArticlesInAKnowledgeBase({
          path: { knowledge_base_id: knowledgeBaseId },
          query: { ...(query ?? {}), page_token: pageToken },
        })
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  async createArticleInDefaultLocale(
    knowledgeBaseId: string,
    body: NonNullable<CreateArticleInAKnowledgeBaseInDefaultLocaleData["body"]>,
  ): Promise<{ article: FrontKnowledgeBaseArticle; response: Response }> {
    const { data, response } =
      await createArticleInAKnowledgeBaseInDefaultLocale({
        path: { knowledge_base_id: knowledgeBaseId },
        body,
      })

    if (!data) throw new Error("Missing data")
    return {
      article: new FrontKnowledgeBaseArticle(data),
      response,
    }
  }

  async listCategories(
    knowledgeBaseId: string,
    query?: ListCategoriesInAKnowledgeBaseData["query"],
  ): Promise<
    PagePair<FrontKnowledgeBaseCategory> &
      AsyncIterable<PagePair<FrontKnowledgeBaseCategory>>
  > {
    const { response, data } = await listCategoriesInAKnowledgeBase({
      path: { knowledge_base_id: knowledgeBaseId },
      query,
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontKnowledgeBaseCategory,
      ListCategoriesInAKnowledgeBaseResponse
    >({
      data,
      mapItems: (d) =>
        (d._results ?? []).map((raw) => new FrontKnowledgeBaseCategory(raw)),
      fetchNext: async (pageToken) => {
        const next = await listCategoriesInAKnowledgeBase({
          path: { knowledge_base_id: knowledgeBaseId },
          query: { ...(query ?? {}), page_token: pageToken },
        })
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  async createCategoryInDefaultLocale(
    knowledgeBaseId: string,
    body: NonNullable<CreateKnowledgeBaseCategoryInDefaultLocaleData["body"]>,
  ): Promise<{ category: FrontKnowledgeBaseCategory; response: Response }> {
    const { data, response } = await createKnowledgeBaseCategoryInDefaultLocale(
      {
        path: { knowledge_base_id: knowledgeBaseId },
        body,
      },
    )
    if (!data) throw new Error("Missing data")
    return {
      category: new FrontKnowledgeBaseCategory(data),
      response,
    }
  }
}
