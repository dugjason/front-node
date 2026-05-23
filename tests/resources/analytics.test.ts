import { describe, expect, test } from "bun:test";

import { FrontAnalyticsExport, FrontAnalyticsReport } from "../../src/index";
import { createMockClient, jsonResponse } from "../helpers/setup";

describe("analytics", () => {
  test("analytics.createExport posts and returns FrontAnalyticsExport", async () => {
    const { front, requests } = createMockClient((req) => {
      if (req.method === "POST" && req.url === "https://api2.frontapp.com/analytics/exports") {
        return jsonResponse(
          {
            _links: {
              self: "https://api2.frontapp.com/analytics/exports/exp_1",
            },
            filters: { tag_ids: ["tag_1"] },
            id: "exp_1",
            progress: 0,
            status: "running",
          },
          { status: 201 },
        );
      }
      return jsonResponse({});
    });
    const exp = await front.analytics.createExport({
      columns: ["Message ID"],
      end: 100,
      start: 0,
      type: "messages",
    });
    expect(exp).toBeInstanceOf(FrontAnalyticsExport);
    expect(exp.id).toBe("exp_1");
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/analytics/exports");
  });

  test("analytics.getExport sends GET and refresh refetches", async () => {
    let getCount = 0;
    const { front, requests } = createMockClient((req) => {
      if (req.method === "GET" && req.url.includes("/analytics/exports/exp_1")) {
        getCount += 1;
        return jsonResponse({
          _links: {
            self: "https://api2.frontapp.com/analytics/exports/exp_1",
          },
          filters: { tag_ids: ["tag_1"] },
          id: "exp_1",
          progress: getCount === 1 ? 0 : 100,
          status: getCount === 1 ? "running" : "done",
        });
      }
      return jsonResponse({});
    });
    const exp = await front.analytics.getExport("exp_1");
    expect(exp.data.status).toBe("running");
    await exp.refresh();
    expect(exp.data.status).toBe("done");
    expect(requests.filter((r) => r.method === "GET")).toHaveLength(2);
  });

  test("analytics.createReport posts and returns FrontAnalyticsReport", async () => {
    const { front, requests } = createMockClient((req) => {
      if (req.method === "POST" && req.url === "https://api2.frontapp.com/analytics/reports") {
        return jsonResponse(
          {
            _links: {
              self: "https://api2.frontapp.com/analytics/reports/uid_a",
            },
            metrics: [],
            progress: 0,
            status: "running",
            uid: "uid_a",
          },
          { status: 201 },
        );
      }
      return jsonResponse({});
    });
    const rep = await front.analytics.createReport({
      end: 200,
      metrics: ["new_segments_count"],
      start: 0,
    });
    expect(rep).toBeInstanceOf(FrontAnalyticsReport);
    expect(rep.uid).toBe("uid_a");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/analytics/reports");
  });

  test("analytics.getReport sends GET to reports path", async () => {
    const { front, requests } = createMockClient((req) => {
      if (req.method === "GET" && req.url.includes("/analytics/reports/uid_b")) {
        return jsonResponse({
          _links: {
            self: "https://api2.frontapp.com/analytics/reports/uid_b",
          },
          metrics: [{ id: "new_segments_count", type: "number", value: 3 }],
          progress: 100,
          status: "done",
          uid: "uid_b",
        });
      }
      return jsonResponse({});
    });
    const rep = await front.analytics.getReport("uid_b");
    expect(rep.data.status).toBe("done");
    expect(requests[0]?.method).toBe("GET");
    expect(requests[0]?.url).toBe("https://api2.frontapp.com/analytics/reports/uid_b");
  });
});
