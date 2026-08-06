import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { bootstrapApplicant } from "./applicant-bootstrap";

function createMockAdmin(options: { hasTeacherMembership: boolean }) {
  const builder = {
    select() {
      return builder;
    },
    eq() {
      return builder;
    },
    in() {
      return builder;
    },
    maybeSingle: async () => {
      if (options.hasTeacherMembership) {
        return { data: { id: "membership-teacher" }, error: null };
      }
      return { data: null, error: null };
    },
  };

  let callCount = 0;

  return {
    from(table: string) {
      if (table === "application_form_versions") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: {
                    id: "form-1",
                    organization_id: "org-1",
                    program_id: "program-1",
                    fee_config: { enabled: false },
                  },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }

      if (table === "organization_memberships") {
        callCount += 1;
        return builder;
      }

      return builder;
    },
  } as unknown as SupabaseClient;
}

describe("bootstrapApplicant", () => {
  it("redirects staff users before creating guardian records", async () => {
    const admin = createMockAdmin({ hasTeacherMembership: true });

    const result = await bootstrapApplicant(admin, {
      userId: "user-staff-1",
      email: "staff@example.com",
      organizationId: "org-1",
      formVersionId: "form-1",
    });

    assert.equal(result.action, "redirect_teacher_portal");
    assert.equal(result.familyId, undefined);
  });
});
