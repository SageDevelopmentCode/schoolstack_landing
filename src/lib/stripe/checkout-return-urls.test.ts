import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTuitionCheckoutReturnUrl,
  buildTuitionCheckoutReturnUrls,
  parseCheckoutReturnTo,
} from "@/lib/stripe/checkout-return-urls";

describe("parseCheckoutReturnTo", () => {
  it("returns mobile only for the mobile literal", () => {
    assert.equal(parseCheckoutReturnTo("mobile"), "mobile");
    assert.equal(parseCheckoutReturnTo("web"), "web");
    assert.equal(parseCheckoutReturnTo(undefined), "web");
    assert.equal(parseCheckoutReturnTo(null), "web");
  });
});

describe("buildTuitionCheckoutReturnUrl", () => {
  it("builds web billing URLs by default", () => {
    const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";

    try {
      const url = buildTuitionCheckoutReturnUrl({
        orgSlug: "demo-school",
        outcome: "paid",
      });

      assert.equal(url, "https://example.test/school/demo-school/parent/billing?paid=1");
    } finally {
      if (previousSiteUrl === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
      }
    }
  });

  it("builds mobile deep links when returnTo is mobile", () => {
    const url = buildTuitionCheckoutReturnUrl({
      orgSlug: "demo-school",
      returnTo: "mobile",
      outcome: "card_saved",
    });

    assert.equal(url, "schoolstack://stripe-checkout?outcome=card_saved&slug=demo-school");
  });
});

describe("buildTuitionCheckoutReturnUrls", () => {
  it("returns payment success and cancel URLs", () => {
    const urls = buildTuitionCheckoutReturnUrls({
      orgSlug: "demo-school",
      returnTo: "mobile",
      flow: "payment",
    });

    assert.equal(urls.successUrl, "schoolstack://stripe-checkout?outcome=paid&slug=demo-school");
    assert.equal(
      urls.cancelUrl,
      "schoolstack://stripe-checkout?outcome=cancelled&slug=demo-school",
    );
  });

  it("returns setup success and cancel URLs", () => {
    const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";

    try {
      const urls = buildTuitionCheckoutReturnUrls({
        orgSlug: "demo-school",
        flow: "setup",
      });

      assert.equal(
        urls.successUrl,
        "https://example.test/school/demo-school/parent/billing?card_saved=1",
      );
      assert.equal(
        urls.cancelUrl,
        "https://example.test/school/demo-school/parent/billing?card_cancelled=1",
      );
    } finally {
      if (previousSiteUrl === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
      }
    }
  });
});
