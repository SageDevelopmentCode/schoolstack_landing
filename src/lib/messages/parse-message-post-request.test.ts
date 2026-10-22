import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseMessagePostRequest } from "./parse-message-post-request";

describe("parseMessagePostRequest", () => {
  it("parses JSON body-only requests", async () => {
    const request = new Request("https://example.com/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "Hello" }),
    });

    const parsed = await parseMessagePostRequest(request);
    assert.equal(parsed.body, "Hello");
    assert.equal(parsed.files.length, 0);
  });

  it("parses multipart body and files", async () => {
    const formData = new FormData();
    formData.set("body", "See attached");
    formData.append("files", new File(["pdf"], "doc.pdf", { type: "application/pdf" }));

    const request = new Request("https://example.com/messages", {
      method: "POST",
      body: formData,
    });

    const parsed = await parseMessagePostRequest(request);
    assert.equal(parsed.body, "See attached");
    assert.equal(parsed.files.length, 1);
    assert.equal(parsed.files[0]?.name, "doc.pdf");
  });

  it("allows empty body when files are present", async () => {
    const formData = new FormData();
    formData.append("files", new File(["x"], "photo.jpg", { type: "image/jpeg" }));

    const request = new Request("https://example.com/messages", {
      method: "POST",
      body: formData,
    });

    const parsed = await parseMessagePostRequest(request);
    assert.equal(parsed.body, "");
    assert.equal(parsed.files.length, 1);
  });
});
