import { Front } from "../src/index"

// Initialize the Front SDK
const front = new Front({
  apiKey: process.env.FRONT_API_KEY || "your-api-key-here", // or use OAuth config
})

async function accountsExample() {
  try {
    // List all accounts
    console.log("Listing accounts...")
    const accountsList = await front.accounts.list({ limit: 10 })
    console.log(`Found ${accountsList._results.length} accounts`)

    // Create a new account
    console.log("\nCreating a new account...")
    const newAccount = await front.accounts.create({
      name: "Acme Corporation",
      description: "A sample account for demonstration",
      domains: ["acme.com", "acmecorp.com"],
      external_id: "acme-001",
    })
    console.log(`Created account: ${newAccount.name} (ID: ${newAccount.id})`)

    // Fetch the account details
    console.log("\nFetching account details...")
    const account = await front.accounts.fetch(newAccount.id)
    console.log(`Account: ${account.name}`)
    console.log(`Domains: ${account.domains.join(", ")}`)
    console.log(
      `Created at: ${new Date(account.created_at * 1000).toISOString()}`,
    )

    // Update the account
    console.log("\nUpdating account...")
    const updatedAccount = await front.accounts.update(newAccount.id, {
      description: "Updated description for Acme Corporation",
      domains: ["acme.com", "acmecorp.com", "acme.org"],
    })
    console.log(`Updated account description: ${updatedAccount.description}`)
    console.log(`Updated domains: ${updatedAccount.domains.join(", ")}`)

    // List contacts for the account
    console.log("\nListing account contacts...")
    const contacts = await front.accounts.getContacts(newAccount.id, {
      limit: 5,
    })
    const contactsData = contacts as { _results?: unknown[] }
    console.log(`Account has ${contactsData._results?.length || 0} contacts`)

    // Note: In a real scenario, you would have actual contact IDs to add/remove
    // Example of adding contacts (commented out as it requires real contact IDs):
    // await front.accounts.addContact(newAccount.id, ['crd_123', 'crd_456']);

    // Example of removing a contact (commented out as it requires real contact ID):
    // await front.accounts.removeContact(newAccount.id, 'crd_123');

    // Clean up - delete the account
    console.log("\nDeleting the test account...")
    await front.accounts.delete(newAccount.id)
    console.log("Account deleted successfully")
  } catch (error) {
    console.error("Error:", error)
  }
}

// Run the example
if (require.main === module) {
  accountsExample()
}
