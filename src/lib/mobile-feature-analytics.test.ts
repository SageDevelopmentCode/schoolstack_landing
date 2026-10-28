import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateMobileFeatureUserRows,
  mobileFeatureKeyFromActivityRow,
  mobileFeatureLabel,
} from "./mobile-feature-analytics";

describe("mobileFeatureKeyFromActivityRow", () => {
  it("reads featureKey from metadata", () => {
    assert.equal(
      mobileFeatureKeyFromActivityRow({
        entity_id: null,
        metadata: { featureKey: "billing" },
      }),
      "billing",
    );
  });

  it("falls back to non-uuid entity_id", () => {
    assert.equal(
      mobileFeatureKeyFromActivityRow({
        entity_id: "messages",
        metadata: {},
      }),
      "messages",
    );
  });

  it("ignores uuid entity_id without metadata", () => {
    assert.equal(
      mobileFeatureKeyFromActivityRow({
        entity_id: "1085332b-aef4-4910-a35d-ccb2611d9b11",
        metadata: {},
      }),
      null,
    );
  });
});

describe("mobileFeatureLabel", () => {
  it("maps known keys", () => {
    assert.equal(mobileFeatureLabel("billing"), "Billing / tuition");
    assert.equal(mobileFeatureLabel("home"), "Home");
  });

  it("title-cases unknown keys", () => {
    assert.equal(mobileFeatureLabel("custom_feature"), "Custom Feature");
  });
});

describe("aggregateMobileFeatureUserRows", () => {
  it("groups visits by user with first and last timestamps", () => {
    const rows = aggregateMobileFeatureUserRows(
      [
        {
          surface: "parent_portal",
          entity_id: null,
          metadata: { featureKey: "photos" },
          actor_user_id: "user-a",
          actor_email: "a@example.com",
          actor_name: "Alice",
          created_at: "2026-10-27T10:00:00.000Z",
        },
        {
          surface: "parent_portal",
          entity_id: null,
          metadata: { featureKey: "photos" },
          actor_user_id: "user-a",
          actor_email: "a@example.com",
          actor_name: "Alice",
          created_at: "2026-10-27T12:00:00.000Z",
        },
        {
          surface: "parent_portal",
          entity_id: null,
          metadata: { featureKey: "photos" },
          actor_user_id: "user-b",
          actor_email: "b@example.com",
          actor_name: null,
          created_at: "2026-10-27T11:00:00.000Z",
        },
        {
          surface: "parent_portal",
          entity_id: null,
          metadata: { featureKey: "committees" },
          actor_user_id: "user-a",
          actor_email: "a@example.com",
          actor_name: "Alice",
          created_at: "2026-10-27T13:00:00.000Z",
        },
      ],
      "parent_portal",
      "photos",
    );

    assert.equal(rows.length, 2);
    assert.equal(rows[0]?.userId, "user-a");
    assert.equal(rows[0]?.visits, 2);
    assert.equal(rows[0]?.firstVisitAt, "2026-10-27T10:00:00.000Z");
    assert.equal(rows[0]?.lastVisitAt, "2026-10-27T12:00:00.000Z");
    assert.equal(rows[1]?.userId, "user-b");
    assert.equal(rows[1]?.visits, 1);
  });

  it("ignores other surfaces", () => {
    const rows = aggregateMobileFeatureUserRows(
      [
        {
          surface: "teacher_portal",
          entity_id: null,
          metadata: { featureKey: "photos" },
          actor_user_id: "user-a",
          actor_email: null,
          actor_name: null,
          created_at: "2026-10-27T10:00:00.000Z",
        },
      ],
      "parent_portal",
      "photos",
    );
    assert.equal(rows.length, 0);
  });
});
