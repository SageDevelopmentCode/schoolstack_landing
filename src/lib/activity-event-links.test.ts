import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { resolveActivityEventLinks } from "@/lib/activity-event-links";

describe("resolveActivityEventLinks", () => {
  it("links tuition assignment events to the families tab with family id", () => {
    const links = resolveActivityEventLinks("rooted-meadows", {
      action: ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_CREATED,
      entity_type: "tuition_enrollment_assignment",
      entity_id: "assignment-1",
      metadata: {
        familyId: "family-1",
        studentName: "Maya Chen",
        ratePlanName: "Annual Tuition",
      },
    });

    assert.ok(links);
    assert.equal(
      links!.primary.href,
      "/school/rooted-meadows/admin/my_school/tuition?tab=families&family=family-1",
    );
    assert.equal(links!.primary.ctaLabel, "Open family billing");
    assert.equal(
      links!.previewFamily!.href,
      "/admin/preview/rooted-meadows/family/family-1/parent/billing",
    );
  });

  it("links tuition payment completed events to family billing", () => {
    const links = resolveActivityEventLinks("rooted-meadows", {
      action: ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED,
      entity_type: "tuition_charge",
      entity_id: "charge-1",
      metadata: {
        familyId: "family-1",
      },
    });

    assert.ok(links);
    assert.equal(
      links!.primary.href,
      "/school/rooted-meadows/admin/my_school/tuition?tab=families&family=family-1",
    );
  });

  it("links teacher form published events to preview routes", () => {
    const links = resolveActivityEventLinks("rooted-meadows", {
      action: ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_PUBLISHED,
      entity_type: "teacher_parent_form",
      entity_id: "form-1",
      metadata: {
        formId: "form-1",
        formTitle: "Field Trip Permission",
        familyId: "family-2",
        staffMemberId: "staff-1",
        formCategory: "general",
      },
    });

    assert.ok(links);
    assert.equal(
      links!.previewFamily!.href,
      "/admin/preview/rooted-meadows/family/family-2/parent/forms_documents?form=form-1",
    );
    assert.equal(
      links!.previewTeacher!.href,
      "/admin/preview/rooted-meadows/teacher/staff-1/forms_documents?form=form-1",
    );
  });
});
