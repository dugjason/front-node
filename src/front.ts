import type { APIClient } from "./core/client"
import { APIClient as CoreClient } from "./core/client"
import { Accounts } from "./endpoints/accounts"
import { Analytics } from "./endpoints/analytics"
import { Applications } from "./endpoints/applications"
import { Attachments } from "./endpoints/attachments"
import { Channels } from "./endpoints/channels"
import { Comments } from "./endpoints/comments"
import { Contacts } from "./endpoints/contacts"
import { Conversations } from "./endpoints/conversations"
import { Drafts } from "./endpoints/drafts"
import { Events } from "./endpoints/events"
import { Inboxes } from "./endpoints/inboxes"
import { KnowledgeBaseArticles } from "./endpoints/knowledge-base-articles"
import { KnowledgeBases } from "./endpoints/knowledge-bases"
import { Links } from "./endpoints/links"
import { MessageTemplateFolders } from "./endpoints/message-template-folders"
import { MessageTemplates } from "./endpoints/message-templates"
import { Messages } from "./endpoints/messages"
import { Rules } from "./endpoints/rules"
import { Shifts } from "./endpoints/shifts"
import { Signatures } from "./endpoints/signatures"
import { Statuses } from "./endpoints/statuses"
import { Tags } from "./endpoints/tags"
import { TeammateGroups } from "./endpoints/teammate-groups"
import { Teammates } from "./endpoints/teammates"
import { Teams } from "./endpoints/teams"

import { apiTokenDetails } from "./generated/sdk.gen"
import type { FrontConfig } from "./types"

export class Front {
  private client: APIClient

  constructor(config?: FrontConfig) {
    // Initializes auth
    this.client = new CoreClient(config)
  }

  /* Resource accessors */

  private _accounts?: Accounts
  get accounts(): Accounts {
    return (this._accounts ??= new Accounts())
  }

  private _analytics?: Analytics
  get analytics(): Analytics {
    return (this._analytics ??= new Analytics())
  }

  private _applications?: Applications
  get applications(): Applications {
    return (this._applications ??= new Applications())
  }

  private _attachments?: Attachments
  get attachments(): Attachments {
    return (this._attachments ??= new Attachments())
  }

  private _channels?: Channels
  get channels(): Channels {
    return (this._channels ??= new Channels())
  }

  private _comments?: Comments
  get comments(): Comments {
    return (this._comments ??= new Comments())
  }

  private _contacts?: Contacts
  get contacts(): Contacts {
    return (this._contacts ??= new Contacts())
  }

  private _conversations?: Conversations
  get conversations(): Conversations {
    return (this._conversations ??= new Conversations())
  }

  private _drafts?: Drafts
  get drafts(): Drafts {
    return (this._drafts ??= new Drafts())
  }

  private _events?: Events
  get events(): Events {
    return (this._events ??= new Events())
  }

  private _inboxes?: Inboxes
  get inboxes(): Inboxes {
    return (this._inboxes ??= new Inboxes())
  }

  private _knowledgeBaseArticles?: KnowledgeBaseArticles
  get knowledgeBaseArticles(): KnowledgeBaseArticles {
    return (this._knowledgeBaseArticles ??= new KnowledgeBaseArticles())
  }

  private _knowledgeBases?: KnowledgeBases
  get knowledgeBases(): KnowledgeBases {
    return (this._knowledgeBases ??= new KnowledgeBases())
  }

  private _links?: Links
  get links(): Links {
    return (this._links ??= new Links())
  }

  private _messageTemplateFolders?: MessageTemplateFolders
  get messageTemplateFolders(): MessageTemplateFolders {
    return (this._messageTemplateFolders ??= new MessageTemplateFolders())
  }

  private _messageTemplates?: MessageTemplates
  get messageTemplates(): MessageTemplates {
    return (this._messageTemplates ??= new MessageTemplates())
  }

  private _messages?: Messages
  get messages(): Messages {
    return (this._messages ??= new Messages())
  }

  private _rules?: Rules
  get rules(): Rules {
    return (this._rules ??= new Rules())
  }

  private _shifts?: Shifts
  get shifts(): Shifts {
    return (this._shifts ??= new Shifts())
  }

  private _signatures?: Signatures
  get signatures(): Signatures {
    return (this._signatures ??= new Signatures())
  }

  private _statuses?: Statuses
  get statuses(): Statuses {
    return (this._statuses ??= new Statuses())
  }

  private _tags?: Tags
  get tags(): Tags {
    return (this._tags ??= new Tags())
  }

  private _teammates?: Teammates
  get teammates(): Teammates {
    return (this._teammates ??= new Teammates())
  }

  private _teammateGroups?: TeammateGroups
  get teammateGroups(): TeammateGroups {
    return (this._teammateGroups ??= new TeammateGroups())
  }

  private _teams?: Teams
  get teams(): Teams {
    return (this._teams ??= new Teams())
  }

  /**
   * Fetch the details of the API token
   *
   * @returns Promise<TokenIdentity> The token identity information
   */
  async me() {
    const { data, response } = await apiTokenDetails()
    if (!data) {
      throw new Error("Failed to fetch token identity")
    }
    return { tokenIdentity: data, response }
  }

  /**
   * Get the underlying HTTP client for advanced usage
   */
  getClient(): APIClient {
    return this.client
  }

  /**
   * Get the OAuth token manager (if using OAuth)
   */
  getOAuthManager() {}

  /**
   * Update OAuth configuration (useful for updating tokens)
   */
  updateOAuthConfig(_updates: Partial<FrontConfig["oauth"]>) {}
}
