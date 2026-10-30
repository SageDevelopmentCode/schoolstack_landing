import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertNewsletterEditionAssetStoragePath,
  buildNewsletterAssetStoragePath,
  isNewsletterEditionAssetStoragePath,
  newsletterEditionAssetStoragePathPrefix,
} from "./newsletter-storage";

const ORG_ID = "11111111-1111-1111-1111-111111111111";
const EDITION_ID = "22222222-2222-2222-2222-222222222222";
const OTHER_EDITION_ID = "33333333-3333-3333-3333-333333333333";
const OTHER_ORG_ID = "44444444-4444-4444-4444-444444444444";
const ASSET_ID = "55555555-5555-5555-5555-555555555555";

describe("newsletter storage path helpers", () => {
  it("builds org- and edition-scoped storage paths", () => {
    const path = buildNewsletterAssetStoragePath(
      ORG_ID,
      EDITION_ID,
      "photo-1.jpg",
      ASSET_ID,
    );
    assert.equal(
      path,
      `${ORG_ID}/editions/${EDITION_ID}/${ASSET_ID}_photo-1.jpg`,
    );
  });

  it("accepts storage paths under the expected org and edition prefix", () => {
    const path = buildNewsletterAssetStoragePath(
      ORG_ID,
      EDITION_ID,
      "photo-1.jpg",
      ASSET_ID,
    );
    assertNewsletterEditionAssetStoragePath(ORG_ID, EDITION_ID, path);
    assert.equal(
      newsletterEditionAssetStoragePathPrefix(ORG_ID, EDITION_ID),
      `${ORG_ID}/editions/${EDITION_ID}/`,
    );
    assert.equal(isNewsletterEditionAssetStoragePath(ORG_ID, EDITION_ID, path), true);
  });

  it("rejects storage paths for a different organization", () => {
    const path = buildNewsletterAssetStoragePath(
      OTHER_ORG_ID,
      EDITION_ID,
      "photo-1.jpg",
      ASSET_ID,
    );
    assert.throws(
      () => assertNewsletterEditionAssetStoragePath(ORG_ID, EDITION_ID, path),
      /does not match this edition/,
    );
    assert.equal(isNewsletterEditionAssetStoragePath(ORG_ID, EDITION_ID, path), false);
  });

  it("rejects storage paths for a different edition in the same organization", () => {
    const path = buildNewsletterAssetStoragePath(
      ORG_ID,
      OTHER_EDITION_ID,
      "photo-1.jpg",
      ASSET_ID,
    );
    assert.throws(
      () => assertNewsletterEditionAssetStoragePath(ORG_ID, EDITION_ID, path),
      /does not match this edition/,
    );
    assert.equal(isNewsletterEditionAssetStoragePath(ORG_ID, EDITION_ID, path), false);
  });

  it("rejects path traversal segments", () => {
    const prefix = newsletterEditionAssetStoragePathPrefix(ORG_ID, EDITION_ID);
    assert.equal(
      isNewsletterEditionAssetStoragePath(ORG_ID, EDITION_ID, `${prefix}../other/file.jpg`),
      false,
    );
    assert.equal(
      isNewsletterEditionAssetStoragePath(ORG_ID, EDITION_ID, `${prefix}photo..jpg`),
      false,
    );
  });

  it("rejects absolute and backslash paths", () => {
    const prefix = newsletterEditionAssetStoragePathPrefix(ORG_ID, EDITION_ID);
    assert.equal(
      isNewsletterEditionAssetStoragePath(ORG_ID, EDITION_ID, `/${prefix}photo.jpg`),
      false,
    );
    assert.equal(
      isNewsletterEditionAssetStoragePath(
        ORG_ID,
        EDITION_ID,
        `${prefix}photo\\file.jpg`,
      ),
      false,
    );
  });
});
