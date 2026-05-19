import { FrontBase } from "./base";
import { FrontAccounts } from "./resources/accounts";
import { FrontAnalytics } from "./resources/analytics";
import { FrontApplications } from "./resources/applications";
import { FrontChannels } from "./resources/channels";
import { FrontComments } from "./resources/comments";
import { FrontCompany } from "./resources/company";
import { FrontContactLists } from "./resources/contact-lists";
import { FrontContacts } from "./resources/contacts";
import { FrontConversations } from "./resources/conversations";
import { FrontCustomFieldsGlobal } from "./resources/custom-fields-global";
import { FrontDownloads } from "./resources/downloads";
import { FrontDrafts } from "./resources/drafts";
import { FrontEvents } from "./resources/events";
import { FrontInboxes } from "./resources/inboxes";
import { FrontKnowledgeBases } from "./resources/knowledge";
import { FrontLinks } from "./resources/links";
import { FrontMe } from "./resources/me";
import { FrontMessageTemplateFolders } from "./resources/message-template-folders";
import { FrontMessageTemplates } from "./resources/message-templates";
import { FrontMessages } from "./resources/messages";
import { FrontRules } from "./resources/rules";
import { FrontShifts } from "./resources/shifts";
import { FrontSignatures } from "./resources/signatures";
import { FrontTags } from "./resources/tags";
import { FrontTeammateGroups } from "./resources/teammate-groups";
import { FrontTeammates } from "./resources/teammates";
import { FrontTeams } from "./resources/teams";
import { FrontViews } from "./resources/views";

const DEFAULT_BASE_URL = "https://api2.frontapp.com";

const resolveFrontApiToken = (): string | undefined => {
  const raw = process.env.FRONT_API_TOKEN;
  if (!raw) {
    return;
  }
  const v = raw.trim();
  return v.length > 0 ? v : undefined;
};

/** Options for the {@link Front} client constructor. */
export interface FrontOptions {
  /**
   * Front API token (Bearer). If omitted, reads `FRONT_API_TOKEN` from `process.env`.
   */
  apiKey?: string;
  /** Override the API base URL (default `https://api2.frontapp.com`). */
  baseUrl?: string;
  /** Use a custom `fetch` implementation (defaults to `globalThis.fetch`). */
  fetch?: typeof fetch;
}

/**
 * Application entry point for the Front REST API.
 *
 * Resource namespaces mirror OpenAPI path groups (accounts, analytics, applications, channels,
 * comments, company, contact lists, contacts, conversations, custom fields, downloads, drafts,
 * events, inboxes, knowledge bases, links, identity, message templates, messages, rules, shifts,
 * teammate groups, teams, tags, signatures, teammates, views).
 *
 * @see https://dev.frontapp.com/reference/introduction
 */
export class Front extends FrontBase {
  /** Accounts under `/accounts` (list, create, get) and `/accounts/custom_fields`. */
  readonly accounts: FrontAccounts;
  /** Analytics exports and reports under `/analytics/exports` and `/analytics/reports`. */
  readonly analytics: FrontAnalytics;
  /** Application triggers under `/applications/{application_uid}/events`. */
  readonly applications: FrontApplications;
  /** Channels under `/channels` and `/channels/{channel_id}`. */
  readonly channels: FrontChannels;
  /** Comments under `/comments/{comment_id}` and related sub-routes. */
  readonly comments: FrontComments;
  /** Company rules, ticket statuses, and company tags under `/company/*`. */
  readonly company: FrontCompany;
  /** Contact lists under `/contact_lists`. */
  readonly contactLists: FrontContactLists;
  /** Contacts under `/contacts`. */
  readonly contacts: FrontContacts;
  /** Conversations under `/conversations`. */
  readonly conversations: FrontConversations;
  /** Company-wide contact custom field definitions (`GET /custom_fields`). */
  readonly customFieldsGlobal: FrontCustomFieldsGlobal;
  /** Attachment download by link id (`GET /download/{attachment_link_id}`). */
  readonly downloads: FrontDownloads;
  /** Drafts under `/drafts`. */
  readonly drafts: FrontDrafts;
  /** Events under `/events`. */
  readonly events: FrontEvents;
  /** Inboxes under `/inboxes`. */
  readonly inboxes: FrontInboxes;
  /** Knowledge bases, articles, and categories (`/knowledge_bases`, `/knowledge_base_*`). */
  readonly knowledgeBases: FrontKnowledgeBases;
  /** Links under `/links`. */
  readonly links: FrontLinks;
  /** Current token identity (`GET /me`). */
  readonly me: FrontMe;
  /** Message template folders under `/message_template_folders`. */
  readonly messageTemplateFolders: FrontMessageTemplateFolders;
  /** Message templates under `/message_templates`. */
  readonly messageTemplates: FrontMessageTemplates;
  /** Messages under `/messages`. */
  readonly messages: FrontMessages;
  /** Rules under `/rules` (not `/company/rules`). */
  readonly rules: FrontRules;
  /** Shifts under `/shifts`. */
  readonly shifts: FrontShifts;
  /** Tags under `/tags` (company scope for the token). */
  readonly tags: FrontTags;
  /** Signatures under `/signatures/{id}` plus teammate/team list and create routes. */
  readonly signatures: FrontSignatures;
  /** Teammate groups under `/teammate_groups`. */
  readonly teammateGroups: FrontTeammateGroups;
  /** Teammates under `/teammates` and `/teammates/{id}` (non-deprecated Teammates operations). */
  readonly teammates: FrontTeammates;
  /** Teams under `/teams`. */
  readonly teams: FrontTeams;
  /** Views under `/views`. */
  readonly views: FrontViews;

  /**
   * @param options API credentials and optional HTTP overrides. A token is required either here or via `FRONT_API_TOKEN`.
   * @throws Error when no API token can be resolved.
   */
  constructor(options?: FrontOptions) {
    const { apiKey, baseUrl, fetch: fetchOption } = options ?? {};
    const token = apiKey ?? resolveFrontApiToken();
    if (!token) {
      throw new Error(
        'Front API token is required. Set FRONT_API_TOKEN in the environment or pass { apiKey: "..." } to the Front constructor.',
      );
    }
    super({
      apiKey: token,
      baseUrl: baseUrl ?? DEFAULT_BASE_URL,
      ...(fetchOption === undefined ? {} : { fetch: fetchOption }),
    });
    this.accounts = new FrontAccounts(this);
    this.analytics = new FrontAnalytics(this);
    this.applications = new FrontApplications(this);
    this.channels = new FrontChannels(this);
    this.comments = new FrontComments(this);
    this.company = new FrontCompany(this);
    this.contactLists = new FrontContactLists(this);
    this.contacts = new FrontContacts(this);
    this.conversations = new FrontConversations(this);
    this.customFieldsGlobal = new FrontCustomFieldsGlobal(this);
    this.downloads = new FrontDownloads(this);
    this.drafts = new FrontDrafts(this);
    this.events = new FrontEvents(this);
    this.inboxes = new FrontInboxes(this);
    this.knowledgeBases = new FrontKnowledgeBases(this);
    this.links = new FrontLinks(this);
    this.me = new FrontMe(this);
    this.messageTemplateFolders = new FrontMessageTemplateFolders(this);
    this.messageTemplates = new FrontMessageTemplates(this);
    this.messages = new FrontMessages(this);
    this.rules = new FrontRules(this);
    this.shifts = new FrontShifts(this);
    this.tags = new FrontTags(this);
    this.signatures = new FrontSignatures(this);
    this.teammateGroups = new FrontTeammateGroups(this);
    this.teammates = new FrontTeammates(this);
    this.teams = new FrontTeams(this);
    this.views = new FrontViews(this);
  }
}
