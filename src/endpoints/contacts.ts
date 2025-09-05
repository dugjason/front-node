import {
  buildPageFromListResponse,
  makePagedResult,
  type PagePair,
} from "../core/paginator"
import { APIResource } from "../core/resource"
import {
  addContactHandle,
  addNote as addContactNote,
  createContact,
  deleteAContact,
  deleteContactHandle,
  getContact,
  listContactConversations,
  listContactCustomFields,
  listNotes as listContactNotes,
  listContacts,
  mergeContacts,
  updateAContact,
} from "../generated/sdk.gen"
import type {
  AddContactHandleData,
  AddNoteData,
  Contact,
  ContactNoteResponses,
  ContactResponse,
  CreateContact,
  CustomFieldResponse,
  DeleteContactHandleData,
  GetContactResponse,
  ListContactConversationsData,
  ListContactConversationsResponse,
  ListContactsData,
  ListContactsResponse,
  MergeContacts,
  UpdateAContactData,
} from "../generated/types.gen"
import { FrontContact } from "../resources/contacts"
import { FrontConversation } from "../resources/conversations"

export class Contacts extends APIResource<FrontContact, ContactResponse> {
  protected makeItem(raw: ContactResponse): FrontContact {
    return new FrontContact(raw)
  }

  /** CREATE **/
  async create(
    body: CreateContact,
  ): Promise<{ contact: FrontContact; response: Response }> {
    const { item, response } = await this.createOne<ContactResponse>({
      createCall: () => createContact({ body }),
    })
    return { contact: item, response }
  }

  /** READ **/
  async list(
    query?: ListContactsData["query"],
  ): Promise<PagePair<FrontContact> & AsyncIterable<PagePair<FrontContact>>> {
    return this.listPaginated<
      ListContactsResponse,
      { query?: ListContactsData["query"] }
    >({
      initialOptions: { query },
      listCall: (options) => listContacts({ ...options }),
    })
  }

  async get(
    contactId: string,
  ): Promise<{ contact: FrontContact; response: Response }> {
    const { item, response } = await this.getOne<GetContactResponse>({
      getCall: () => getContact({ path: { contact_id: contactId } }),
    })
    return { contact: item, response }
  }

  async listCustomFields(): Promise<{
    response: Response
    data: CustomFieldResponse[]
  }> {
    const { response, data } = await listContactCustomFields()
    return {
      response,
      data: data?._results ?? [],
    }
  }

  async listConversations(
    contactId: string,
    query?: ListContactConversationsData["query"],
  ): Promise<
    PagePair<FrontConversation> & AsyncIterable<PagePair<FrontConversation>>
  > {
    const { response, data } = await listContactConversations({
      path: { contact_id: contactId },
      query,
    })
    if (!data) throw new Error("No results")

    const page = buildPageFromListResponse<
      FrontConversation,
      ListContactConversationsResponse
    >({
      data,
      mapItems: (d) =>
        (d._results ?? []).map((raw) => new FrontConversation(raw)),
      fetchNext: async (pageToken) => {
        const next = await listContactConversations({
          path: { contact_id: contactId },
          query: { ...(query ?? {}), page_token: pageToken },
        })
        return { response: next.response, data: next.data }
      },
    })

    return makePagedResult({ response, page })
  }

  /** UPDATE **/
  async update(
    contactId: string,
    body: UpdateAContactData["body"] | Contact,
  ): Promise<{ contact: FrontContact; response: Response }> {
    const { response } = await updateAContact({
      path: { contact_id: contactId },
      body,
    })
    const refreshed = await this.get(contactId)
    return { contact: refreshed.contact, response }
  }

  async merge(
    body: MergeContacts,
  ): Promise<{ contact: FrontContact; response: Response }> {
    const { item, response } = await this.createOne<ContactResponse>({
      createCall: () => mergeContacts({ body }),
    })
    return { contact: item, response }
  }

  async addHandle(
    contactId: string,
    body: AddContactHandleData["body"],
  ): Promise<void> {
    await addContactHandle({ path: { contact_id: contactId }, body })
  }

  async deleteHandle(
    contactId: string,
    body: DeleteContactHandleData["body"],
  ): Promise<void> {
    await deleteContactHandle({ path: { contact_id: contactId }, body })
  }

  async listNotes(
    contactId: string,
  ): Promise<{ response: Response; data: ContactNoteResponses[] }> {
    const { response, data } = await listContactNotes({
      path: { contact_id: contactId },
    })
    return {
      response,
      data: data?._results ?? [],
    }
  }

  async addNote(
    contactId: string,
    body: AddNoteData["body"],
  ): Promise<{ response: Response; note?: ContactNoteResponses }> {
    const { response, data } = await addContactNote({
      path: { contact_id: contactId },
      body,
    })
    return { response, note: data }
  }

  /** DELETE **/
  async delete(contactId: string): Promise<void> {
    deleteAContact({ path: { contact_id: contactId } })
  }
}
