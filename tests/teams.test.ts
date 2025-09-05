import { beforeEach, describe, expect, it } from "vitest"
import { Front } from "../src"
import { handlers } from "./mocks/handlers.js"
import { server } from "./mocks/node.js"

describe("Teams", () => {
  beforeEach(() => {
    server.use(...handlers)
  })

  it("lists teams (non-paginated) and returns Response", async () => {
    const front = new Front({ apiKey: "test_key" })
    const result = await front.teams.list()
    expect(result.response).toBeInstanceOf(Response)
    expect(Array.isArray(result.data)).toBe(true)
    expect(result.data.length).toBeGreaterThan(0)
  })

  it("gets a team and returns instance + response", async () => {
    const front = new Front({ apiKey: "test_key" })
    const { team, response } = await front.teams.get("tim_1")
    expect(response).toBeInstanceOf(Response)
    expect(team.id).toBeTruthy()
    expect(team.name).toBeTruthy()
  })

  it("paginates team contacts using _pagination.next", async () => {
    const front = new Front({ apiKey: "test_key" })
    const result = await front.teams.listContacts("tim_1", { limit: 2 })
    expect(result).toHaveProperty("page")
    expect(result.page.items.length).toBeGreaterThan(0)

    const next = await result.page.nextPage()
    expect(next?.page.items.length).toBeGreaterThan(0)
  })
})
