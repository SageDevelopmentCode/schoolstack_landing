import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseZohoUploadedAttachments } from "@/lib/zoho";

describe("parseZohoUploadedAttachments", () => {
  it("maps a multipart upload response to send-email attachment refs", () => {
    const json = {
      status: { code: 200, description: "success" },
      data: [
        {
          attachmentSize: 812,
          storeName: "NN2:-167775813820412438",
          attachmentName: "mudkitchen-demo-2026-12-03.ics",
          attachmentPath: "/1425407266885_mudkitchen-demo",
        },
      ],
    };
    assert.deepEqual(parseZohoUploadedAttachments(json, 1), [
      {
        storeName: "NN2:-167775813820412438",
        attachmentPath: "/1425407266885_mudkitchen-demo",
        attachmentName: "mudkitchen-demo-2026-12-03.ics",
      },
    ]);
  });

  it("rejects a response missing a file", () => {
    const json = {
      data: [{ storeName: "a", attachmentPath: "/b", attachmentName: "c.ics" }],
    };
    assert.equal(parseZohoUploadedAttachments(json, 2), null);
  });

  it("rejects entries without the fields the send API needs", () => {
    assert.equal(
      parseZohoUploadedAttachments({ data: [{ storeName: "a", attachmentName: "c.ics" }] }, 1),
      null,
    );
    assert.equal(parseZohoUploadedAttachments({ data: [null] }, 1), null);
  });

  it("rejects a non-array data payload", () => {
    assert.equal(
      parseZohoUploadedAttachments(
        { data: { storeName: "a", attachmentPath: "/b", attachmentName: "c.ics" } },
        1,
      ),
      null,
    );
    assert.equal(parseZohoUploadedAttachments(null, 1), null);
  });
});
