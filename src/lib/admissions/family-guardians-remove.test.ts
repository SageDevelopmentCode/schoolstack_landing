import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  FamilyGuardianError,
  removeFamilyGuardianAccess,
} from "./family-guardians";

type GuardianRow = {
  id: string;
  family_id: string;
  organization_id: string;
  user_id: string | null;
};

type MembershipRow = {
  id: string;
  role: string;
  status: string;
};

function createMockSupabase(options: {
  guardian?: GuardianRow | null;
  familyGuardians?: Array<{ id: string }>;
  primaryApplications?: Array<{ id: string }>;
  remainingGuardians?: Array<{ id: string }>;
  membership?: MembershipRow | null;
}) {
  const {
    guardian = null,
    familyGuardians = [],
    primaryApplications = [],
    remainingGuardians = [],
    membership = null,
  } = options;

  const deletedGuardianIds: string[] = [];
  const membershipUpdates: Array<Record<string, unknown>> = [];

  function createFilterBuilder(table: string, filters: Record<string, unknown> = {}) {
    const nextFilters = { ...filters };

    const filterBuilder = {
      select(_columns?: string) {
        return filterBuilder;
      },
      eq(column: string, value: unknown) {
        nextFilters[column] = value;
        return filterBuilder;
      },
      limit(_count: number) {
        return filterBuilder;
      },
      maybeSingle: async () => {
        if (table === "guardians" && nextFilters.id === guardian?.id) {
          return { data: guardian, error: null };
        }

        if (table === "organization_memberships") {
          return { data: membership, error: null };
        }

        return { data: null, error: null };
      },
      delete() {
        return filterBuilder;
      },
      update(values: Record<string, unknown>) {
        if (table === "organization_memberships") {
          membershipUpdates.push(values);
        }
        return filterBuilder;
      },
      then(
        resolve: (value: { data: unknown; error: null }) => unknown,
        reject?: (reason?: unknown) => unknown,
      ) {
        if (table === "guardians" && nextFilters.family_id != null) {
          return Promise.resolve(resolve({ data: familyGuardians, error: null })).then(
            resolve,
            reject,
          );
        }

        if (
          table === "applications" &&
          nextFilters.family_id != null &&
          nextFilters.primary_guardian_id != null
        ) {
          return Promise.resolve(resolve({ data: primaryApplications, error: null })).then(
            resolve,
            reject,
          );
        }

        if (
          table === "guardians" &&
          nextFilters.organization_id != null &&
          nextFilters.user_id != null
        ) {
          return Promise.resolve(resolve({ data: remainingGuardians, error: null })).then(
            resolve,
            reject,
          );
        }

        if (table === "guardians" && nextFilters.id != null) {
          deletedGuardianIds.push(String(nextFilters.id));
          return Promise.resolve(resolve({ data: null, error: null })).then(resolve, reject);
        }

        if (table === "organization_memberships" && nextFilters.id != null) {
          return Promise.resolve(resolve({ data: null, error: null })).then(resolve, reject);
        }

        return Promise.resolve(resolve({ data: null, error: null })).then(resolve, reject);
      },
    };

    return filterBuilder;
  }

  const admin = {
    from(table: string) {
      return createFilterBuilder(table);
    },
  } as unknown as SupabaseClient;

  return {
    admin,
    deletedGuardianIds,
    membershipUpdates,
  };
}

describe("removeFamilyGuardianAccess", () => {
  const organizationId = "org-1";
  const familyId = "family-1";
  const primaryGuardianId = "guardian-primary";
  const addedGuardianId = "guardian-added";
  const userId = "user-added";

  it("rejects removing the primary guardian on a family application", async () => {
    const { admin } = createMockSupabase({
      guardian: {
        id: primaryGuardianId,
        family_id: familyId,
        organization_id: organizationId,
        user_id: "user-primary",
      },
      familyGuardians: [{ id: primaryGuardianId }, { id: addedGuardianId }],
      primaryApplications: [{ id: "app-1" }],
    });

    await assert.rejects(
      () =>
        removeFamilyGuardianAccess(admin, {
          organizationId,
          familyId,
          guardianId: primaryGuardianId,
        }),
      (error: unknown) => {
        assert.ok(error instanceof FamilyGuardianError);
        assert.equal(error.code, "primary_guardian");
        assert.equal(error.status, 409);
        return true;
      },
    );
  });

  it("rejects removing the sole guardian", async () => {
    const { admin } = createMockSupabase({
      guardian: {
        id: primaryGuardianId,
        family_id: familyId,
        organization_id: organizationId,
        user_id: "user-primary",
      },
      familyGuardians: [{ id: primaryGuardianId }],
    });

    await assert.rejects(
      () =>
        removeFamilyGuardianAccess(admin, {
          organizationId,
          familyId,
          guardianId: primaryGuardianId,
        }),
      (error: unknown) => {
        assert.ok(error instanceof FamilyGuardianError);
        assert.equal(error.code, "sole_guardian");
        assert.equal(error.status, 409);
        return true;
      },
    );
  });

  it("deletes an added guardian row", async () => {
    const { admin, deletedGuardianIds } = createMockSupabase({
      guardian: {
        id: addedGuardianId,
        family_id: familyId,
        organization_id: organizationId,
        user_id: userId,
      },
      familyGuardians: [{ id: primaryGuardianId }, { id: addedGuardianId }],
      primaryApplications: [],
      remainingGuardians: [],
      membership: {
        id: "membership-1",
        role: "parent",
        status: "active",
      },
    });

    await removeFamilyGuardianAccess(admin, {
      organizationId,
      familyId,
      guardianId: addedGuardianId,
    });

    assert.deepEqual(deletedGuardianIds, [addedGuardianId]);
  });

  it("disables parent membership when no other guardian links remain", async () => {
    const { admin, membershipUpdates } = createMockSupabase({
      guardian: {
        id: addedGuardianId,
        family_id: familyId,
        organization_id: organizationId,
        user_id: userId,
      },
      familyGuardians: [{ id: primaryGuardianId }, { id: addedGuardianId }],
      primaryApplications: [],
      remainingGuardians: [],
      membership: {
        id: "membership-1",
        role: "parent",
        status: "active",
      },
    });

    await removeFamilyGuardianAccess(admin, {
      organizationId,
      familyId,
      guardianId: addedGuardianId,
    });

    assert.deepEqual(membershipUpdates, [{ status: "disabled" }]);
  });

  it("leaves non-parent membership unchanged", async () => {
    const { admin, membershipUpdates } = createMockSupabase({
      guardian: {
        id: addedGuardianId,
        family_id: familyId,
        organization_id: organizationId,
        user_id: userId,
      },
      familyGuardians: [{ id: primaryGuardianId }, { id: addedGuardianId }],
      primaryApplications: [],
      remainingGuardians: [],
      membership: {
        id: "membership-1",
        role: "admin",
        status: "active",
      },
    });

    await removeFamilyGuardianAccess(admin, {
      organizationId,
      familyId,
      guardianId: addedGuardianId,
    });

    assert.equal(membershipUpdates.length, 0);
  });
});
