import { APIResource } from "../core/resource"
import {
  createAnalyticsExport,
  createAnalyticsReport,
  getAnalyticsExport,
  getAnalyticsReport,
} from "../generated/sdk.gen"
import type {
  AnalyticsExportRequest,
  AnalyticsExportResponse,
  AnalyticsReportRequest,
  AnalyticsReportResponse,
} from "../generated/types.gen"
import {
  FrontAnalyticsExport,
  FrontAnalyticsReport,
} from "../resources/analytics"

export class AnalyticsExports extends APIResource<
  FrontAnalyticsExport,
  AnalyticsExportResponse
> {
  protected makeItem(raw: AnalyticsExportResponse): FrontAnalyticsExport {
    return new FrontAnalyticsExport(raw)
  }

  async create(
    body: AnalyticsExportRequest,
  ): Promise<{ analyticsExport: FrontAnalyticsExport; response: Response }> {
    const { item, response } = await this.createOne<AnalyticsExportResponse>({
      createCall: () => createAnalyticsExport({ body }),
    })
    return { analyticsExport: item, response }
  }

  async get(
    exportId: string,
  ): Promise<{ analyticsExport: FrontAnalyticsExport; response: Response }> {
    const { item, response } = await this.getOne<AnalyticsExportResponse>({
      getCall: () => getAnalyticsExport({ path: { export_id: exportId } }),
    })
    return { analyticsExport: item, response }
  }
}

export class AnalyticsReports extends APIResource<
  FrontAnalyticsReport,
  AnalyticsReportResponse
> {
  protected makeItem(raw: AnalyticsReportResponse): FrontAnalyticsReport {
    return new FrontAnalyticsReport(raw)
  }

  async create(
    body: AnalyticsReportRequest,
  ): Promise<{ analyticsReport: FrontAnalyticsReport; response: Response }> {
    const { item, response } = await this.createOne<AnalyticsReportResponse>({
      createCall: () => createAnalyticsReport({ body }),
    })
    return { analyticsReport: item, response }
  }

  async get(
    reportUid: string,
  ): Promise<{ analyticsReport: FrontAnalyticsReport; response: Response }> {
    const { item, response } = await this.getOne<AnalyticsReportResponse>({
      getCall: () => getAnalyticsReport({ path: { report_uid: reportUid } }),
    })
    return { analyticsReport: item, response }
  }
}

export class Analytics {
  private _exports?: AnalyticsExports
  get exports(): AnalyticsExports {
    return (this._exports ??= new AnalyticsExports())
  }

  private _reports?: AnalyticsReports
  get reports(): AnalyticsReports {
    return (this._reports ??= new AnalyticsReports())
  }
}
