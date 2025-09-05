import { beforeEach, describe, expect, it } from "vitest"
import { Front } from "../src"
import { handlers } from "./mocks/handlers.js"
import { server } from "./mocks/node.js"

describe("Rules", () => {
  beforeEach(() => {
    server.use(...handlers)
  })

  it("lists rules (non-paginated) and returns Response", async () => {
    const front = new Front({ apiKey: "test_key" })
    const result = await front.rules.list()
    expect(result.response).toBeInstanceOf(Response)
    expect(Array.isArray(result.data)).toBe(true)
    expect(result.data.length).toBeGreaterThan(0)

    // Verify rule instances have expected properties
    const firstRule = result.data[0]
    expect(firstRule.id).toBeTruthy()
    expect(firstRule.name).toBeTruthy()
    expect(Array.isArray(firstRule.actions)).toBe(true)
    expect(typeof firstRule.isPrivate).toBe("boolean")
  })

  it("gets a rule and returns instance + response", async () => {
    const front = new Front({ apiKey: "test_key" })
    const { rule, response } = await front.rules.get("rul_58xhq")
    expect(response).toBeInstanceOf(Response)
    expect(rule.id).toBeTruthy()
    expect(rule.name).toBeTruthy()
    expect(Array.isArray(rule.actions)).toBe(true)
    expect(typeof rule.isPrivate).toBe("boolean")

    // Verify toJSON works
    const json = rule.toJSON()
    expect(json).toHaveProperty("id")
    expect(json).toHaveProperty("name")
    expect(json).toHaveProperty("actions")
    expect(json).toHaveProperty("is_private")
  })
})
