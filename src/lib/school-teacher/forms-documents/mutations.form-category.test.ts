import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publishTeacherParentForm } from "./mutations";
import type { PublishTeacherParentFormInput } from "./types";

function baseInput(
  overrides: Partial<PublishTeacherParentFormInput> = {},
): PublishTeacherParentFormInput {
  return {
    title: "Permission slip",
    description: "",
    formType: "builder",
    audienceType: "unassigned",
    classroomIds: [],
    familyIds: [],
    dueDate: null,
    requireSignature: true,
    uploadFormat: "pdf",
    uploadFileName: null,
    uploadFileSize: null,
    fields: [{ id: "sig-1", type: "signature", label: "Signature", required: true }],
    status: "draft",
    formCategory: "tuition",
    ...overrides,
  };
}

function createPublishMockSupabase() {
  let capturedInsert: Record<string, unknown> | null = null;

  const supabase = {
    from(table: string) {
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
        insert(row: Record<string, unknown>) {
          if (table === "teacher_parent_forms") {
            capturedInsert = row;
            return {
              select(_columns?: string) {
                return {
                  single: async () => ({
                    data: {
                      id: "form-1",
                      organization_id: "org-1",
                      created_by_staff_member_id: "staff-1",
                      title: row.title,
                      description: row.description,
                      form_type: row.form_type,
                      form_category: row.form_category,
                      status: row.status,
                      audience_type: row.audience_type,
                      classroom_ids: row.classroom_ids,
                      family_ids: row.family_ids,
                      due_date: row.due_date,
                      require_signature: row.require_signature,
                      config: row.config,
                      total_families: row.total_families,
                      signed_families: row.signed_families,
                      published_at: row.published_at,
                      archived_at: row.archived_at,
                      created_at: "2026-09-23T00:00:00.000Z",
                      updated_at: "2026-09-23T00:00:00.000Z",
                    },
                    error: null,
                  }),
                };
              },
            };
          }

          throw new Error(`Unexpected insert on ${table}`);
        },
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null }),
        then(
          resolve: (value: unknown) => unknown,
          reject?: (reason?: unknown) => unknown,
        ) {
          return Promise.resolve(resolve({ data: [], error: null })).then(resolve, reject);
        },
      };
      return builder;
    },
  } as unknown as SupabaseClient;

  return { supabase, getCapturedInsert: () => capturedInsert };
}

describe("publishTeacherParentForm formCategory", () => {
  it("forces general category even when input requests tuition", async () => {
    const { supabase, getCapturedInsert } = createPublishMockSupabase();

    const form = await publishTeacherParentForm(
      supabase,
      "org-1",
      "staff-1",
      baseInput(),
    );

    assert.equal(getCapturedInsert()?.form_category, "general");
    assert.equal(form.formCategory, "general");
  });
});
