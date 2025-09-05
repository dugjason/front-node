import { HttpResponse, http } from "msw"
import { beforeEach, describe, expect, it } from "vitest"

import { Front } from "../src"
import { accountHandlers } from "./mocks/handlers/account.handlers.js"
import { handlers } from "./mocks/handlers.js"
import { server } from "./mocks/node.js"

describe("Accounts", () => {
  beforeEach(() => {})

  describe("Accounts.list", () => {
    it("paginates using _pagination.next and returns Response headers", async () => {
      server.use(...handlers)
      const front = new Front({ apiKey: "test_key" })
      const response = await front.accounts.list()

      expect(response).toHaveProperty("page")
      expect(response.page).toHaveProperty("items")
      expect(response.page.items).toBeInstanceOf(Array)
      expect(response.page.items.length).toBeGreaterThan(0)

      expect(response).toHaveProperty("response")
      expect(response.response).toBeInstanceOf(Response)

      expect(response.page).toHaveProperty("nextPage")
      expect(response.page.nextPage).toBeInstanceOf(Function)

      const pageTwo = await response.page.nextPage()
      expect(pageTwo).toHaveProperty("page")
      expect(pageTwo?.page).toHaveProperty("items")
      expect(pageTwo?.page.items).toBeInstanceOf(Array)
      expect(pageTwo?.page.items.length).toBeGreaterThan(0)
    })

    it("throws FrontRateLimitError on 429 with request id", async () => {
      server.use(accountHandlers.list.rateLimited)
      const front = new Front({ apiKey: "test_key" })
      await expect(front.accounts.list()).rejects.toMatchObject({
        name: "FrontRateLimitError",
        status: 429,
      })
    })
  })

  describe("Accounts.get", () => {
    it("returns account and response headers", async () => {
      server.use(
        http.get("https://api2.frontapp.com/accounts/acc_1", () =>
          HttpResponse.json({ id: "acc_1", name: "Acme" }),
        ),
      )
      const front = new Front({ apiKey: "test_key" })
      const { account } = await front.accounts.get("acc_1")
      expect(account.id).toBe("acc_1")
    })
  })
})
