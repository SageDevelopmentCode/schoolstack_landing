import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { composeEmail } from "@/lib/email-layout";
import { PRODUCTION_SITE_URL, getRuntimeSiteUrl } from "@/lib/site";

import {
  assertNoLocalhostInOutboundHtml,
  ensureProductionSiteUrlForOutboundEmail,
} from "./outbound-email-production-site";

const priorSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const priorEmailSiteUrl = process.env.EMAIL_SITE_URL;

afterEach(() => {
  if (priorSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = priorSiteUrl;
  }
  if (priorEmailSiteUrl === undefined) {
    delete process.env.EMAIL_SITE_URL;
  } else {
    process.env.EMAIL_SITE_URL = priorEmailSiteUrl;
  }
});

describe("ensureProductionSiteUrlForOutboundEmail", () => {
  it("replaces localhost NEXT_PUBLIC_SITE_URL with production", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    const url = ensureProductionSiteUrlForOutboundEmail();
    assert.equal(url, PRODUCTION_SITE_URL);
    assert.equal(getRuntimeSiteUrl(), PRODUCTION_SITE_URL);
  });

  it("honors EMAIL_SITE_URL override", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    process.env.EMAIL_SITE_URL = "https://staging.example.com";
    const url = ensureProductionSiteUrlForOutboundEmail();
    assert.equal(url, "https://staging.example.com");
  });
});

describe("assertNoLocalhostInOutboundHtml", () => {
  it("throws when HTML contains localhost", () => {
    assert.throws(
      () => assertNoLocalhostInOutboundHtml('<a href="http://localhost:3000">'),
      /localhost/,
    );
  });

  it("passes for production URLs", () => {
    assert.doesNotThrow(() =>
      assertNoLocalhostInOutboundHtml(
        `<img src="${PRODUCTION_SITE_URL}/images/Logo.png">`,
      ),
    );
  });
});

describe("composeEmail with localhost env", () => {
  it("uses production logo when siteUrl omitted and env is localhost", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    ensureProductionSiteUrlForOutboundEmail();
    const html = composeEmail({
      preheader: "Test",
      contentHtml: "<p>Body</p>",
    });
    assert.match(
      html,
      new RegExp(`src="${PRODUCTION_SITE_URL}/images/Logo.png"`),
    );
    assertNoLocalhostInOutboundHtml(html);
  });
});
