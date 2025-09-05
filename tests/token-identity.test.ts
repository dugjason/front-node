import { HttpResponse, http } from "msw"
import { describe, expect, it } from "vitest"
import { Front } from "../src/front"
import type { ApiTokenDetailsResponse } from "../src/generated/types.gen"
import { server } from "./mocks/node.js"

describe("Front.me()", () => {
  it("should fetch token identity details", async () => {
    const mockTokenIdentity: ApiTokenDetailsResponse = {
      _links: {
        self: "https://api2.frontapp.com/me",
      },
      name: "Test Company",
      id: "cmp_123",
    }

    const front = new Front({ apiKey: "test-api-key" })

    server.use(
      http.get("https://api2.frontapp.com/me", () =>
        HttpResponse.json(mockTokenIdentity),
      ),
    )

    const { tokenIdentity } = await front.me()

    expect(tokenIdentity).toEqual(mockTokenIdentity)
    expect(tokenIdentity.name).toBe("Test Company")
    expect(tokenIdentity.id).toBe("cmp_123")
  })

  it("should work with OAuth tokens", async () => {
    const mockOAuthTokenIdentity: ApiTokenDetailsResponse = {
      _links: {
        self: "https://api2.frontapp.com/me",
      },
      name: "OAuth Company",
      id: "cmp_456",
    }

    const front = new Front({
      oauth: {
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
      },
    })

    server.use(
      http.get("https://api2.frontapp.com/me", () =>
        HttpResponse.json(mockOAuthTokenIdentity),
      ),
    )

    const { tokenIdentity } = await front.me()

    expect(tokenIdentity).toEqual(mockOAuthTokenIdentity)
    expect(tokenIdentity.name).toBe("OAuth Company")
    expect(tokenIdentity.id).toBe("cmp_456")
  })
})
