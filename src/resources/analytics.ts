import type { FrontBase } from "../base";
import type { OperationParams, OperationResponse } from "../operation";
import type { components } from "../gen/schema.gen";

export type AnalyticsExportResponse = components["schemas"]["AnalyticsExportResponse"];
export type AnalyticsFilters = components["schemas"]["AnalyticsFilters"];
export type AnalyticsMetricId = components["schemas"]["AnalyticsMetricId"];
export type AnalyticsReportResponse = components["schemas"]["AnalyticsReportResponse"];

export type CreateAnalyticsExportParams = NonNullable<
  OperationParams<"create-analytics-export">["body"]
>;
export type CreateAnalyticsReportParams = NonNullable<
  OperationParams<"create-analytics-report">["body"]
>;

/** Collection operations returning Front response data. */
export class FrontAnalytics {
  private readonly base: FrontBase;

  constructor(base: FrontBase) {
    this.base = base;
  }

  /** POST /analytics/exports
   * Required scope: `analytics:read`
   * @see https://dev.frontapp.com/reference/create-analytics-export
   */
  async createExport(
    body: CreateAnalyticsExportParams,
  ): Promise<OperationResponse<"create-analytics-export">> {
    return await this.base.requestOperation("create-analytics-export", { body });
  }

  /** GET /analytics/exports/{export_id}
   * Required scope: `analytics:read`
   * @see https://dev.frontapp.com/reference/get-analytics-export
   */
  async getExport(exportId: string): Promise<OperationResponse<"get-analytics-export">> {
    return await this.base.requestOperation("get-analytics-export", {
      path: { export_id: exportId },
    });
  }

  /** POST /analytics/reports
   * Required scope: `analytics:read`
   * @see https://dev.frontapp.com/reference/create-analytics-report
   */
  async createReport(
    body: CreateAnalyticsReportParams,
  ): Promise<OperationResponse<"create-analytics-report">> {
    return await this.base.requestOperation("create-analytics-report", { body });
  }

  /** GET /analytics/reports/{report_uid}
   * Required scope: `analytics:read`
   * @see https://dev.frontapp.com/reference/get-analytics-report
   */
  async getReport(reportUid: string): Promise<OperationResponse<"get-analytics-report">> {
    return await this.base.requestOperation("get-analytics-report", {
      path: { report_uid: reportUid },
    });
  }
}
