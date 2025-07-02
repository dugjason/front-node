import { Front } from "../src"

async function main() {
  // Initialize the Front SDK
  const front = new Front({
    apiKey: process.env.FRONT_API_KEY || "your-api-key",
  })

  try {
    console.log("=== Front Drafts API Example ===\n")

    // Example channel and conversation IDs (replace with real ones)
    const channelId = "cha_123" // Replace with actual channel ID
    const conversationId = "cnv_123" // Replace with actual conversation ID
    const authorId = "tea_123" // Replace with actual teammate ID

    // 1. Create a new draft in a channel (starts a new conversation)
    console.log("1. Creating a new draft in a channel...")
    try {
      const newDraft = await front.drafts.create(channelId, {
        body: "This is a new draft message that will start a new conversation.",
        subject: "New Draft Subject",
        to: ["customer@example.com"],
        cc: ["manager@company.com"],
        author_id: authorId,
        mode: "private",
        should_add_default_signature: true,
      })
      console.log("✓ Draft created:", newDraft.id)
      console.log("  Subject:", newDraft.subject)
      console.log("  Draft mode:", newDraft.draft_mode)
      console.log("  Version:", newDraft.version)
    } catch (error) {
      console.log("✗ Error creating draft:", error)
    }

    // 2. Create a draft reply to a conversation
    console.log("\n2. Creating a draft reply to a conversation...")
    try {
      const replyDraft = await front.drafts.createReply(conversationId, {
        body: "This is a draft reply to the conversation.",
        channel_id: channelId,
        author_id: authorId,
        cc: ["supervisor@company.com"],
        mode: "shared",
        should_add_default_signature: false,
      })
      console.log("✓ Draft reply created:", replyDraft.id)
      console.log("  Body preview:", `${replyDraft.body.substring(0, 50)}...`)
      console.log("  Draft mode:", replyDraft.draft_mode)
    } catch (error) {
      console.log("✗ Error creating draft reply:", error)
    }

    // 3. List drafts in a conversation
    console.log("\n3. Listing drafts in a conversation...")
    try {
      const drafts = await front.drafts.list(conversationId, {
        limit: 10,
      })
      console.log(`✓ Found ${drafts._results.length} drafts`)

      for (const draft of drafts._results) {
        if (draft.draft_mode) {
          console.log(`  - Draft ${draft.id}: ${draft.subject || "No subject"}`)
          console.log(
            `    Mode: ${draft.draft_mode}, Version: ${draft.version}`,
          )
        }
      }
    } catch (error) {
      console.log("✗ Error listing drafts:", error)
    }

    // 4. Edit/update a draft (example with a mock draft ID)
    console.log("\n4. Editing a draft...")
    const draftId = "msg_123" // Replace with actual draft ID
    try {
      const updatedDraft = await front.drafts.edit(draftId, {
        body: "This is the updated draft content.",
        subject: "Updated Draft Subject",
        channel_id: channelId,
        version: "some-version-token", // This would come from the draft you're editing
        mode: "shared",
        to: ["customer@example.com", "anothercustomer@example.com"],
      })
      console.log("✓ Draft updated:", updatedDraft.id)
      console.log("  New subject:", updatedDraft.subject)
      console.log(
        "  Updated at:",
        new Date(updatedDraft.created_at * 1000).toISOString(),
      )
    } catch (error) {
      console.log("✗ Error updating draft:", error)
    }

    // 5. Delete a draft
    console.log("\n5. Deleting a draft...")
    try {
      await front.drafts.delete(draftId, {
        version: "some-version-token", // Required for safe deletion
      })
      console.log("✓ Draft deleted successfully")
    } catch (error) {
      console.log("✗ Error deleting draft:", error)
    }

    console.log("\n=== Example completed ===")
    console.log(
      "\nNote: This example uses placeholder IDs. In a real implementation:",
    )
    console.log(
      "- Replace channelId with an actual channel ID from your Front account",
    )
    console.log("- Replace conversationId with an actual conversation ID")
    console.log("- Replace authorId with an actual teammate ID")
    console.log("- Replace draftId with an actual draft message ID")
    console.log("- Use actual version tokens when editing/deleting drafts")
  } catch (error) {
    console.error("Unexpected error:", error)
  }
}

// Run the example
if (require.main === module) {
  main()
}
