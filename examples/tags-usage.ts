import { Front } from "../src"

// Example usage of the Tags resource
async function tagsExample() {
  const front = new Front({
    apiKey: process.env.FRONT_API_KEY || "your-api-key-here",
  })

  try {
    console.log("=== Tags Resource Examples ===\n")

    // 1. List all tags
    console.log("1. Listing all tags:")
    const allTags = await front.tags.list({ limit: 5 })
    console.log(`Found ${allTags._results.length} tags`)
    console.log(allTags._results.map((tag) => ({ id: tag.id, name: tag.name })))
    console.log()

    // 2. List company tags
    console.log("2. Listing company tags:")
    const companyTags = await front.tags.listCompany({ limit: 5 })
    console.log(`Found ${companyTags._results.length} company tags`)
    console.log(
      companyTags._results.map((tag) => ({ id: tag.id, name: tag.name })),
    )
    console.log()

    // 3. Create a new tag
    console.log("3. Creating a new tag:")
    const newTag = await front.tags.create({
      name: "SDK Test Tag",
      description: "Created by the Front Node.js SDK example",
      highlight: "blue",
      is_visible_in_conversation_lists: true,
    })
    console.log(`Created tag: ${newTag.name} (${newTag.id})`)
    console.log()

    // 4. Fetch the created tag
    console.log("4. Fetching the created tag:")
    const fetchedTag = await front.tags.fetch(newTag.id)
    console.log(`Fetched tag: ${fetchedTag.name}`)
    console.log(`Description: ${fetchedTag.description}`)
    console.log(`Highlight: ${fetchedTag.highlight}`)
    console.log()

    // 5. Update the tag
    console.log("5. Updating the tag:")
    await front.tags.update(newTag.id, {
      description: "Updated description from SDK",
      highlight: "green",
    })
    console.log("Tag updated successfully")
    console.log()

    // 6. Create a child tag
    console.log("6. Creating a child tag:")
    const childTag = await front.tags.createChild(newTag.id, {
      name: "Child Tag",
      description: "A child of the SDK test tag",
      highlight: "purple",
    })
    console.log(`Created child tag: ${childTag.name} (${childTag.id})`)
    console.log()

    // 7. List children of the parent tag
    console.log("7. Listing children of the parent tag:")
    const children = await front.tags.getChildren(newTag.id)
    console.log(`Found ${children._results.length} child tags`)
    console.log(
      children._results.map((child) => ({ id: child.id, name: child.name })),
    )
    console.log()

    // 8. Get conversations tagged with the tag
    console.log("8. Getting conversations tagged with the tag:")
    const taggedConversations = await front.tags.getConversations(newTag.id, {
      limit: 3,
    })
    console.log(
      `Found ${taggedConversations._results.length} conversations with this tag`,
    )
    console.log()

    // 9. Clean up - delete the child tag first
    console.log("9. Cleaning up - deleting child tag:")
    await front.tags.delete(childTag.id)
    console.log("Child tag deleted")
    console.log()

    // 10. Clean up - delete the parent tag
    console.log("10. Cleaning up - deleting parent tag:")
    await front.tags.delete(newTag.id)
    console.log("Parent tag deleted")
    console.log()

    console.log("=== Tags examples completed successfully! ===")
  } catch (error) {
    console.error("Error:", error)
  }
}

// Demonstrate teammate and team tags
async function teamTagsExample() {
  const front = new Front({
    apiKey: process.env.FRONT_API_KEY || "your-api-key-here",
  })

  try {
    console.log("\n=== Team & Teammate Tags Examples ===\n")

    // List all teammates to get an ID
    const teammates = await front.teammates.list({ limit: 1 })
    if (teammates._results.length > 0) {
      const teammate = teammates._results[0]
      console.log(
        `1. Listing tags for teammate: ${teammate.first_name} ${teammate.last_name}`,
      )
      const teammateTagsResult = await front.tags.listForTeammate(teammate.id)
      console.log(`Found ${teammateTagsResult._results.length} teammate tags`)
      console.log()

      // Create a teammate tag
      console.log("2. Creating a teammate tag:")
      const teammateTag = await front.tags.createForTeammate(teammate.id, {
        name: "Personal Tag",
        description: "A personal tag for this teammate",
        highlight: "yellow",
      })
      console.log(
        `Created teammate tag: ${teammateTag.name} (${teammateTag.id})`,
      )
      console.log()

      // Clean up
      console.log("3. Cleaning up teammate tag:")
      await front.tags.delete(teammateTag.id)
      console.log("Teammate tag deleted")
      console.log()
    }

    console.log("=== Team & Teammate Tags examples completed! ===")
  } catch (error) {
    console.error("Error:", error)
  }
}

// Run the examples
if (require.main === module) {
  Promise.all([tagsExample(), teamTagsExample()]).catch(console.error)
}

export { tagsExample, teamTagsExample }
