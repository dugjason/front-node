import { Front } from "../src"

// Example usage of the Rules resource
async function rulesExample() {
  const front = new Front()

  try {
    console.log("=== Rules Resource Examples ===\n")

    // 1. List all rules
    console.log("1. Listing all rules:")
    const { data: rules } = await front.rules.list()
    console.log(`Found ${rules.length} rules`)
    for (const rule of rules) {
      console.log(`- ${rule.id}: ${rule.name} (Private: ${rule.isPrivate})`)
    }

    if (rules.length > 0) {
      // 2. Get a specific rule
      console.log(`\n2. Getting rule by ID: ${rules[0].id}`)
      const { rule } = await front.rules.get(rules[0].id)
      console.log(`Rule name: ${rule.name}`)
      console.log(`Is private: ${rule.isPrivate}`)
      console.log(`Number of actions: ${rule.actions.length}`)
      console.log("Actions:")
      rule.actions.forEach((action, index) => {
        console.log(`  ${index + 1}. ${action}`)
      })
    }
  } catch (error) {
    console.error("Error:", error)
  }
}

rulesExample().finally(() => console.log("Done"))
