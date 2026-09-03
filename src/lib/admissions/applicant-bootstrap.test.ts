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
        return builder;
      }

      return builder;
    },
  } as unknown as SupabaseClient;
}

function createDuplicateMembershipMockAdmin() {
  let membershipLookupCount = 0;

  const formBuilder = {
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

  const membershipBuilder = {
    select: () => membershipBuilder,
    eq: () => membershipBuilder,
    in: () => membershipBuilder,
    maybeSingle: async () => {
      membershipLookupCount += 1;
      if (membershipLookupCount === 1) {
        return { data: null, error: null };
      }
      return { data: { id: "membership-existing" }, error: null };
    },
    insert: () => ({
      select: () => ({
        single: async () => ({
          data: null,
          error: {
            code: "23505",
            message:
              'duplicate key value violates unique constraint "organization_memberships_organization_id_user_id_key"',
          },
        }),
      }),
    }),
  };

  const guardianBuilder = {
    select: () => guardianBuilder,
    eq: () => guardianBuilder,
    maybeSingle: async () => ({
      data: { id: "guardian-1", family_id: "family-1" },
      error: null,
    }),
  };

  const applicationBuilder = {
    select: () => applicationBuilder,
    eq: () => applicationBuilder,
    neq: () => applicationBuilder,
    order: () => applicationBuilder,
    limit: () => applicationBuilder,
    maybeSingle: async () => ({ data: null, error: null }),
    insert: () => ({
      select: () => ({
        single: async () => ({
          data: { id: "application-1" },
          error: null,
        }),
      }),
    }),
  };

  return {
    from(table: string) {
      if (table === "application_form_versions") {
        return formBuilder;
      }
      if (table === "organization_memberships") {
        return membershipBuilder;
      }
      if (table === "guardians") {
        return guardianBuilder;
      }
      if (table === "applications") {
        return applicationBuilder;
      }
      return membershipBuilder;
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

  it("reuses membership when insert races on unique constraint", async () => {
    const admin = createDuplicateMembershipMockAdmin();

    const result = await bootstrapApplicant(admin, {
      userId: "user-parent-1",
      email: "parent@example.com",
      organizationId: "org-1",
      formVersionId: "form-1",
    });

    assert.equal(result.action, "resume");
    assert.equal(result.applicationId, "application-1");
    assert.equal(result.membershipId, "membership-existing");
  });
});
