import { Front } from "../src"

// Example usage of the Tags resource
async function tagsExample() {
  const front = new Front()

  try {
    console.log("=== Tags Resource Examples ===\n")

    // 1. List tags
    console.log("1. Listing tags:")
    const { page: tagsPage } = await front.tags.list({ limit: 1 })

    console.log(tagsPage)

    // 2. Get a tag
    console.log(`2. Getting a tag by ID: ${tagsPage.items[0].id}`)
    let { tag } = await front.tags.get(tagsPage.items[0].id)

    // 3. Update a tag
    console.log("3. Updating a tag by class instance")
    tag = await tag.update({
      name: "Updated Tag",
      highlight: "green",
    })
    console.log(tag.name)

    // 4. Delete a tag (I don't want to delete your data - but here's how to do it)
    // console.log(`4. Deleting a tag by ID: ${tag.id}`)
    // await tag.delete()
    // console.log("Tag deleted")
  } catch (error) {
    console.error("Error:", error)
  }
}

tagsExample().finally(() => console.log("Done"))
