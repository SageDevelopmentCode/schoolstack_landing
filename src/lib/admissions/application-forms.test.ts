import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applicationFormFromRow,
  defaultApplicationFormFeeConfig,
  defaultApplicationFormNotificationConfig,
  defaultApplicationFormPostSubmitConfig,
  emptyApplicationFormSchema,
  type ApplicationFormVersion,
} from "./application-form-schema";
import {
  isApplyFormVersion,
  isCanonicalApplyEntrySlug,
  listProgramsWithoutApplyForm,
  suggestApplyFormPublicSlug,
} from "./application-forms";

function applyForm(
  overrides: Partial<ApplicationFormVersion> = {},
): ApplicationFormVersion {
  return {
    id: "form-1",
    organization_id: "org-1",
    program_id: "program-1",
    form_kind: "apply",
    version: 1,
    status: "published",
    title: "Kindergarten Co-op Application",
    intro: null,
    public_slug: "apply-kindergarten-co-op",
    schema: emptyApplicationFormSchema(),
    fee_config: defaultApplicationFormFeeConfig(),
    post_submit_config: defaultApplicationFormPostSubmitConfig(),
    notification_config: defaultApplicationFormNotificationConfig(),
    published_at: "2026-09-01T00:00:00.000Z",
    created_at: "2026-09-01T00:00:00.000Z",
    updated_at: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("suggestApplyFormPublicSlug", () => {
  it("slugifies program names into apply-* paths", () => {
    assert.equal(
      suggestApplyFormPublicSlug("Kindergarten Co-op"),
      "apply-kindergarten-co-op",
    );
  });
});

describe("listProgramsWithoutApplyForm", () => {
  it("returns only programs without an active apply form", () => {
    const programs = [
      { id: "p1", name: "School Year 2026–27" },
      { id: "p2", name: "Kindergarten Co-op" },
    ];
    const forms = [
      applyForm({ program_id: "p1", public_slug: "apply" }),
    ];

    assert.deepEqual(listProgramsWithoutApplyForm(programs, forms), [
      { id: "p2", name: "Kindergarten Co-op" },
    ]);
  });

  it("ignores archived apply forms when checking coverage", () => {
    const programs = [{ id: "p2", name: "Kindergarten Co-op" }];
    const forms = [
      applyForm({
        program_id: "p2",
        status: "archived",
      }),
    ];

    assert.deepEqual(listProgramsWithoutApplyForm(programs, forms), programs);
  });
});

describe("isApplyFormVersion", () => {
  it("detects apply forms by form_kind", () => {
    assert.equal(isApplyFormVersion(applyForm()), true);
    assert.equal(
      isApplyFormVersion(applyForm({ form_kind: "custom", public_slug: "apply" })),
      false,
    );
  });
});

describe("applicationFormFromRow", () => {
  it("defaults missing form_kind to custom", () => {
    const form = applicationFormFromRow({
      id: "form-1",
      organization_id: "org-1",
      program_id: null,
      version: 1,
      status: "draft",
      title: "Custom",
      intro: null,
      public_slug: "summer",
      schema: emptyApplicationFormSchema(),
      fee_config: defaultApplicationFormFeeConfig(),
      post_submit_config: defaultApplicationFormPostSubmitConfig(),
      notification_config: defaultApplicationFormNotificationConfig(),
      published_at: null,
      created_at: "2026-09-01T00:00:00.000Z",
      updated_at: "2026-09-01T00:00:00.000Z",
    });

    assert.equal(form.form_kind, "custom");
  });
});

describe("isCanonicalApplyEntrySlug", () => {
  it("matches only the shared /forms/apply entry slug", () => {
    assert.equal(isCanonicalApplyEntrySlug("apply"), true);
    assert.equal(isCanonicalApplyEntrySlug("apply-kindergarten-co-op"), false);
  });
});
