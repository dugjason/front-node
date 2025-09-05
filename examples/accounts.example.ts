import { Front } from "../src"

// Example usage of the Tags resource
async function accountsExample() {
  const front = new Front()

  try {
    console.log("=== Accounts Resource Examples ===\n")

    // 1. List all accounts
    console.log("1. Listing all accounts:")
    let count = 0
    const { page: accountsPage } = await front.accounts.list({ limit: 5 })
    for (const acc of accountsPage.items) {
      console.log(`Account #${count}: ${acc.id} - ${acc.name}`)
      count++
      if (count === 15) break
    }

    // 2. Get an account
    console.log(`2. Getting an account by ID: ${accountsPage.items[0].id}`)
    const { account } = await front.accounts.get(accountsPage.items[0].id)
    console.log(account.id) // acc_123

    // 3. Create an account
    console.log("3. Creating an account:")
    const { account: newAccount } = await front.accounts.create({
      name: "New Account",
    })
    console.log(newAccount) // acc_123

    // 4. Update an account
    console.log("4. Updating an account:")
    const { account: updatedAccount } = await front.accounts.update(
      newAccount.id,
      {
        name: "Updated Account",
      },
    )
    console.log(updatedAccount) // acc_123

    // 5. Delete an account
    console.log("5. Deleting an account:")
    await front.accounts.delete(newAccount.id)
    console.log("Account deleted")
  } catch (error) {
    console.error("Error:", error)
  }
}

accountsExample().finally(() => console.log("Done"))
