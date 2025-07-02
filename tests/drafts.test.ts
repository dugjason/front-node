import { describe, expect, it, vi } from "vitest"
import { Front } from "../src/front"
import type {
  CreateDraftData,
  CreateDraftReplyData,
  DeleteDraftData,
  EditDraftData,
  Message,
} from "../src/types"

// Mock the FrontClient
vi.mock("../src/client", () => ({
  FrontClient: vi.fn().mockImplementation(() => ({
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    isUsingOAuth: vi.fn(),
    getOAuthManager: vi.fn(),
    updateOAuthConfig: vi.fn(),
  })),
}))

describe("Drafts", () => {
  const mockDraft: Message = {
    _links: {
      self: "https://api2.frontapp.com/messages/msg_123",
      related: {
        conversation: "https://api2.frontapp.com/conversations/cnv_123",
      },
    },
    id: "msg_123",
    type: "email",
    is_inbound: false,
    draft_mode: "private",
    version: "v123",
    created_at: 1453770984.123,
    subject: "Test Draft",
    body: "This is a test draft",
    recipients: [
      {
        _links: {
          related: {
            contact: "https://api2.frontapp.com/contacts/crd_123",
          },
        },
        handle: "test@example.com",
        role: "to",
      },
    ],
  }

  it("should create a new draft in a channel", async () => {
    const front = new Front({ apiKey: "test-api-key" })
    const mockPost = vi
      .spyOn(front.getClient(), "post")
      .mockResolvedValue(mockDraft)

    const draftData: CreateDraftData = {
      body: "Test draft body",
      subject: "Test Subject",
      to: ["test@example.com"],
      author_id: "tea_123",
    }

    const result = await front.drafts.create("cha_123", draftData)

    expect(mockPost).toHaveBeenCalledWith("/channels/cha_123/drafts", draftData)
    expect(result).toEqual(mockDraft)
  })

  it("should create a draft reply to a conversation", async () => {
    const front = new Front({ apiKey: "test-api-key" })
    const mockPost = vi
      .spyOn(front.getClient(), "post")
      .mockResolvedValue(mockDraft)

    const replyData: CreateDraftReplyData = {
      body: "Test reply body",
      channel_id: "cha_123",
      author_id: "tea_123",
    }

    const result = await front.drafts.createReply("cnv_123", replyData)

    expect(mockPost).toHaveBeenCalledWith(
      "/conversations/cnv_123/drafts",
      replyData,
    )
    expect(result).toEqual(mockDraft)
  })

  it("should list drafts in a conversation", async () => {
    const front = new Front({ apiKey: "test-api-key" })
    const mockResponse = {
      _results: [mockDraft],
      _pagination: { next: null },
    }
    const mockGet = vi
      .spyOn(front.getClient(), "get")
      .mockResolvedValue(mockResponse)

    const result = await front.drafts.list("cnv_123", { limit: 10 })

    expect(mockGet).toHaveBeenCalledWith("/conversations/cnv_123/drafts", {
      limit: 10,
    })
    expect(result).toEqual(mockResponse)
    expect(result._results).toHaveLength(1)
    expect(result._results[0]).toEqual(mockDraft)
  })

  it("should edit a draft", async () => {
    const front = new Front({ apiKey: "test-api-key" })
    const updatedDraft = { ...mockDraft, subject: "Updated Subject" }
    const mockPatch = vi
      .spyOn(front.getClient(), "patch")
      .mockResolvedValue(updatedDraft)

    const editData: EditDraftData = {
      body: "Updated body",
      subject: "Updated Subject",
      channel_id: "cha_123",
      version: "v123",
    }

    const result = await front.drafts.edit("msg_123", editData)

    expect(mockPatch).toHaveBeenCalledWith("/drafts/msg_123/", editData)
    expect(result).toEqual(updatedDraft)
  })

  it("should delete a draft", async () => {
    const front = new Front({ apiKey: "test-api-key" })
    const mockDelete = vi
      .spyOn(front.getClient(), "delete")
      .mockResolvedValue(undefined)

    const deleteData: DeleteDraftData = {
      version: "v123",
    }

    await front.drafts.delete("msg_123", deleteData)

    expect(mockDelete).toHaveBeenCalledWith("/drafts/msg_123", deleteData)
  })

  it("should handle drafts with attachments", async () => {
    const front = new Front({ apiKey: "test-api-key" })
    const draftWithAttachments = {
      ...mockDraft,
      attachments: [
        {
          filename: "test.pdf",
          url: "https://api2.frontapp.com/download/fil_123",
          content_type: "application/pdf",
          size: 12345,
          metadata: {
            is_inline: false,
          },
        },
      ],
    }
    const mockPost = vi
      .spyOn(front.getClient(), "post")
      .mockResolvedValue(draftWithAttachments)

    const draftData: CreateDraftData = {
      body: "Draft with attachment",
      to: ["test@example.com"],
      attachments: [
        {
          filename: "test.pdf",
          content_type: "application/pdf",
          data: "base64-encoded-data",
        },
      ],
    }

    const result = await front.drafts.create("cha_123", draftData)

    expect(mockPost).toHaveBeenCalledWith("/channels/cha_123/drafts", draftData)
    expect(result.attachments).toHaveLength(1)
    expect(result.attachments?.[0].filename).toBe("test.pdf")
  })

  it("should handle shared draft mode", async () => {
    const front = new Front({ apiKey: "test-api-key" })
    const sharedDraft = { ...mockDraft, draft_mode: "shared" as const }
    const _mockPost = vi
      .spyOn(front.getClient(), "post")
      .mockResolvedValue(sharedDraft)

    const replyData: CreateDraftReplyData = {
      body: "Shared draft reply",
      channel_id: "cha_123",
      mode: "shared",
    }

    const result = await front.drafts.createReply("cnv_123", replyData)

    expect(result.draft_mode).toBe("shared")
  })
})
