import { FrontBase } from "./base";
import type { FrontBaseOptions } from "./base";
import { FrontApiError } from "./errors";
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
const OAUTH_TOKEN_URL = "https://app.frontapp.com/oauth/token";

const trimToUndefined = (value: string | undefined): string | undefined =>
  value?.trim() || undefined;

const resolveFrontApiToken = (): string | undefined => trimToUndefined(process.env.FRONT_API_TOKEN);

/** Shared HTTP overrides for {@link Front}. */
export interface FrontRequestOptions {
  /** Override the API base URL (default `https://api2.frontapp.com`). */
  baseUrl?: string;
  /** Use a custom `fetch` implementation (defaults to `globalThis.fetch`). */
  fetch?: typeof fetch;
  /** Override the User-Agent header sent with every request. */
  userAgent?: string;
}

/** API-token credentials for {@link Front}. */
export type FrontApiKeyOptions = FrontRequestOptions & {
  /**
   * Front API token (Bearer). If omitted, reads `FRONT_API_TOKEN` from `process.env`.
   */
  apiKey?: string;
  accessToken?: never;
  refreshToken?: never;
  onTokenRefresh?: never;
};

/** OAuth credentials for {@link Front}. Mutually exclusive with {@link FrontApiKeyOptions.apiKey}. */
export type FrontOAuthOptions = FrontRequestOptions & {
  apiKey?: never;
  /** OAuth access token sent as `Authorization: Bearer` on API requests. */
  accessToken: string;
  /** OAuth refresh token used by {@link Front.refreshOAuthToken}. */
  refreshToken: string;
  /** Optionally provide a function to handle the new tokens. */
  onTokenRefresh?: (tokens: FrontOAuthTokenResponse) => void | Promise<void>;
};

/** Options for the {@link Front} client constructor. */
export type FrontOptions = FrontApiKeyOptions | FrontOAuthOptions;

/** Parameters for {@link Front.refreshOAuthToken}. */
export interface FrontOAuthRefreshParams {
  /** OAuth application client ID. */
  clientId: string;
  /** OAuth application client secret. */
  clientSecret: string;
}

/**
 * Successful response from Front’s OAuth token endpoint.
 *
 * @see https://dev.frontapp.com/docs/oauth
 */
export interface FrontOAuthTokenResponse {
  access_token: string;
  refresh_token: string;
}

type ResolvedFrontAuth =
  | { type: "apiKey"; token: string }
  | { type: "oauth"; accessToken: string; refreshToken: string };

const isFrontOAuthTokenResponse = (value: unknown): value is FrontOAuthTokenResponse =>
  typeof value === "object" &&
  value !== null &&
  "access_token" in value &&
  "refresh_token" in value &&
  typeof value.access_token === "string" &&
  typeof value.refresh_token === "string";

const encodeBasicAuth = (clientId: string, clientSecret: string): string =>
  Buffer.from(`${clientId}:${clientSecret}`, "utf-8").toString("base64");

export const resolveFrontAuth = (options?: {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
}): ResolvedFrontAuth => {
  const apiKey = trimToUndefined(options?.apiKey);
  const accessToken = trimToUndefined(options?.accessToken);
  const refreshToken = trimToUndefined(options?.refreshToken);

  if (apiKey && (accessToken || refreshToken)) {
    throw new Error(
      "Front credentials must be either an API key or OAuth tokens, not both. Pass { apiKey } or { accessToken, refreshToken }.",
    );
  }
  if (accessToken || refreshToken) {
    if (!accessToken || !refreshToken) {
      throw new Error("OAuth credentials require both accessToken and refreshToken.");
    }
    return { accessToken, refreshToken, type: "oauth" };
  }

  const token = apiKey ?? resolveFrontApiToken();
  if (!token) {
    throw new Error(
      'Front credentials are required. Set FRONT_API_TOKEN in the environment, or pass { apiKey: "..." } or { accessToken, refreshToken } to the Front constructor.',
    );
  }
  return { token, type: "apiKey" };
};

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

  private oauthRefreshToken: string | undefined;
  private readonly onTokenRefresh: FrontOAuthOptions["onTokenRefresh"];

  /**
   * @param options API credentials and optional HTTP overrides. A token is required
   * as `{ apiKey }`, `{ accessToken, refreshToken }`, or `FRONT_API_TOKEN`.
   * @throws {Error} when credentials cannot be resolved, are incomplete, or mix API key with OAuth tokens.
   */
  constructor(options?: FrontOptions) {
    const auth = resolveFrontAuth(options);
    const { baseUrl, fetch: fetchOption, userAgent } = options ?? {};
    const baseOptions: FrontBaseOptions = {
      apiKey: auth.type === "oauth" ? auth.accessToken : auth.token,
      baseUrl: baseUrl ?? DEFAULT_BASE_URL,
    };
    if (fetchOption !== undefined) {
      baseOptions.fetch = fetchOption;
    }
    if (userAgent !== undefined) {
      baseOptions.userAgent = userAgent;
    }
    super(baseOptions);
    this.oauthRefreshToken = auth.type === "oauth" ? auth.refreshToken : undefined;
    this.onTokenRefresh = options?.onTokenRefresh;
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

  /**
   * Exchange the stored refresh token for a new access and refresh token pair.
   * Awaits `onTokenRefresh` before adopting the tokens. If the callback throws,
   * the refresh rejects and the client's credentials remain unchanged.
   * Does not run automatically on HTTP 401.
   *
   * @see https://dev.frontapp.com/docs/oauth
   */
  async refreshOAuthToken(params: FrontOAuthRefreshParams): Promise<FrontOAuthTokenResponse> {
    const refreshToken = this.oauthRefreshToken;
    if (!refreshToken) {
      throw new Error(
        "refreshOAuthToken() requires the Front client to be constructed with accessToken and refreshToken.",
      );
    }
    const clientId = trimToUndefined(params.clientId);
    const clientSecret = trimToUndefined(params.clientSecret);
    if (!clientId || !clientSecret) {
      throw new Error("refreshOAuthToken() requires clientId and clientSecret.");
    }

    const response = await this.fetchImpl(OAUTH_TOKEN_URL, {
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${encodeBasicAuth(clientId, clientSecret)}`,
        "Content-Type": "application/json",
        "User-Agent": this.userAgent,
      },
      method: "POST",
    });

    const text = await response.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
    if (!response.ok) {
      throw new FrontApiError(response, parsed);
    }
    if (!isFrontOAuthTokenResponse(parsed)) {
      throw new Error("Front OAuth token response is missing access_token or refresh_token.");
    }

    const tokens = {
      access_token: parsed.access_token,
      refresh_token: parsed.refresh_token,
    };
    await this.onTokenRefresh?.({ ...tokens });
    this.apiKey = tokens.access_token;
    this.oauthRefreshToken = tokens.refresh_token;
    return tokens;
  }
}
