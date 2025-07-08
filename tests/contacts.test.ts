import { beforeEach, describe, expect, test, vi } from "vitest"
import type { FrontClient } from "../src/client"
import { Contacts } from "../src/resources/contacts"
import type { Contact, ContactNote, CreateContactData } from "../src/types"

// Mock the FrontClient
vi.mock("../src/client")

describe("Contacts", () => {
  let mockClient: FrontClient
  let contacts: Contacts

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as Partial<FrontClient> as FrontClient
    contacts = new Contacts(mockClient)
  })

  describe("list", () => {
    test("should list contacts", async () => {
      const mockResponse = {
        _results: [
          {
            id: "cnt_123",
            name: "John Doe",
            description: "Test contact",
            is_spammer: false,
            links: [],
            handles: [],
            groups: [],
            is_private: false,
            created_at: 1234567890,
            updated_at: 1234567890,
          },
        ],
      }

      mockClient.get = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.list()

      expect(mockClient.get).toHaveBeenCalledWith("/contacts", undefined)
      expect(result).toEqual(mockResponse)
    })

    test("should list contacts with parameters", async () => {
      const params = {
        limit: 10,
        q: "john",
        sort_by: "created_at" as const,
        sort_order: "desc" as const,
      }

      mockClient.get = vi.fn().mockResolvedValue({ _results: [] })

      await contacts.list(params)

      expect(mockClient.get).toHaveBeenCalledWith("/contacts", params)
    })
  })

  describe("create", () => {
    test("should create a contact", async () => {
      const contactData: CreateContactData = {
        name: "John Doe",
        description: "Test contact",
        handles: [
          {
            handle: "john@example.com",
            source: "email",
          },
        ],
      }

      const mockResponse: Contact = {
        _links: {
          self: "/contacts/cnt_123",
          related: {
            notes: "/contacts/cnt_123/notes",
            conversations: "/contacts/cnt_123/conversations",
            owner: "/teammates/tea_123",
          },
        },
        id: "cnt_123",
        name: "John Doe",
        description: "Test contact",
        is_spammer: false,
        links: [],
        handles: [
          {
            handle: "john@example.com",
            source: "email",
          },
        ],
        groups: [],
        is_private: false,
        created_at: 1234567890,
        updated_at: 1234567890,
      }

      mockClient.post = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.create(contactData)

      expect(mockClient.post).toHaveBeenCalledWith("/contacts", contactData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe("fetch", () => {
    test("should fetch a contact by ID", async () => {
      const contactId = "cnt_123"
      const mockResponse: Contact = {
        _links: {
          self: "/contacts/cnt_123",
          related: {
            notes: "/contacts/cnt_123/notes",
            conversations: "/contacts/cnt_123/conversations",
            owner: "/teammates/tea_123",
          },
        },
        id: contactId,
        name: "John Doe",
        description: "Test contact",
        is_spammer: false,
        links: [],
        handles: [],
        groups: [],
        is_private: false,
        created_at: 1234567890,
        updated_at: 1234567890,
      }

      mockClient.get = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.fetch(contactId)

      expect(mockClient.get).toHaveBeenCalledWith(`/contacts/${contactId}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe("update", () => {
    test("should update a contact", async () => {
      const contactId = "cnt_123"
      const updateData = {
        name: "Jane Doe",
        description: "Updated description",
      }

      const mockResponse: Contact = {
        _links: {
          self: "/contacts/cnt_123",
          related: {
            notes: "/contacts/cnt_123/notes",
            conversations: "/contacts/cnt_123/conversations",
            owner: "/teammates/tea_123",
          },
        },
        id: contactId,
        name: "Jane Doe",
        description: "Updated description",
        is_spammer: false,
        links: [],
        handles: [],
        groups: [],
        is_private: false,
        created_at: 1234567890,
        updated_at: 1234567890,
      }

      mockClient.patch = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.update(contactId, updateData)

      expect(mockClient.patch).toHaveBeenCalledWith(
        `/contacts/${contactId}`,
        updateData,
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("delete", () => {
    test("should delete a contact", async () => {
      const contactId = "cnt_123"

      mockClient.delete = vi.fn().mockResolvedValue(undefined)

      await contacts.delete(contactId)

      expect(mockClient.delete).toHaveBeenCalledWith(`/contacts/${contactId}`)
    })
  })

  describe("merge", () => {
    test("should merge contacts", async () => {
      const mergeData = {
        contact_ids: ["cnt_123", "cnt_456"],
      }

      const mockResponse: Contact = {
        _links: {
          self: "/contacts/cnt_123",
          related: {
            notes: "/contacts/cnt_123/notes",
            conversations: "/contacts/cnt_123/conversations",
            owner: "/teammates/tea_123",
          },
        },
        id: "cnt_123",
        name: "Merged Contact",
        description: "Merged contact",
        is_spammer: false,
        links: [],
        handles: [],
        groups: [],
        is_private: false,
        created_at: 1234567890,
        updated_at: 1234567890,
      }

      mockClient.post = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.merge(mergeData)

      expect(mockClient.post).toHaveBeenCalledWith("/contacts/merge", mergeData)
      expect(result).toEqual(mockResponse)
    })
  })

  describe("getConversations", () => {
    test("should get conversations for a contact", async () => {
      const contactId = "cnt_123"
      const mockResponse = {
        _results: [],
      }

      mockClient.get = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.getConversations(contactId)

      expect(mockClient.get).toHaveBeenCalledWith(
        `/contacts/${contactId}/conversations`,
        undefined,
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("addHandle", () => {
    test("should add a handle to a contact", async () => {
      const contactId = "cnt_123"
      const handleData = {
        handle: "john@example.com",
        source: "email",
      }

      const mockResponse = {
        handle: "john@example.com",
        source: "email",
      }

      mockClient.post = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.addHandle(contactId, handleData)

      expect(mockClient.post).toHaveBeenCalledWith(
        `/contacts/${contactId}/handles`,
        handleData,
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("removeHandle", () => {
    test("should remove a handle from a contact", async () => {
      const contactId = "cnt_123"
      const handle = "john@example.com"

      mockClient.delete = vi.fn().mockResolvedValue(undefined)

      await contacts.removeHandle(contactId, handle)

      expect(mockClient.delete).toHaveBeenCalledWith(
        `/contacts/${contactId}/handles/${handle}`,
      )
    })
  })

  describe("getNotes", () => {
    test("should get notes for a contact", async () => {
      const contactId = "cnt_123"
      const mockResponse = {
        _results: [],
      }

      mockClient.get = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.getNotes(contactId)

      expect(mockClient.get).toHaveBeenCalledWith(
        `/contacts/${contactId}/notes`,
        undefined,
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("addNote", () => {
    test("should add a note to a contact", async () => {
      const contactId = "cnt_123"
      const noteData = {
        body: "This is a test note",
      }

      const mockResponse: ContactNote = {
        _links: {
          self: "/notes/note_123",
          related: {
            contact: "/contacts/cnt_123",
            author: "/teammates/tea_123",
          },
        },
        id: "note_123",
        author: {
          _links: {
            self: "/teammates/tea_123",
            related: {
              inboxes: "/teammates/tea_123/inboxes",
              conversations: "/teammates/tea_123/conversations",
            },
          },
          id: "tea_123",
          email: "author@example.com",
          username: "author",
          first_name: "Author",
          last_name: "Name",
          is_admin: false,
          is_available: true,
          is_blocked: false,
        },
        body: "This is a test note",
        created_at: 1234567890,
        updated_at: 1234567890,
      }

      mockClient.post = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.addNote(contactId, noteData)

      expect(mockClient.post).toHaveBeenCalledWith(
        `/contacts/${contactId}/notes`,
        noteData,
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("listForTeammate", () => {
    test("should list contacts for a teammate", async () => {
      const teammateId = "tea_123"
      const mockResponse = {
        _results: [],
      }

      mockClient.get = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.listForTeammate(teammateId)

      expect(mockClient.get).toHaveBeenCalledWith(
        `/teammates/${teammateId}/contacts`,
        undefined,
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("createForTeammate", () => {
    test("should create a contact for a teammate", async () => {
      const teammateId = "tea_123"
      const contactData: CreateContactData = {
        name: "John Doe",
        description: "Test contact",
      }

      const mockResponse: Contact = {
        _links: {
          self: "/contacts/cnt_123",
          related: {
            notes: "/contacts/cnt_123/notes",
            conversations: "/contacts/cnt_123/conversations",
            owner: "/teammates/tea_123",
          },
        },
        id: "cnt_123",
        name: "John Doe",
        description: "Test contact",
        is_spammer: false,
        links: [],
        handles: [],
        groups: [],
        is_private: false,
        created_at: 1234567890,
        updated_at: 1234567890,
      }

      mockClient.post = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.createForTeammate(teammateId, contactData)

      expect(mockClient.post).toHaveBeenCalledWith(
        `/teammates/${teammateId}/contacts`,
        contactData,
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("listForTeam", () => {
    test("should list contacts for a team", async () => {
      const teamId = "grp_123"
      const mockResponse = {
        _results: [],
      }

      mockClient.get = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.listForTeam(teamId)

      expect(mockClient.get).toHaveBeenCalledWith(
        `/teams/${teamId}/contacts`,
        undefined,
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("createForTeam", () => {
    test("should create a contact for a team", async () => {
      const teamId = "grp_123"
      const contactData: CreateContactData = {
        name: "John Doe",
        description: "Test contact",
      }

      const mockResponse: Contact = {
        _links: {
          self: "/contacts/cnt_123",
          related: {
            notes: "/contacts/cnt_123/notes",
            conversations: "/contacts/cnt_123/conversations",
            owner: "/teammates/tea_123",
          },
        },
        id: "cnt_123",
        name: "John Doe",
        description: "Test contact",
        is_spammer: false,
        links: [],
        handles: [],
        groups: [],
        is_private: false,
        created_at: 1234567890,
        updated_at: 1234567890,
      }

      mockClient.post = vi.fn().mockResolvedValue(mockResponse)

      const result = await contacts.createForTeam(teamId, contactData)

      expect(mockClient.post).toHaveBeenCalledWith(
        `/teams/${teamId}/contacts`,
        contactData,
      )
      expect(result).toEqual(mockResponse)
    })
  })
})
