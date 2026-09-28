import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { userIsOrgAdmin } from "@/lib/admissions/application-auth";
import { getStaffUserProfile } from "@/lib/staff/teacher-portal-access";
import { userCanAccessSchoolAdmin } from "@/lib/school-admin/access";

const ORG_ID = "org-1111-1111-1111-111111111111";
const PARENT_USER_ID = "parent-2222-2222-2222-222222222222";
const STAFF_USER_ID = "staff-3333-3333-3333-333333333333";
const GROUP_ID = "group-4444-4444-4444-444444444444";
type FilterState = Record<string, unknown>;

function createTableHandler(
  handlers: Record<
    string,
    (filters: FilterState) => Promise<{ data: unknown; error: null }>
  >,
) {
  return function from(table: string) {
    const filters: FilterState = {};
    const builder = {
      select(_columns?: string) {
        return builder;
      },
      eq(column: string, value: unknown) {
        filters[column] = value;
        return builder;
      },
      in(column: string, value: unknown) {
        filters[column] = value;
        return builder;
      },
      order() {
        return builder;
      },
      limit() {
        return builder;
      },
      maybeSingle: async () => {
        const handler = handlers[table];
        if (!handler) {
          return { data: null, error: null };
        }
        return handler(filters);
      },
      then(
        resolve: (value: unknown) => unknown,
        reject?: (reason?: unknown) => unknown,
      ) {
        const handler = handlers[table];
        const result = handler
          ? handler(filters)
          : Promise.resolve({ data: [], error: null });
        return result.then(
          (resolved) => Promise.resolve(resolve(resolved)).then(resolve, reject),
          reject,
        );
      },
    };
    return builder;
  };
}

function createLinkedParentStaffSupabase(): SupabaseClient {
  const from = createTableHandler({
    organization_portal_account_link_members: async (filters) => {
      if (filters.user_id === PARENT_USER_ID && !filters.group_id) {
        return {
          data: { id: "link-member-1", group_id: GROUP_ID },
          error: null,
        };
      }
      if (filters.group_id === GROUP_ID) {
        return {
          data: [
            { user_id: PARENT_USER_ID },
            { user_id: STAFF_USER_ID },
          ],
          error: null,
        };
      }
      return { data: null, error: null };
    },
    organization_portal_account_link_groups: async (filters) => {
      if (filters.id === GROUP_ID) {
        return {
          data: { id: GROUP_ID, primary_user_id: STAFF_USER_ID },
          error: null,
        };
      }
      return { data: null, error: null };
    },
    organization_memberships: async (filters) => {
      if (
        filters.organization_id === ORG_ID &&
        filters.user_id === STAFF_USER_ID
      ) {
        return { data: { id: "membership-admin" }, error: null };
      }
      return { data: null, error: null };
    },
    staff_members: async (filters) => {
      if (
        filters.organization_id === ORG_ID &&
        filters.user_id === PARENT_USER_ID
      ) {
        return { data: null, error: null };
      }
      if (
        filters.organization_id === ORG_ID &&
        filters.user_id === STAFF_USER_ID
      ) {
        return {
          data: {
            first_name: "Staff",
            last_name: "Admin",
            email: "staff@school.test",
            profile_photo_url: null,
            role_title: "Director",
          },
          error: null,
        };
      }
      return { data: null, error: null };
    },
    profiles: async () => ({ data: { role: "user" }, error: null }),
  });

  return { from } as unknown as SupabaseClient;
}

describe("portal account link staff/admin access", () => {
  it("userIsOrgAdmin is true for a parent login linked to a staff admin", async () => {
    const supabase = createLinkedParentStaffSupabase();

    const isAdmin = await userIsOrgAdmin(
      supabase,
      PARENT_USER_ID,
      ORG_ID,
    );

    assert.equal(isAdmin, true);
  });

  it("getStaffUserProfile resolves the linked staff member record", async () => {
    const supabase = createLinkedParentStaffSupabase();
    const user = {
      id: PARENT_USER_ID,
      email: "parent@school.test",
      user_metadata: {},
    } as User;

    const profile = await getStaffUserProfile(
      supabase,
      PARENT_USER_ID,
      ORG_ID,
      user,
    );

    assert.equal(profile.displayName, "Staff Admin");
    assert.equal(profile.email, "parent@school.test");
  });

  it("userCanAccessSchoolAdmin is true for a parent login linked to a staff admin", async () => {
    const supabase = createLinkedParentStaffSupabase();

    const allowed = await userCanAccessSchoolAdmin(
      supabase,
      PARENT_USER_ID,
      ORG_ID,
    );

    assert.equal(allowed, true);
  });
});
