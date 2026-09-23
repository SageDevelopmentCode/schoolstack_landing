import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveParentFormAttentionHref } from "./parent-form-attention-href";

describe("resolveParentFormAttentionHref", () => {
  const bases = {
    formsBase: "/school/demo/parent/forms_documents",
    billingBase: "/school/demo/parent/billing",
  };

  it("routes general forms to forms_documents", () => {
    assert.equal(
      resolveParentFormAttentionHref(
        { form: { id: "form-1", formCategory: "general" } },
        bases,
      ),
      "/school/demo/parent/forms_documents?form=form-1",
    );
  });

  it("routes tuition forms to billing agreements tab", () => {
    assert.equal(
      resolveParentFormAttentionHref(
        { form: { id: "form-2", formCategory: "tuition" } },
        bases,
      ),
      "/school/demo/parent/billing?tab=agreements&form=form-2",
    );
  });
});
