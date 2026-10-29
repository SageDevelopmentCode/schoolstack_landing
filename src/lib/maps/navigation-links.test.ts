import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAppleMapsAddressUrl,
  buildGoogleMapsSearchUrl,
} from "./navigation-links";

describe("map navigation links", () => {
  it("builds Google Maps search URL with encoded query", () => {
    const address = "742 Evergreen Terrace, Springfield, IL 62701";
    const url = buildGoogleMapsSearchUrl(address);
    assert.equal(
      url,
      "https://www.google.com/maps/search/?api=1&query=742%20Evergreen%20Terrace%2C%20Springfield%2C%20IL%2062701",
    );
  });

  it("builds Apple Maps address URL with encoded address", () => {
    const address = "3833 E 200 N, Rigby, Idaho 83442";
    const url = buildAppleMapsAddressUrl(address);
    assert.equal(
      url,
      "https://maps.apple.com/?address=3833%20E%20200%20N%2C%20Rigby%2C%20Idaho%2083442",
    );
  });

  it("trims whitespace from address before encoding", () => {
    assert.match(buildGoogleMapsSearchUrl("  123 Main St  "), /query=123%20Main%20St$/);
  });
});
