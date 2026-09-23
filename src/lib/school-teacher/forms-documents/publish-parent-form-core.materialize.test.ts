import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  materializeFormResponses,
  publishParentFormCore,
  revertFormPublishState,
  revertFormToDraft,
} from "./publish-parent-form-core";
import type { PublishTeacherParentFormInput } from "./types";

type CapturedFormUpdate = Record<string, unknown>;

function createEnrollmentAudienceMockSupabase(options: {
  insertError?: { message: string } | null;
  insertedResponseIds?: string[];
  formInsertError?: { message: string } | null;
} = {}) {
  const formUpdates: CapturedFormUpdate[] = [];
  let capturedInsertOptions: unknown;
  let capturedInsertRows: unknown;

  const enrollmentRow = {
    student_id: "student-1",
    students: {
      id: "student-1",
      first_name: "Olivia",
      last_name: "Sparhawk",
      family_id: "family-1",
    },
  };

  function createFilterBuilder(table: string) {
    const builder = {
      select(_columns?: string) {
        return builder;
      },
      eq(_column: string, _value: unknown) {
        return builder;
      },
      in(_column: string, _value: unknown) {
        return builder;
      },
      insert(rows: unknown, opts?: unknown) {
        if (table === "teacher_parent_form_responses") {
          capturedInsertRows = rows;
          capturedInsertOptions = opts;
          return {
            select(_columns?: string) {
              return Promise.resolve({
                data: (options.insertedResponseIds ?? ["response-1"]).map((id) => ({ id })),
                error: options.insertError ?? null,
              });
            },
          };
        }

        if (table === "teacher_parent_forms") {
          return {
            select(_columns?: string) {
              return {
                single: async () => ({
                  data: {
                    id: "form-1",
                    organization_id: "org-1",
                    created_by_staff_member_id: "staff-1",
                    title: "Permission slip",
                    description: "",
                    form_type: "builder",
                    form_category: "general",
                    status: "active",
                    audience_type: "families",
                    classroom_ids: [],
                    family_ids: ["family-1"],
                    due_date: null,
                    require_signature: true,
                    config: { familyNames: ["Sparhawk Family"], fields: [] },
                    total_families: 1,
                    signed_families: 0,
                    published_at: "2026-09-23T00:00:00.000Z",
                    archived_at: null,
                    created_at: "2026-09-23T00:00:00.000Z",
                    updated_at: "2026-09-23T00:00:00.000Z",
                  },
                  error: options.formInsertError ?? null,
                }),
              };
            },
          };
        }

        throw new Error(`Unexpected insert on ${table}`);
      },
      update(values: Record<string, unknown>) {
        if (table === "teacher_parent_forms") {
          formUpdates.push(values);
        }
        return {
          eq(_column: string, _value: unknown) {
            return builder;
          },
          then(
            resolve: (value: unknown) => unknown,
            reject?: (reason?: unknown) => unknown,
          ) {
            return Promise.resolve(resolve({ data: null, error: null })).then(resolve, reject);
          },
        };
      },
      maybeSingle: async () => ({ data: null, error: null }),
      single: async () => ({ data: null, error: null }),
      then(
        resolve: (value: unknown) => unknown,
        reject?: (reason?: unknown) => unknown,
      ) {
        if (table === "enrollments") {
          return Promise.resolve(resolve({ data: [enrollmentRow], error: null })).then(
            resolve,
            reject,
          );
        }

        if (table === "families") {
          return Promise.resolve(
            resolve({
              data: [{ id: "family-1", name: "Sparhawk Family" }],
              error: null,
            }),
          ).then(resolve, reject);
        }

        return Promise.resolve(resolve({ data: [], error: null })).then(resolve, reject);
      },
    };

    return builder;
  }

  const supabase = {
    from(table: string) {
      return createFilterBuilder(table);
    },
  } as unknown as SupabaseClient;

  return {
    supabase,
    formUpdates,
    getCapturedInsertOptions: () => capturedInsertOptions,
    getCapturedInsertRows: () => capturedInsertRows,
  };
}

describe("materializeFormResponses", () => {
  it("throws when audience resolves empty but a minimum count was required", async () => {
    const { supabase } = createEnrollmentAudienceMockSupabase();

    await assert.rejects(
      () =>
        materializeFormResponses(
          supabase,
          "org-1",
          "form-1",
          "classrooms",
          [],
          [],
          { minExpectedCount: 2 },
        ),
      /Failed to materialize form responses/,
    );
  });

  it("returns zero counts when there is no audience", async () => {
    const { supabase } = createEnrollmentAudienceMockSupabase();

    const result = await materializeFormResponses(
      supabase,
      "org-1",
      "form-1",
      "classrooms",
      [],
      [],
    );

    assert.deepEqual(result, { expectedCount: 0, insertedCount: 0 });
  });

  it("inserts responses with ignoreDuplicates on conflict", async () => {
    const { supabase, getCapturedInsertOptions, getCapturedInsertRows } =
      createEnrollmentAudienceMockSupabase();

    const result = await materializeFormResponses(
      supabase,
      "org-1",
      "form-1",
      "families",
      [],
      ["family-1"],
    );

    assert.equal(result.expectedCount, 1);
    assert.equal(result.insertedCount, 1);
    assert.deepEqual(getCapturedInsertOptions(), {
      onConflict: "form_id,family_id",
      ignoreDuplicates: true,
    });
    assert.equal(Array.isArray(getCapturedInsertRows()), true);
    assert.equal((getCapturedInsertRows() as Array<{ family_id: string }>)[0]?.family_id, "family-1");
  });

  it("propagates insert errors", async () => {
    const { supabase } = createEnrollmentAudienceMockSupabase({
      insertError: { message: "insert failed" },
    });

    await assert.rejects(
      async () => {
        await materializeFormResponses(
          supabase,
          "org-1",
          "form-1",
          "families",
          [],
          ["family-1"],
        );
      },
      (error: unknown) =>
        typeof error === "object" &&
        error != null &&
        "message" in error &&
        String((error as { message: string }).message).includes("insert failed"),
    );
  });
});

describe("revert helpers", () => {
  it("reverts a form back to draft", async () => {
    const { supabase, formUpdates } = createEnrollmentAudienceMockSupabase();

    await revertFormToDraft(supabase, "org-1", "form-1");

    assert.equal(formUpdates.length, 1);
    assert.equal(formUpdates[0]?.status, "draft");
    assert.equal(formUpdates[0]?.published_at, null);
    assert.equal(formUpdates[0]?.total_families, 0);
  });

  it("restores a previous publish snapshot", async () => {
    const { supabase, formUpdates } = createEnrollmentAudienceMockSupabase();

    await revertFormPublishState(supabase, "org-1", "form-1", {
      status: "draft",
      totalFamilies: 0,
      publishedAt: null,
    });

    assert.equal(formUpdates.length, 1);
    assert.equal(formUpdates[0]?.status, "draft");
    assert.equal(formUpdates[0]?.published_at, null);
    assert.equal(formUpdates[0]?.total_families, 0);
  });
});

describe("publishParentFormCore publish rollback", () => {
  it("reverts to draft when response materialization fails", async () => {
    const { supabase, formUpdates } = createEnrollmentAudienceMockSupabase({
      insertError: { message: "response insert failed" },
    });

    const input: PublishTeacherParentFormInput = {
      title: "Permission slip",
      description: "",
      formType: "builder",
      formCategory: "general",
      audienceType: "families",
      classroomIds: [],
      familyIds: ["family-1"],
      dueDate: null,
      requireSignature: true,
      uploadFormat: "pdf",
      uploadFileName: null,
      uploadFileSize: null,
      fields: [{ id: "sig-1", type: "signature", label: "Signature", required: true }],
      status: "active",
    };

    await assert.rejects(
      async () => {
        await publishParentFormCore(supabase, "org-1", "staff-1", input);
      },
      (error: unknown) =>
        typeof error === "object" &&
        error != null &&
        "message" in error &&
        String((error as { message: string }).message).includes("response insert failed"),
    );

    assert.equal(formUpdates.length, 1);
    assert.equal(formUpdates[0]?.status, "draft");
    assert.equal(formUpdates[0]?.published_at, null);
    assert.equal(formUpdates[0]?.total_families, 0);
  });
});
