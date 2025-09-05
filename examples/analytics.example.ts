import { Front } from "../src"
import type { FrontAnalyticsExport } from "../src/resources/analytics"

// Example usage of the Analytics resource
async function analyticsExample() {
  const front = new Front()

  try {
    // 1. Start an export
    console.log("1. Starting an export:")
    let analyticsExport: FrontAnalyticsExport
    const { analyticsExport: createdAnalyticsExport } =
      await front.analytics.exports.create({
        start: Number(new Date("2025-08-01")) / 1_000,
        end: Number(new Date("2025-08-07")) / 1_000,
        type: "messages",
        columns: ["Message ID", "Conversation ID", "Ticket IDs"],
      })
    analyticsExport = createdAnalyticsExport
    console.log(analyticsExport)

    // 2. Poll in a loop until the export is complete
    while (analyticsExport.status === "running") {
      await new Promise((resolve) => setTimeout(resolve, 5_000))
      const { analyticsExport: updatedAnalyticsExport } =
        await front.analytics.exports.get(analyticsExport.id)

      console.log(`🦺 Export status: ${updatedAnalyticsExport.status}`)
      console.log(`- Progress: ${updatedAnalyticsExport.progress}%`)
      analyticsExport = updatedAnalyticsExport
    }

    console.log(`Export completed with status: ${analyticsExport.status}`)

    // 3. Download the CSV
    const { csv } = await analyticsExport.download()
    console.log("CSV: (first 1,000 characters)")
    console.log(csv.slice(0, 1_000))
    console.log("...")
  } catch (error) {
    console.error("Error:", error)
  }
}

analyticsExample().finally(() => console.log("Done"))
