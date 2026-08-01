import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  addStaffPortalAccess,
  StaffMemberError,
} from "./staff-members";

type StaffRow = {
  id: string;
  organization_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  role_title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type MembershipRow = {
  id: string;
  role: string;
  status: string;
};

function createMockSupabase(options: {
  existingStaff?: StaffRow | null;
  membership?: MembershipRow | null;
  insertedStaff?: StaffRow;
  updatedStaff?: StaffRow;
}) {
  const {
    existingStaff = null,
    membership = null,
    insertedStaff,
    updatedStaff,
  } = options;

  let staffRows: StaffRow[] = existingStaff ? [existingStaff] : [];
  let currentMembership = membership;
  const membershipUpdates: Array<Record<string, unknown>> = [];
  const membershipInserts: Array<Record<string, unknown>> = [];

  const authUser = {
    id: "user-teacher-1",
    email: "teacher@example.com",
    created: true,
  };

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
      ilike(column: string, value: unknown) {
        nextFilters[column] = value;
        nextFilters.__ilike = { column, value };
        return filterBuilder;
      },
      in(_column: string, _values: unknown[]) {
        return filterBuilder;
      },
      order() {
        return filterBuilder;
      },
      maybeSingle: async () => {
        if (table === "organization_memberships") {
          return { data: currentMembership, error: null };
        }

        if (table === "staff_members" && nextFilters.id != null) {
          const row = staffRows.find((item) => item.id === nextFilters.id);
          return { data: row ?? null, error: null };
        }

        return { data: null, error: null };
      },
      single: async () => {
        if (table === "staff_members" && nextFilters.id != null && updatedStaff) {
          return { data: updatedStaff, error: null };
        }

        if (table === "staff_members" && insertedStaff) {
          staffRows = [insertedStaff];
          return { data: insertedStaff, error: null };
        }

        return { data: null, error: null };
      },
      insert(values: Record<string, unknown>) {
        if (table === "organization_memberships") {
          membershipInserts.push(values);
          currentMembership = {
            id: "membership-1",
            role: String(values.role),
            status: String(values.status),
          };
        }

        if (table === "staff_members") {
          const row = {
            id: "staff-new",
            organization_id: String(values.organization_id),
            user_id: String(values.user_id),
            first_name: String(values.first_name),
            last_name: String(values.last_name),
            email: String(values.email),
            role_title: String(values.role_title),
            status: String(values.status),
            created_at: "2026-08-01T00:00:00Z",
            updated_at: "2026-08-01T00:00:00Z",
          };
          staffRows = [row];
        }

        return filterBuilder;
      },
      update(values: Record<string, unknown>) {
        if (table === "organization_memberships") {
          membershipUpdates.push(values);
          if (currentMembership) {
            currentMembership = {
              ...currentMembership,
              ...values,
              role: String(values.role ?? currentMembership.role),
              status: String(values.status ?? currentMembership.status),
            };
          }
        }

        if (table === "staff_members" && staffRows[0]) {
          staffRows[0] = {
            ...staffRows[0],
            ...values,
            first_name: String(values.first_name ?? staffRows[0].first_name),
            last_name: String(values.last_name ?? staffRows[0].last_name),
            email: String(values.email ?? staffRows[0].email),
            role_title: String(values.role_title ?? staffRows[0].role_title),
            status: String(values.status ?? staffRows[0].status),
            user_id: String(values.user_id ?? staffRows[0].user_id),
          } as StaffRow;
        }

        return filterBuilder;
      },
      then(
        resolve: (value: unknown) => unknown,
        reject?: (reason?: unknown) => unknown,
      ) {
        if (table === "staff_members" && nextFilters.__ilike) {
          const email = String(
            (nextFilters.__ilike as { value: string }).value,
          ).toLowerCase();
          const matches = staffRows.filter(
            (row) => String(row.email ?? "").toLowerCase() === email,
          );
          return Promise.resolve(resolve({ data: matches, error: null })).then(
            resolve,
            reject,
          );
        }

        return Promise.resolve(resolve({ data: staffRows, error: null })).then(
          resolve,
          reject,
        );
      },
    };

    return filterBuilder;
  }

  const admin = {
    from(table: string) {
      return createFilterBuilder(table);
    },
    auth: {
      admin: {
        listUsers: async () => ({ data: { users: [] }, error: null }),
        createUser: async () => ({
          data: { user: { id: authUser.id, email: authUser.email } },
          error: null,
        }),
        getUserById: async () => ({
          data: { user: { id: authUser.id, email: authUser.email } },
          error: null,
        }),
      },
    },
  } as unknown as SupabaseClient;

  return {
    admin,
    membershipInserts,
    membershipUpdates,
    authUser,
  };
}

describe("addStaffPortalAccess", () => {
  const organizationId = "org-1";

  it("creates staff record and teacher membership for a new email", async () => {
    const insertedStaff: StaffRow = {
      id: "staff-new",
      organization_id: organizationId,
      user_id: "user-teacher-1",
      first_name: "Taylor",
      last_name: "Reyes",
      email: "teacher@example.com",
      role_title: "Lead Teacher",
      status: "active",
      created_at: "2026-08-01T00:00:00Z",
      updated_at: "2026-08-01T00:00:00Z",
    };

    const { admin, membershipInserts } = createMockSupabase({
      insertedStaff,
    });

    const result = await addStaffPortalAccess(admin, {
      organizationId,
      email: "teacher@example.com",
      firstName: "Taylor",
      lastName: "Reyes",
      roleTitle: "Lead Teacher",
      portalRole: "teacher",
    });

    assert.equal(result.firstName, "Taylor");
    assert.equal(result.portalRole, "teacher");
    assert.equal(membershipInserts.length, 1);
    assert.equal(membershipInserts[0]?.role, "teacher");
    assert.equal(membershipInserts[0]?.status, "active");
  });

  it("rejects duplicate active staff portal access", async () => {
    const existingStaff: StaffRow = {
      id: "staff-1",
      organization_id: organizationId,
      user_id: "user-teacher-1",
      first_name: "Taylor",
      last_name: "Reyes",
      email: "teacher@example.com",
      role_title: "Lead Teacher",
      status: "active",
      created_at: "2026-08-01T00:00:00Z",
      updated_at: "2026-08-01T00:00:00Z",
    };

    const { admin } = createMockSupabase({
      existingStaff,
      membership: { id: "membership-1", role: "teacher", status: "active" },
    });

    await assert.rejects(
      () =>
        addStaffPortalAccess(admin, {
          organizationId,
          email: "teacher@example.com",
          firstName: "Taylor",
          lastName: "Reyes",
          roleTitle: "Lead Teacher",
          portalRole: "teacher",
        }),
      (error: unknown) => {
        assert.ok(error instanceof StaffMemberError);
        assert.equal(error.code, "duplicate_staff");
        return true;
      },
    );
  });

  it("rejects conflicting parent membership", async () => {
    const { admin } = createMockSupabase({
      membership: { id: "membership-1", role: "parent", status: "active" },
    });

    await assert.rejects(
      () =>
        addStaffPortalAccess(admin, {
          organizationId,
          email: "parent@example.com",
          firstName: "Jamie",
          lastName: "Lee",
          roleTitle: "Teacher",
          portalRole: "teacher",
        }),
      (error: unknown) => {
        assert.ok(error instanceof StaffMemberError);
        assert.equal(error.code, "conflicting_membership");
        return true;
      },
    );
  });

  it("reactivates disabled teacher membership for an existing staff record", async () => {
    const existingStaff: StaffRow = {
      id: "staff-1",
      organization_id: organizationId,
      user_id: "user-teacher-1",
      first_name: "Taylor",
      last_name: "Reyes",
      email: "teacher@example.com",
      role_title: "Lead Teacher",
      status: "inactive",
      created_at: "2026-08-01T00:00:00Z",
      updated_at: "2026-08-01T00:00:00Z",
    };

    const updatedStaff: StaffRow = {
      ...existingStaff,
      status: "active",
    };

    const { admin, membershipUpdates } = createMockSupabase({
      existingStaff,
      membership: { id: "membership-1", role: "teacher", status: "disabled" },
      updatedStaff,
    });

    const result = await addStaffPortalAccess(admin, {
      organizationId,
      email: "teacher@example.com",
      firstName: "Taylor",
      lastName: "Reyes",
      roleTitle: "Lead Teacher",
      portalRole: "teacher",
    });

    assert.equal(result.employmentStatus, "active");
    assert.equal(membershipUpdates.length, 1);
    assert.equal(membershipUpdates[0]?.status, "active");
  });
});
