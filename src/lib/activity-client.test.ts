import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACTIVITY_CLIENT_HEADER,
  ACTIVITY_PLATFORM_HEADER,
  activityClientMetadataForStripeSession,
  activityClientMetadataFromRequest,
  activityClientMetadataFromStripeMetadata,
  formatActivityClientLabel,
  mergeActivityClientMetadata,
} from "@/lib/activity-client";

function requestWithHeaders(
  headers: Record<string, string>,
): Request {
  return new Request("https://example.com/api/test", { headers });
}

describe("activityClientMetadataFromRequest", () => {
  it("defaults to web when client header is absent", () => {
    assert.deepEqual(
      activityClientMetadataFromRequest(requestWithHeaders({})),
      { client: "web" },
    );
  });

  it("parses mobile client and platform headers", () => {
    assert.deepEqual(
      activityClientMetadataFromRequest(
        requestWithHeaders({
          [ACTIVITY_CLIENT_HEADER]: "mobile",
          [ACTIVITY_PLATFORM_HEADER]: "ios",
        }),
      ),
      { client: "mobile", platform: "ios" },
    );
  });

  it("ignores unknown platform values", () => {
    assert.deepEqual(
      activityClientMetadataFromRequest(
        requestWithHeaders({
          [ACTIVITY_CLIENT_HEADER]: "mobile",
          [ACTIVITY_PLATFORM_HEADER]: "windows",
        }),
      ),
      { client: "mobile" },
    );
  });
});

describe("mergeActivityClientMetadata", () => {
  it("merges existing metadata with client metadata", () => {
    const request = requestWithHeaders({
      [ACTIVITY_CLIENT_HEADER]: "mobile",
      [ACTIVITY_PLATFORM_HEADER]: "android",
    });

    assert.deepEqual(
      mergeActivityClientMetadata(request, { operation: "load_profile" }),
      {
        operation: "load_profile",
        client: "mobile",
        platform: "android",
      },
    );
  });
});

describe("activityClientMetadataForStripeSession", () => {
  it("serializes client metadata for Stripe session metadata", () => {
    const request = requestWithHeaders({
      [ACTIVITY_CLIENT_HEADER]: "mobile",
      [ACTIVITY_PLATFORM_HEADER]: "ios",
    });

    assert.deepEqual(activityClientMetadataForStripeSession(request), {
      client: "mobile",
      platform: "ios",
    });
  });
});

describe("activityClientMetadataFromStripeMetadata", () => {
  it("parses mobile client metadata from Stripe metadata", () => {
    assert.deepEqual(
      activityClientMetadataFromStripeMetadata({
        client: "mobile",
        platform: "android",
      }),
      { client: "mobile", platform: "android" },
    );
  });

  it("returns null when client metadata is absent", () => {
    assert.equal(
      activityClientMetadataFromStripeMetadata({ payment_type: "tuition" }),
      null,
    );
  });
});

describe("formatActivityClientLabel", () => {
  it("returns null for web or missing metadata", () => {
    assert.equal(formatActivityClientLabel(undefined), null);
    assert.equal(formatActivityClientLabel({ client: "web" }), null);
  });

  it("returns mobile labels", () => {
    assert.equal(formatActivityClientLabel({ client: "mobile" }), "Mobile");
    assert.equal(
      formatActivityClientLabel({ client: "mobile", platform: "ios" }),
      "Mobile (ios)",
    );
  });
});
