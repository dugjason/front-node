import { Front } from "../src"

async function main() {
  // Initialize the Front SDK
  // You must provide either an API key or OAuth configuration
  const front = new Front({
    apiKey: process.env.FRONT_API_KEY || "your-api-key",
  })

  try {
    // Fetch a specific conversation
    const convId = "cnv_55c8c149"
    const conversation = await front.conversations.fetch(convId)
    console.log("Conversation:", conversation.subject)

    // List all teammates
    const teammates = await front.teammates.list()
    console.log("Found", teammates._results.length, "teammates")

    // Update the first teammate (if any exist)
    if (teammates._results.length > 0) {
      const firstTeammate = teammates._results[0]
      console.log("Updating teammate:", firstTeammate.email)

      const updatedTeammate = await front.teammates.update(firstTeammate.id, {
        is_available: !firstTeammate.is_available,
      })
      console.log("Updated availability to:", updatedTeammate.is_available)
    }

    // List conversations with search
    const conversations = await front.conversations.list({
      limit: 10,
      q: "status:unassigned",
    })
    console.log(
      "Found",
      conversations._results.length,
      "unassigned conversations",
    )

    // Get a teammate's conversations
    if (teammates._results.length > 0) {
      const _teammateConversations = await front.teammates.getConversations(
        teammates._results[0].id,
        { limit: 5 },
      )
      console.log("Teammate has access to conversations")
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error)
}
