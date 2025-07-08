// Main SDK class

export { FrontClient } from "./client"
// Client and configuration types
export { Front } from "./front"
export { OAuthTokenManager } from "./oauth"

// Export all resource classes
export { Accounts } from "./resources/accounts"
export { Contacts } from "./resources/contacts"
export { Conversations } from "./resources/conversations"
export { Drafts } from "./resources/drafts"
export { Tags } from "./resources/tags"
export { Teammates } from "./resources/teammates"

// Export all types
export type {
  Account,
  AccountContactsParams,
  Contact,
  ContactHandle,
  ContactNote,
  ContactNotesParams,
  ContactsListParams,
  Conversation,
  CreateAccountData,
  CreateContactData,
  CreateContactHandleData,
  CreateContactNoteData,
  CreateDraftData,
  CreateDraftReplyData,
  CreateTagData,
  DeleteDraftData,
  Draft,
  EditDraftData,
  FrontConfig,
  FrontError,
  ListResponse,
  MergeContactsData,
  Message,
  OAuthConfig,
  OAuthTokens,
  PaginationParams,
  RequestOptions,
  Tag,
  TagsListParams,
  Teammate,
  TokenIdentity,
  UpdateAccountData,
  UpdateContactData,
  UpdateTagData,
  UpdateTeammateData,
} from "./types"
