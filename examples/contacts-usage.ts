import { Front } from "../src"

// Initialize the Front client
const front = new Front({
  apiKey: "your-api-key-here",
  baseUrl: "https://api2.frontapp.com", // Optional, defaults to this
})

async function main() {
  try {
    // List all contacts
    console.log("Listing contacts...")
    const contacts = await front.contacts.list({
      limit: 10,
      sort_by: "created_at",
      sort_order: "desc",
    })
    console.log(`Found ${contacts._results.length} contacts`)

    // Create a new contact
    console.log("\nCreating a new contact...")
    const newContact = await front.contacts.create({
      name: "John Doe",
      description: "A potential customer",
      handles: [
        {
          handle: "john.doe@example.com",
          source: "email",
        },
      ],
      custom_fields: {
        company: "Example Corp",
        priority: "high",
      },
    })
    console.log(`Created contact: ${newContact.name} (${newContact.id})`)

    // Get a specific contact
    console.log("\nFetching contact details...")
    const contact = await front.contacts.fetch(newContact.id)
    console.log(`Contact: ${contact.name}`)
    console.log(`Description: ${contact.description}`)
    console.log(`Created: ${new Date(contact.created_at * 1000).toISOString()}`)

    // Update the contact
    console.log("\nUpdating contact...")
    const updatedContact = await front.contacts.update(newContact.id, {
      description: "Updated description - now a confirmed customer",
      custom_fields: {
        company: "Example Corp",
        priority: "medium",
        status: "customer",
      },
    })
    console.log(`Updated contact description: ${updatedContact.description}`)

    // Add a handle to the contact
    console.log("\nAdding a phone handle...")
    const phoneHandle = await front.contacts.addHandle(newContact.id, {
      handle: "+1234567890",
      source: "phone",
    })
    console.log(`Added handle: ${phoneHandle.handle}`)

    // List conversations for the contact
    console.log("\nListing conversations for contact...")
    const conversations = await front.contacts.getConversations(newContact.id)
    console.log(`Found ${conversations._results.length} conversations`)

    // Add a note to the contact
    console.log("\nAdding a note...")
    const note = await front.contacts.addNote(newContact.id, {
      body: "This customer is interested in our premium features.",
    })
    console.log(`Added note: ${note.body}`)

    // List notes for the contact
    console.log("\nListing notes for contact...")
    const notes = await front.contacts.getNotes(newContact.id)
    console.log(`Found ${notes._results.length} notes`)

    // Search for contacts
    console.log("\nSearching for contacts...")
    const searchResults = await front.contacts.list({
      q: "john",
      limit: 5,
    })
    console.log(
      `Found ${searchResults._results.length} contacts matching 'john'`,
    )

    // Clean up - delete the contact
    console.log("\nDeleting contact...")
    await front.contacts.delete(newContact.id)
    console.log("Contact deleted successfully")
  } catch (error) {
    console.error("Error:", error)
  }
}

// Run the example
main().catch(console.error)
