import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPhotoMediaConsent,
  mapEnrollmentConsentToPhotoMediaConsent,
  parsePhotoMediaConsent,
  photoMediaConsentLabel,
} from "./photo-media-consent";

describe("photo-media-consent", () => {
  it("maps enrollment consent values", () => {
    assert.equal(mapEnrollmentConsentToPhotoMediaConsent("FULL"), "full");
    assert.equal(mapEnrollmentConsentToPhotoMediaConsent("full_use"), "full");
    assert.equal(mapEnrollmentConsentToPhotoMediaConsent("LIMITED"), "limited");
    assert.equal(mapEnrollmentConsentToPhotoMediaConsent("no_face"), "limited");
    assert.equal(mapEnrollmentConsentToPhotoMediaConsent("NO"), "none");
    assert.equal(mapEnrollmentConsentToPhotoMediaConsent("unknown"), null);
  });

  it("parses stored consent", () => {
    assert.equal(parsePhotoMediaConsent("full"), "full");
    assert.equal(parsePhotoMediaConsent(" limited "), "limited");
    assert.equal(parsePhotoMediaConsent(""), null);
    assert.equal(parsePhotoMediaConsent("FULL"), null);
  });

  it("validates consent values", () => {
    assert.equal(isPhotoMediaConsent("none"), true);
    assert.equal(isPhotoMediaConsent("nope"), false);
  });

  it("labels unset consent", () => {
    assert.equal(photoMediaConsentLabel(null), "Not set yet");
    assert.equal(photoMediaConsentLabel("full"), "Full consent");
  });
});
