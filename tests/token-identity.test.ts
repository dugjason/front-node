import { describe, expect, it, vi } from "vitest"
import { Front } from "../src/front"
import type { TokenIdentity } from "../src/types"

// Mock the FrontClient
vi.mock("../src/client", () => ({
  FrontClient: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    isUsingOAuth: vi.fn(),
    getOAuthManager: vi.fn(),
    updateOAuthConfig: vi.fn(),
  })),
}))

describe("Front.me()", () => {
  it("should fetch token identity details", async () => {
    const mockTokenIdentity: TokenIdentity = {
      _links: {
        self: "https://api2.frontapp.com/me",
      },
      name: "Test Company",
      id: "cmp_123",
    }

    const front = new Front({ apiKey: "test-api-key" })
    const mockGet = vi
      .spyOn(front.getClient(), "get")
      .mockResolvedValue(mockTokenIdentity)

    const result = await front.me()

    expect(mockGet).toHaveBeenCalledWith("/me")
    expect(result).toEqual(mockTokenIdentity)
    expect(result.name).toBe("Test Company")
    expect(result.id).toBe("cmp_123")
  })

  it("should work with OAuth tokens", async () => {
    const mockOAuthTokenIdentity: TokenIdentity = {
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
    const mockGet = vi
      .spyOn(front.getClient(), "get")
      .mockResolvedValue(mockOAuthTokenIdentity)

    const result = await front.me()

    expect(mockGet).toHaveBeenCalledWith("/me")
    expect(result).toEqual(mockOAuthTokenIdentity)
    expect(result.name).toBe("OAuth Company")
    expect(result.id).toBe("cmp_456")
  })
})
