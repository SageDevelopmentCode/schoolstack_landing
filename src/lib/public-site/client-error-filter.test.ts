import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  describeUserAgent,
  extractStackUrls,
  isForeignOnlyError,
  isForeignScriptUrl,
  isIgnorableClientErrorMessage,
  isPublicSitePath,
  isReportablePublicClientError,
} from "@/lib/public-site/client-error-filter";

const ORIGIN = "https://trymudkitchen.com";

const INSTAGRAM_STACK = `Error: Error invoking postMessage: Java object is gone
  at sendDataToNative (app://navigation_performance_logger_android:1:11722)
  at sendJsBlockingTimeMessage (app://navigation_performance_logger_android:1:16303)`;

const OUR_STACK = `TypeError: Cannot read properties of undefined (reading 'map')
  at FreePreviewShowcase (https://trymudkitchen.com/_next/static/chunks/app/free-preview/page-abc.js:1:2345)
  at renderWithHooks (https://trymudkitchen.com/_next/static/chunks/framework-123.js:1:999)`;

describe("isPublicSitePath", () => {
  it("covers marketing pages and skips portals, admin and api", () => {
    assert.equal(isPublicSitePath("/"), true);
    assert.equal(isPublicSitePath("/free-preview"), true);
    assert.equal(isPublicSitePath("/get-started"), true);
    assert.equal(isPublicSitePath("/blog/some-post"), true);
    assert.equal(isPublicSitePath("/school/rooted-meadows/parent"), false);
    assert.equal(isPublicSitePath("/admin"), false);
    assert.equal(isPublicSitePath("/admin/demos"), false);
    assert.equal(isPublicSitePath("/api/marketing-leads"), false);
  });
});

describe("isForeignScriptUrl", () => {
  it("flags in-app browser, extension and other-origin scripts", () => {
    assert.equal(isForeignScriptUrl("app://navigation_performance_logger_android:1:11722"), true);
    assert.equal(isForeignScriptUrl("chrome-extension://abc/content.js"), true);
    assert.equal(isForeignScriptUrl("moz-extension://abc/content.js"), true);
    assert.equal(isForeignScriptUrl("safari-web-extension://abc/content.js"), true);
    assert.equal(isForeignScriptUrl("webkit-masked-url://hidden/"), true);
    assert.equal(isForeignScriptUrl("https://www.googletagmanager.com/gtag/js", ORIGIN), true);
  });

  it("keeps our own scripts, including Sentry's rewritten app:/// frames", () => {
    assert.equal(isForeignScriptUrl(`${ORIGIN}/_next/static/chunks/main.js`, ORIGIN), false);
    assert.equal(isForeignScriptUrl("app:///_next/static/chunks/main.js"), false);
    assert.equal(isForeignScriptUrl("", ORIGIN), false);
  });
});

describe("isIgnorableClientErrorMessage", () => {
  it("drops known noise", () => {
    assert.equal(isIgnorableClientErrorMessage("Script error."), true);
    assert.equal(isIgnorableClientErrorMessage("ResizeObserver loop limit exceeded"), true);
    assert.equal(isIgnorableClientErrorMessage("Error invoking postMessage: Java object is gone"), true);
    assert.equal(isIgnorableClientErrorMessage("TypeError: Failed to fetch"), true);
    assert.equal(isIgnorableClientErrorMessage("Load failed"), true);
    assert.equal(isIgnorableClientErrorMessage("AbortError: The user aborted a request."), true);
    assert.equal(isIgnorableClientErrorMessage("   "), true);
  });

  it("keeps real errors", () => {
    assert.equal(isIgnorableClientErrorMessage("Cannot read properties of undefined (reading 'map')"), false);
  });
});

describe("isReportablePublicClientError", () => {
  it("drops the Instagram in-app browser error even without the message filter", () => {
    assert.deepEqual(extractStackUrls(INSTAGRAM_STACK), [
      "app://navigation_performance_logger_android:1:11722",
      "app://navigation_performance_logger_android:1:16303",
    ]);
    assert.equal(isForeignOnlyError(extractStackUrls(INSTAGRAM_STACK), ORIGIN), true);
    assert.equal(
      isReportablePublicClientError({ message: "Something else", stack: INSTAGRAM_STACK, pageOrigin: ORIGIN }),
      false,
    );
  });

  it("drops errors whose filename is an extension", () => {
    assert.equal(
      isReportablePublicClientError({
        message: "x is not defined",
        filename: "chrome-extension://abc/inject.js",
        pageOrigin: ORIGIN,
      }),
      false,
    );
  });

  it("reports errors from our own bundles", () => {
    assert.equal(
      isReportablePublicClientError({
        message: "Cannot read properties of undefined (reading 'map')",
        filename: `${ORIGIN}/_next/static/chunks/app/free-preview/page-abc.js`,
        pageOrigin: ORIGIN,
      }),
      true,
    );
    assert.equal(
      isReportablePublicClientError({
        message: "Cannot read properties of undefined (reading 'map')",
        stack: OUR_STACK,
        pageOrigin: ORIGIN,
      }),
      true,
    );
  });

  it("reports errors with no source information", () => {
    assert.equal(isReportablePublicClientError({ message: "Something broke" }), true);
  });
});

describe("describeUserAgent", () => {
  it("labels in-app browsers and common browsers", () => {
    assert.equal(
      describeUserAgent(
        "Mozilla/5.0 (Linux; Android 10; SM-S916U Build/QP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0 Mobile Safari/537.36 Instagram 456.1.0.0 Android",
      ),
      "Instagram in-app · Android",
    );
    assert.equal(
      describeUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/480.0]",
      ),
      "Facebook in-app · iOS",
    );
    assert.equal(
      describeUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      ),
      "Safari · macOS",
    );
    assert.equal(
      describeUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
      ),
      "Chrome · Windows",
    );
    assert.equal(describeUserAgent(""), "Unknown");
  });
});
