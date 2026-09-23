import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseFormCategoryQuery } from "./parse-form-category";
import { parseFormCategory } from "@/lib/school-teacher/forms-documents/parse-publish-input";

describe("parseFormCategoryQuery", () => {
  it("returns tuition when requested", () => {
    assert.equal(parseFormCategoryQuery("tuition"), "tuition");
  });

  it("returns general when requested", () => {
    assert.equal(parseFormCategoryQuery("general"), "general");
  });

  it("returns undefined for unknown values", () => {
    assert.equal(parseFormCategoryQuery("other"), undefined);
    assert.equal(parseFormCategoryQuery(null), undefined);
  });
});

describe("parseFormCategory", () => {
  it("defaults to general", () => {
    assert.equal(parseFormCategory(null), "general");
    assert.equal(parseFormCategory(""), "general");
  });

  it("accepts tuition", () => {
    assert.equal(parseFormCategory("tuition"), "tuition");
  });
});
