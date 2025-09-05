import type {
  AnalyticsExportResponse,
  AnalyticsFilters,
  AnalyticsMetricId,
  AnalyticsReportResponse,
  AnalyticsScalar,
} from "../generated/types.gen"

export class FrontAnalyticsExport {
  constructor(private data: AnalyticsExportResponse) {}

  // Helper to extract the export ID from the self link
  get id() {
    return this.data._links?.self?.split("/").pop() ?? ""
  }

  get status() {
    return this.data.status
  }

  get progress() {
    return this.data.progress
  }

  get url() {
    return this.data.url
  }

  get filename() {
    return this.data.filename
  }

  get size() {
    return this.data.size
  }

  get createdAt() {
    return this.data.created_at
  }

  get filters(): AnalyticsFilters | undefined {
    return this.data.filters
  }

  get selfLink() {
    return this.data._links?.self
  }

  toJSON(): AnalyticsExportResponse {
    return this.data
  }

  /**
   * Download the CSV for a completed analytics export.
   *
   * Requires that the export has finished and a `url` is available.
   * Returns the raw Response alongside the CSV text content.
   */
  async download(init?: RequestInit): Promise<{
    response: Response
    csv: string
  }> {
    if (!this.data.url) {
      throw new Error("Export is not ready: no download URL available")
    }
    if (typeof fetch !== "function") {
      throw new Error("Global fetch is not available in this environment")
    }

    const response = await fetch(this.data.url, init)
    if (!response.ok) {
      throw new Error(`Failed to download export (status ${response.status})`)
    }
    const csv = await response.text()
    return { response, csv }
  }
}

export class FrontAnalyticsReport {
  constructor(private data: AnalyticsReportResponse) {}

  get status() {
    return this.data.status
  }

  get progress() {
    return this.data.progress
  }

  get metrics(): AnalyticsScalar[] | undefined {
    return this.data.metrics
  }

  get selfLink() {
    return this.data._links?.self
  }

  findMetric(metricId: AnalyticsMetricId): AnalyticsScalar | undefined {
    return (this.data.metrics ?? []).find((m) => m.id === metricId)
  }

  toJSON(): AnalyticsReportResponse {
    return this.data
  }
}
