import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractGuestContactEmail } from "./admin-manual-guest-contact";
import { DEFAULT_PUBLIC_TOUR_FIELDS } from "./public-tour-settings";

describe("extractGuestContactEmail", () => {
  it("returns email when answers pass validation", () => {
    const email = extractGuestContactEmail(DEFAULT_PUBLIC_TOUR_FIELDS, {
      contact_name: "Jordan Lee",
      email: "jordan@example.com",
    });
    assert.equal(email, "jordan@example.com");
  });

  it("returns null when required fields are missing", () => {
    const email = extractGuestContactEmail(DEFAULT_PUBLIC_TOUR_FIELDS, {
      contact_name: "Jordan Lee",
    });
    assert.equal(email, null);
  });
});
