import { FrontBase } from "../base";
import type { components } from "../gen/schema.gen";

export type AnalyticsExportRequest = components["schemas"]["AnalyticsExportRequest"];
export type AnalyticsExportResponse = components["schemas"]["AnalyticsExportResponse"];
export type AnalyticsFilters = components["schemas"]["AnalyticsFilters"];
export type AnalyticsMetricId = components["schemas"]["AnalyticsMetricId"];
export type AnalyticsReportRequest = components["schemas"]["AnalyticsReportRequest"];
export type AnalyticsReportResponse = components["schemas"]["AnalyticsReportResponse"];

/**
 * One analytics export job (`GET /analytics/exports/{export_id}`).
 *
 * There is no PATCH/DELETE on this path in the OpenAPI spec; use {@link refresh} to poll status.
 *
 * **Required scope:** `analytics:read`
 *
 * @see https://dev.frontapp.com/reference/analytics
 */
export class FrontAnalyticsExport {
  private state: AnalyticsExportResponse;
  private readonly base: FrontBase;

  constructor(base: FrontBase, snapshot: AnalyticsExportResponse) {
    this.base = base;
    this.state = structuredClone(snapshot);
  }

  get id(): string {
    return this.state.id;
  }

  get links(): AnalyticsExportResponse["_links"] {
    return this.state._links;
  }

  /** Full export JSON (status, progress, download URL when ready, …). */
  get data(): Readonly<AnalyticsExportResponse> {
    return this.state;
  }

  private selfPath(): string {
    return FrontBase.expandPath("/analytics/exports/{export_id}", {
      export_id: this.id,
    });
  }

  /**
   * Poll export status (`GET /analytics/exports/{export_id}`).
   *
   * **Required scope:** `analytics:read`
   */
  async refresh(): Promise<this> {
    const next = await this.base.requestJson<AnalyticsExportResponse>("GET", this.selfPath());
    this.state = structuredClone(next);
    return this;
  }
}

/**
 * One analytics report job (`GET /analytics/reports/{report_uid}`).
 *
 * Reports are keyed by `uid` (not `id`). There is no PATCH/DELETE on this path in the OpenAPI spec.
 *
 * **Required scope:** `analytics:read`
 *
 * @see https://dev.frontapp.com/reference/analytics
 */
export class FrontAnalyticsReport {
  private state: AnalyticsReportResponse;
  private readonly base: FrontBase;

  constructor(base: FrontBase, snapshot: AnalyticsReportResponse) {
    this.base = base;
    this.state = structuredClone(snapshot);
  }

  /** Report UID (path segment for {@link refresh}). */
  get uid(): string {
    return this.state.uid;
  }

  get links(): AnalyticsReportResponse["_links"] {
    return this.state._links;
  }

  get data(): Readonly<AnalyticsReportResponse> {
    return this.state;
  }

  private selfPath(): string {
    return FrontBase.expandPath("/analytics/reports/{report_uid}", {
      report_uid: this.uid,
    });
  }

  /**
   * Poll report status (`GET /analytics/reports/{report_uid}`).
   *
   * **Required scope:** `analytics:read`
   */
  async refresh(): Promise<this> {
    const next = await this.base.requestJson<AnalyticsReportResponse>("GET", this.selfPath());
    this.state = structuredClone(next);
    return this;
  }
}

/**
 * Analytics exports and reports (`/analytics/exports`, `/analytics/reports`).
 *
 * @see https://dev.frontapp.com/reference/analytics
 */
export class FrontAnalytics {
  private readonly base: FrontBase;

  /** @param base Shared HTTP client (in practice the `Front` instance). */
  constructor(base: FrontBase) {
    this.base = base;
  }

  /**
   * Create an export (`POST /analytics/exports`). Returns `201` with the export resource.
   *
   * **Required scope:** `analytics:read`
   */
  async createExport(body: AnalyticsExportRequest): Promise<FrontAnalyticsExport> {
    const data = await this.base.requestJson<AnalyticsExportResponse>(
      "POST",
      "/analytics/exports",
      { body },
    );
    return new FrontAnalyticsExport(this.base, data);
  }

  /**
   * Fetch an export (`GET /analytics/exports/{export_id}`).
   *
   * **Required scope:** `analytics:read`
   */
  async getExport(exportId: string): Promise<FrontAnalyticsExport> {
    const path = FrontBase.expandPath("/analytics/exports/{export_id}", {
      export_id: exportId,
    });
    const data = await this.base.requestJson<AnalyticsExportResponse>("GET", path);
    return new FrontAnalyticsExport(this.base, data);
  }

  /**
   * Create a metrics report (`POST /analytics/reports`). Returns `201` with the report resource.
   *
   * **Required scope:** `analytics:read`
   */
  async createReport(body: AnalyticsReportRequest): Promise<FrontAnalyticsReport> {
    const data = await this.base.requestJson<AnalyticsReportResponse>(
      "POST",
      "/analytics/reports",
      { body },
    );
    return new FrontAnalyticsReport(this.base, data);
  }

  /**
   * Fetch a report (`GET /analytics/reports/{report_uid}`).
   *
   * **Required scope:** `analytics:read`
   */
  async getReport(reportUid: string): Promise<FrontAnalyticsReport> {
    const path = FrontBase.expandPath("/analytics/reports/{report_uid}", {
      report_uid: reportUid,
    });
    const data = await this.base.requestJson<AnalyticsReportResponse>("GET", path);
    return new FrontAnalyticsReport(this.base, data);
  }
}
