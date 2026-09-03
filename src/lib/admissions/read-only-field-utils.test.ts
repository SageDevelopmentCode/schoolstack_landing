import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ApplicationField } from "./application-form-schema";
import {
  formatReadOnlyApplicationFieldValue,
  isEmptyReadOnlyApplicationFieldValue,
} from "./read-only-field-utils";

const sparhawkAddressJson =
  '{"line1":"3833 E 200 N","line2":"","city":"Rigby","state":"ID","zip":"83442"}';

const textareaField: ApplicationField = {
  id: "p1f011e1f2a3",
  label: "Parent 1: Home address",
  type: "textarea",
  required: true,
  width: "full",
  rows: 3,
};

const addressField: ApplicationField = {
  id: "p1f011e1f2a3",
  label: "Parent 1: Home address",
  type: "address",
  required: true,
  width: "full",
};

describe("formatReadOnlyApplicationFieldValue", () => {
  it("formats JSON address on textarea fields", () => {
    assert.equal(
      formatReadOnlyApplicationFieldValue(textareaField, sparhawkAddressJson),
      "3833 E 200 N, Rigby, ID 83442",
    );
  });

  it("formats JSON address on address fields", () => {
    assert.equal(
      formatReadOnlyApplicationFieldValue(addressField, sparhawkAddressJson),
      "3833 E 200 N, Rigby, ID 83442",
    );
  });

  it("keeps plain textarea text unchanged", () => {
    assert.equal(
      formatReadOnlyApplicationFieldValue(textareaField, "123 Main St, Rigby, ID"),
      "123 Main St, Rigby, ID",
    );
  });

  it("returns em dash for empty address JSON", () => {
    assert.equal(
      formatReadOnlyApplicationFieldValue(textareaField, '{"line1":"","line2":"","city":"","state":"","zip":""}'),
      "—",
    );
  });
});

describe("isEmptyReadOnlyApplicationFieldValue", () => {
  it("treats non-empty address JSON as present on textarea fields", () => {
    assert.equal(isEmptyReadOnlyApplicationFieldValue(textareaField, sparhawkAddressJson), false);
  });

  it("treats empty address JSON as empty", () => {
    assert.equal(
      isEmptyReadOnlyApplicationFieldValue(
        textareaField,
        '{"line1":"","line2":"","city":"","state":"","zip":""}',
      ),
      true,
    );
  });
});
