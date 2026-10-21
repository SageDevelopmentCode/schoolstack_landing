import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminPostSubmitStep } from "./admin-post-submit-steps";
import type { ApplicationFileUploadMeta } from "./application-file-storage";
import {
  mergePostSubmitStepDocumentation,
  postSubmitActionIdFromDocumentationFieldId,
  postSubmitStepDocumentationFieldId,
  postSubmitStepDocumentationSummary,
} from "./post-submit-step-documentation";

describe("postSubmitStepDocumentationFieldId", () => {
  it("builds stable field ids", () => {
    assert.equal(
      postSubmitStepDocumentationFieldId("shadow-day"),
      "post_submit_step:shadow-day",
    );
    assert.equal(
      postSubmitActionIdFromDocumentationFieldId("post_submit_step:shadow-day"),
      "shadow-day",
    );
  });
});

describe("mergePostSubmitStepDocumentation", () => {
  const baseStep: AdminPostSubmitStep = {
    actionId: "shadow-day",
    type: "schedule_observation_day",
    title: "Shadow day",
    required: true,
    sortIndex: 0,
    status: "scheduled",
    booking: {
      visitId: "visit-1",
      scheduledDate: "2026-08-09",
      startTimeSlot: "ADMIN_MANUAL",
      durationMinutes: 1440,
      adminCompletionNotes: "Great visit",
      completionFiles: [],
    },
  };

  it("merges files onto scheduled steps", () => {
    const files: ApplicationFileUploadMeta[] = [
      {
        id: "file-1",
        fileName: "notes.pdf",
        storagePath: "org/app/post-submit/shadow-day/file.pdf",
        mimeType: "application/pdf",
        sizeBytes: 100,
      },
    ];
    const filesByActionId = new Map([["shadow-day", files]]);
    const merged = mergePostSubmitStepDocumentation([baseStep], filesByActionId);
    assert.equal(merged[0]?.booking?.completionFiles?.length, 1);
    assert.equal(merged[0]?.booking?.completionFiles?.[0]?.fileName, "notes.pdf");
  });

  it("summarizes notes and file counts", () => {
    const step: AdminPostSubmitStep = {
      ...baseStep,
      booking: {
        ...baseStep.booking!,
        completionFiles: [
          {
            id: "f1",
            fileName: "a.pdf",
            storagePath: "p",
            mimeType: null,
            sizeBytes: null,
          },
        ],
      },
    };
    assert.equal(postSubmitStepDocumentationSummary(step), "Internal note · 1 file");
  });
});
