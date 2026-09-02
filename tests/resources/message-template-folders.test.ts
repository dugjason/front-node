import { expect, test } from "bun:test";

import { createMockClient, jsonResponse } from "../helpers/setup";

test("messageTemplateFolders.createChildFolder targets an id without fetching it first", async () => {
  const { front, requests } = createMockClient((request) => {
    if (request.method === "POST") {
      return jsonResponse({
        _links: { self: "https://api2.frontapp.com/message_template_folders/folder_child" },
        id: "folder_child",
        name: "Child",
      });
    }
    return jsonResponse({});
  });

  await front.messageTemplateFolders.createChildFolder("folder_parent", { name: "Child" });

  expect(requests).toHaveLength(1);
  expect(requests[0]?.method).toBe("POST");
  expect(requests[0]?.url).toBe(
    "https://api2.frontapp.com/message_template_folders/folder_parent/message_template_folders",
  );
});
