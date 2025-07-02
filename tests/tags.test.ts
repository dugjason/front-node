import { describe, expect, it, vi } from "vitest"
import { Front } from "../src/front"
import type {
  Conversation,
  CreateTagData,
  ListResponse,
  Tag,
  UpdateTagData,
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

describe("Tags", () => {
  const mockTag: Tag = {
    _links: {
      self: "https://api2.frontapp.com/tags/tag_123",
      related: {
        conversations: "https://api2.frontapp.com/tags/tag_123/conversations",
        owner: "https://api2.frontapp.com/teammates/tea_123",
        children: "https://api2.frontapp.com/tags/tag_123/children",
      },
    },
    id: "tag_123",
    name: "Test Tag",
    description: "A test tag for unit tests",
    highlight: "blue",
    is_private: false,
    is_visible_in_conversation_lists: true,
    created_at: 1453770984.123,
    updated_at: 1453770984.123,
  }

  const mockTagWithParent: Tag = {
    ...mockTag,
    id: "tag_456",
    name: "Child Tag",
    _links: {
      ...mockTag._links,
      self: "https://api2.frontapp.com/tags/tag_456",
      related: {
        ...mockTag._links.related,
        conversations: "https://api2.frontapp.com/tags/tag_456/conversations",
        parent_tag: "https://api2.frontapp.com/tags/tag_123",
        children: "https://api2.frontapp.com/tags/tag_456/children",
      },
    },
  }

  const mockTagsList: ListResponse<Tag> = {
    _results: [mockTag, mockTagWithParent],
    _pagination: { next: undefined },
  }

  const mockConversation: Conversation = {
    _links: {
      self: "https://api2.frontapp.com/conversations/cnv_123",
      related: {
        events: "https://api2.frontapp.com/conversations/cnv_123/events",
        followers: "https://api2.frontapp.com/conversations/cnv_123/followers",
        messages: "https://api2.frontapp.com/conversations/cnv_123/messages",
        comments: "https://api2.frontapp.com/conversations/cnv_123/comments",
        inboxes: "https://api2.frontapp.com/conversations/cnv_123/inboxes",
        last_message: "https://api2.frontapp.com/messages/msg_123",
      },
    },
    id: "cnv_123",
    subject: "Test Conversation",
    status: "assigned",
    status_id: "sts_123",
    status_category: "open",
    assignee: {
      _links: {
        self: "https://api2.frontapp.com/teammates/tea_123",
        related: {
          inboxes: "https://api2.frontapp.com/teammates/tea_123/inboxes",
          conversations:
            "https://api2.frontapp.com/teammates/tea_123/conversations",
        },
      },
      id: "tea_123",
      email: "test@example.com",
      username: "testuser",
      first_name: "Test",
      last_name: "User",
      is_admin: false,
      is_available: true,
      is_blocked: false,
    },
    recipient: {
      _links: {
        related: {
          contact: "https://api2.frontapp.com/contacts/crd_123",
        },
      },
      handle: "recipient@example.com",
      role: "to",
    },
    tags: [mockTag],
    created_at: 1453770984.123,
    is_private: false,
  }

  describe("Basic tag operations", () => {
    it("should list all tags", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(mockTagsList)

      const result = await front.tags.list({
        limit: 10,
        sort_by: "id",
        sort_order: "asc",
      })

      expect(mockGet).toHaveBeenCalledWith("/tags", {
        limit: 10,
        sort_by: "id",
        sort_order: "asc",
      })
      expect(result).toEqual(mockTagsList)
      expect(result._results).toHaveLength(2)
    })

    it("should list tags without parameters", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(mockTagsList)

      const result = await front.tags.list()

      expect(mockGet).toHaveBeenCalledWith("/tags", undefined)
      expect(result).toEqual(mockTagsList)
    })

    it("should create a new tag", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockPost = vi
        .spyOn(front.getClient(), "post")
        .mockResolvedValue(mockTag)

      const tagData: CreateTagData = {
        name: "New Tag",
        description: "A new tag",
        highlight: "green",
        is_visible_in_conversation_lists: true,
      }

      const result = await front.tags.create(tagData)

      expect(mockPost).toHaveBeenCalledWith("/tags", tagData)
      expect(result).toEqual(mockTag)
    })

    it("should create a tag with minimal data", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockPost = vi
        .spyOn(front.getClient(), "post")
        .mockResolvedValue(mockTag)

      const tagData: CreateTagData = {
        name: "Minimal Tag",
      }

      const result = await front.tags.create(tagData)

      expect(mockPost).toHaveBeenCalledWith("/tags", tagData)
      expect(result).toEqual(mockTag)
    })

    it("should fetch a specific tag", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(mockTag)

      const result = await front.tags.fetch("tag_123")

      expect(mockGet).toHaveBeenCalledWith("/tags/tag_123")
      expect(result).toEqual(mockTag)
    })

    it("should update a tag", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockPatch = vi
        .spyOn(front.getClient(), "patch")
        .mockResolvedValue(undefined)

      const updateData: UpdateTagData = {
        name: "Updated Tag Name",
        description: "Updated description",
        highlight: "red",
        is_visible_in_conversation_lists: false,
      }

      await front.tags.update("tag_123", updateData)

      expect(mockPatch).toHaveBeenCalledWith("/tags/tag_123", updateData)
    })

    it("should update a tag with parent relationship", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockPatch = vi
        .spyOn(front.getClient(), "patch")
        .mockResolvedValue(undefined)

      const updateData: UpdateTagData = {
        parent_tag_id: "tag_456",
      }

      await front.tags.update("tag_123", updateData)

      expect(mockPatch).toHaveBeenCalledWith("/tags/tag_123", updateData)
    })

    it("should remove parent relationship by setting null", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockPatch = vi
        .spyOn(front.getClient(), "patch")
        .mockResolvedValue(undefined)

      const updateData: UpdateTagData = {
        parent_tag_id: undefined,
      }

      await front.tags.update("tag_123", updateData)

      expect(mockPatch).toHaveBeenCalledWith("/tags/tag_123", updateData)
    })

    it("should delete a tag", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockDelete = vi
        .spyOn(front.getClient(), "delete")
        .mockResolvedValue(undefined)

      await front.tags.delete("tag_123")

      expect(mockDelete).toHaveBeenCalledWith("/tags/tag_123")
    })
  })

  describe("Tag hierarchies", () => {
    it("should list children of a tag", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const childrenList = {
        _results: [mockTagWithParent],
        _pagination: { next: undefined },
      }
      const mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(childrenList)

      const result = await front.tags.getChildren("tag_123", { limit: 5 })

      expect(mockGet).toHaveBeenCalledWith("/tags/tag_123/children", {
        limit: 5,
      })
      expect(result).toEqual(childrenList)
      expect(result._results).toHaveLength(1)
    })

    it("should create a child tag", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockPost = vi
        .spyOn(front.getClient(), "post")
        .mockResolvedValue(mockTagWithParent)

      const childTagData: CreateTagData = {
        name: "Child Tag",
        description: "A child tag",
        highlight: "purple",
      }

      const result = await front.tags.createChild("tag_123", childTagData)

      expect(mockPost).toHaveBeenCalledWith(
        "/tags/tag_123/children",
        childTagData,
      )
      expect(result).toEqual(mockTagWithParent)
    })
  })

  describe("Tag conversations", () => {
    it("should list conversations tagged with a specific tag", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const conversationsList: ListResponse<Conversation> = {
        _results: [mockConversation],
        _pagination: { next: undefined },
      }
      const mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(conversationsList)

      const result = await front.tags.getConversations("tag_123", { limit: 20 })

      expect(mockGet).toHaveBeenCalledWith("/tags/tag_123/conversations", {
        limit: 20,
      })
      expect(result).toEqual(conversationsList)
      expect(result._results).toHaveLength(1)
      expect(result._results[0].tags).toContain(mockTag)
    })

    it("should list conversations without parameters", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const conversationsList: ListResponse<Conversation> = {
        _results: [mockConversation],
        _pagination: { next: undefined },
      }
      const mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(conversationsList)

      const result = await front.tags.getConversations("tag_123")

      expect(mockGet).toHaveBeenCalledWith(
        "/tags/tag_123/conversations",
        undefined,
      )
      expect(result).toEqual(conversationsList)
    })
  })

  describe("Company tags", () => {
    it("should list company tags", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(mockTagsList)

      const result = await front.tags.listCompany({
        limit: 15,
        sort_order: "desc",
      })

      expect(mockGet).toHaveBeenCalledWith("/company/tags", {
        limit: 15,
        sort_order: "desc",
      })
      expect(result).toEqual(mockTagsList)
    })

    it("should create a company tag", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockPost = vi
        .spyOn(front.getClient(), "post")
        .mockResolvedValue(mockTag)

      const tagData: CreateTagData = {
        name: "Company Tag",
        description: "A company-wide tag",
        highlight: "orange",
      }

      const result = await front.tags.createCompany(tagData)

      expect(mockPost).toHaveBeenCalledWith("/company/tags", tagData)
      expect(result).toEqual(mockTag)
    })
  })

  describe("Teammate tags", () => {
    it("should list tags for a teammate", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(mockTagsList)

      const result = await front.tags.listForTeammate("tea_123", { limit: 10 })

      expect(mockGet).toHaveBeenCalledWith("/teammates/tea_123/tags", {
        limit: 10,
      })
      expect(result).toEqual(mockTagsList)
    })

    it("should create a tag for a teammate", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const privateTag = { ...mockTag, is_private: true }
      const mockPost = vi
        .spyOn(front.getClient(), "post")
        .mockResolvedValue(privateTag)

      const tagData: CreateTagData = {
        name: "Personal Tag",
        description: "A personal tag for this teammate",
        highlight: "yellow",
      }

      const result = await front.tags.createForTeammate("tea_123", tagData)

      expect(mockPost).toHaveBeenCalledWith("/teammates/tea_123/tags", tagData)
      expect(result).toEqual(privateTag)
    })
  })

  describe("Team tags", () => {
    it("should list tags for a team", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(mockTagsList)

      const result = await front.tags.listForTeam("tim_123", { sort_by: "id" })

      expect(mockGet).toHaveBeenCalledWith("/teams/tim_123/tags", {
        sort_by: "id",
      })
      expect(result).toEqual(mockTagsList)
    })

    it("should create a tag for a team", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockPost = vi
        .spyOn(front.getClient(), "post")
        .mockResolvedValue(mockTag)

      const tagData: CreateTagData = {
        name: "Team Tag",
        description: "A tag for team members",
        highlight: "light-blue",
        is_visible_in_conversation_lists: true,
      }

      const result = await front.tags.createForTeam("tim_123", tagData)

      expect(mockPost).toHaveBeenCalledWith("/teams/tim_123/tags", tagData)
      expect(result).toEqual(mockTag)
    })
  })

  describe("Edge cases and validation", () => {
    it("should handle tags with no highlight", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const tagWithoutHighlight = { ...mockTag, highlight: null }
      const _mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(tagWithoutHighlight)

      const result = await front.tags.fetch("tag_123")

      expect(result.highlight).toBeNull()
    })

    it("should handle empty tag lists", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const emptyList: ListResponse<Tag> = {
        _results: [],
        _pagination: { next: undefined },
      }
      const _mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(emptyList)

      const result = await front.tags.list()

      expect(result._results).toHaveLength(0)
    })

    it("should handle pagination", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const paginatedList: ListResponse<Tag> = {
        _results: [mockTag],
        _pagination: {
          next: "https://api2.frontapp.com/tags?page_token=next_token",
        },
      }
      const mockGet = vi
        .spyOn(front.getClient(), "get")
        .mockResolvedValue(paginatedList)

      const result = await front.tags.list({ page_token: "next_token" })

      expect(mockGet).toHaveBeenCalledWith("/tags", {
        page_token: "next_token",
      })
      expect(result._pagination?.next).toBeDefined()
    })

    it("should handle all highlight color options", async () => {
      const front = new Front({ apiKey: "test-api-key" })
      const mockPost = vi
        .spyOn(front.getClient(), "post")
        .mockResolvedValue(mockTag)

      const colors: Array<CreateTagData["highlight"]> = [
        "grey",
        "pink",
        "red",
        "orange",
        "yellow",
        "green",
        "light-blue",
        "blue",
        "purple",
      ]

      for (const color of colors) {
        const tagData: CreateTagData = {
          name: `Tag with ${color} highlight`,
          highlight: color,
        }

        await front.tags.create(tagData)

        expect(mockPost).toHaveBeenCalledWith("/tags", tagData)
      }

      expect(mockPost).toHaveBeenCalledTimes(colors.length)
    })
  })
})
