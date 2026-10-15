import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultApplicationFormFeeConfig,
  defaultApplicationFormNotificationConfig,
  defaultApplicationFormPostSubmitConfig,
  emptyApplicationFormSchema,
} from "./application-form-schema";
import { applicationFormSummaryFromRow } from "./application-forms";
import { isApplyProgramPicker } from "./resolve-published-apply-entry";

describe("isApplyProgramPicker", () => {
  it("detects multi-program picker entries", () => {
    const summary = applicationFormSummaryFromRow({
      id: "form-1",
      organization_id: "org-1",
      program_id: "program-1",
      form_kind: "apply",
      version: 1,
      status: "published",
      title: "Program A",
      intro: null,
      public_slug: "apply-a",
      published_at: "2026-09-01T00:00:00.000Z",
      created_at: "2026-09-01T00:00:00.000Z",
      updated_at: "2026-09-01T00:00:00.000Z",
    });

    assert.equal(
      isApplyProgramPicker({ kind: "picker", forms: [summary] }),
      true,
    );
    assert.equal(
      isApplyProgramPicker({
        ...summary,
        schema: emptyApplicationFormSchema(),
        fee_config: defaultApplicationFormFeeConfig(),
        post_submit_config: defaultApplicationFormPostSubmitConfig(),
        notification_config: defaultApplicationFormNotificationConfig(),
      }),
      false,
    );
  });
});
