// Main SDK class
export { APIClient } from "./core/client"
// Client and configuration types
export { Front } from "./front"
export { OAuthTokenManager } from "./oauth"

// Resources
export type { FrontAccount } from "./resources/accounts"
export type {
  FrontAnalyticsExport,
  FrontAnalyticsReport,
} from "./resources/analytics"
export type { FrontApplication } from "./resources/applications"
export type { FrontComment } from "./resources/comments"
export type { FrontContact } from "./resources/contacts"
export type { FrontConversation } from "./resources/conversations"
export type { FrontDraft } from "./resources/drafts"
export type { FrontEvent } from "./resources/events"
export type { FrontInbox } from "./resources/inboxes"
export type { FrontKnowledgeBaseArticle } from "./resources/knowledge-base-articles"
export type { FrontKnowledgeBase } from "./resources/knowledge-bases"
export type { FrontLink } from "./resources/links"
export type { FrontMessageTemplateFolder } from "./resources/message-template-folders"
export type { FrontMessageTemplate } from "./resources/message-templates"
export type { FrontMessage } from "./resources/messages"
export type { FrontRule } from "./resources/rules"
export type { FrontShift } from "./resources/shifts"
export type { FrontSignature } from "./resources/signatures"
export type { FrontStatus } from "./resources/statuses"
export type { FrontTag } from "./resources/tags"
export type { FrontTeammateGroup } from "./resources/teammate-groups"
export type { FrontTeammate } from "./resources/teammates"
export type { FrontTeam } from "./resources/teams"

// Export all internal types
export type {
  FrontConfig,
  FrontError,
  ListResponse,
  OAuthConfig,
  OAuthTokens,
  PaginationParams,
  RequestOptions,
} from "./types"
