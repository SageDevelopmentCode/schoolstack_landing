import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { userIsOrgAdmin } from "@/lib/admissions/application-auth";
import {
  getStaffMemberIdForUser,
  getStaffUserProfile,
  getStaffPortalRoleForUser,
  getTeacherPortalStaffMemberIdForUser,
  loadTeacherPortalContext,
  userHasTeacherPortalAccess,
} from "@/lib/staff/teacher-portal-access";
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
      // Teacher access: one list read for every linked login. The staff login is an admin.
      if (Array.isArray(filters.user_id)) {
        return { data: [], error: null };
      }
      if (
        filters.organization_id === ORG_ID &&
        filters.user_id === STAFF_USER_ID
      ) {
        return { data: { id: "membership-admin" }, error: null };
      }
      return { data: null, error: null };
    },
    staff_members: async (filters) => {
      if (Array.isArray(filters.user_id)) {
        const ids = filters.user_id as string[];
        return {
          data:
            filters.organization_id === ORG_ID && ids.includes(STAFF_USER_ID)
              ? [
                  {
                    id: "staff-admin-record",
                    user_id: STAFF_USER_ID,
                    first_name: "Staff",
                    last_name: "Admin",
                    email: "staff@school.test",
                    profile_photo_url: null,
                    role_title: "Director",
                  },
                ]
              : [],
          error: null,
        };
      }
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

const ADMIN_USER_ID = "admin-5555-5555-5555-555555555555";
const TEACHER_USER_ID = "teacher-6666-6666-6666-666666666666";
const ADMIN_TEACHER_GROUP_ID = "group-7777-7777-7777-777777777777";

/**
 * School admin login (primary, owner role, auto-created "School admin" staff record) linked to
 * the same person's teacher login (teacher role, their real staff record).
 */
function createAdminPrimaryLinkedTeacherSupabase(
  options: { linked?: boolean } = {},
): SupabaseClient {
  const linked = options.linked ?? true;
  const staffRows: Record<string, Record<string, unknown>> = {
    [ADMIN_USER_ID]: {
      id: "staff-admin",
      status: "active",
      first_name: "School",
      last_name: "Admin",
      email: "admin@school.test",
      profile_photo_url: null,
      role_title: "School admin",
    },
    [TEACHER_USER_ID]: {
      id: "staff-teacher",
      status: "active",
      first_name: "Rachael",
      last_name: "Sparhawk",
      email: "teacher@school.test",
      profile_photo_url: "https://example.test/rachael.jpg",
      role_title: "Main Lesson Teacher",
    },
  };

  const from = createTableHandler({
    organization_portal_account_link_members: async (filters) => {
      if (!linked) {
        return { data: filters.group_id ? [] : null, error: null };
      }
      if (filters.group_id === ADMIN_TEACHER_GROUP_ID) {
        return {
          data: [{ user_id: ADMIN_USER_ID }, { user_id: TEACHER_USER_ID }],
          error: null,
        };
      }
      if (filters.user_id === ADMIN_USER_ID || filters.user_id === TEACHER_USER_ID) {
        return {
          data: { id: `link-${String(filters.user_id)}`, group_id: ADMIN_TEACHER_GROUP_ID },
          error: null,
        };
      }
      return { data: null, error: null };
    },
    organization_portal_account_link_groups: async (filters) => {
      if (linked && filters.id === ADMIN_TEACHER_GROUP_ID) {
        return {
          data: { id: ADMIN_TEACHER_GROUP_ID, primary_user_id: ADMIN_USER_ID },
          error: null,
        };
      }
      return { data: null, error: null };
    },
    organization_memberships: async (filters) => {
      // Teacher-first ordering query: active teacher/staff memberships among link members.
      if (Array.isArray(filters.user_id)) {
        const ids = filters.user_id as string[];
        return {
          data: ids.includes(TEACHER_USER_ID)
            ? [{ user_id: TEACHER_USER_ID, role: "teacher" }]
            : [],
          error: null,
        };
      }
      return { data: null, error: null };
    },
    staff_members: async (filters) => {
      if (filters.organization_id !== ORG_ID) {
        return { data: null, error: null };
      }
      if (Array.isArray(filters.user_id)) {
        return {
          data: (filters.user_id as string[])
            .filter((id) => staffRows[id])
            .map((id) => ({ ...staffRows[id], user_id: id })),
          error: null,
        };
      }
      return { data: staffRows[String(filters.user_id)] ?? null, error: null };
    },
  });

  return { from } as unknown as SupabaseClient;
}

describe("teacher portal staff record for a school admin linked to a teacher login", () => {
  it("getTeacherPortalStaffMemberIdForUser picks the linked teacher's staff record", async () => {
    const supabase = createAdminPrimaryLinkedTeacherSupabase();

    const staffMemberId = await getTeacherPortalStaffMemberIdForUser(
      supabase,
      ADMIN_USER_ID,
      ORG_ID,
    );

    assert.equal(staffMemberId, "staff-teacher");
  });

  it("getStaffMemberIdForUser stays primary-first for admin-side callers", async () => {
    const supabase = createAdminPrimaryLinkedTeacherSupabase();

    const staffMemberId = await getStaffMemberIdForUser(
      supabase,
      ADMIN_USER_ID,
      ORG_ID,
    );

    assert.equal(staffMemberId, "staff-admin");
  });

  it("getStaffUserProfile shows the teacher's name and photo", async () => {
    const supabase = createAdminPrimaryLinkedTeacherSupabase();
    const user = {
      id: ADMIN_USER_ID,
      email: "admin@school.test",
      user_metadata: {},
    } as User;

    const profile = await getStaffUserProfile(supabase, ADMIN_USER_ID, ORG_ID, user);

    assert.equal(profile.displayName, "Rachael Sparhawk");
    assert.equal(profile.profilePhotoUrl, "https://example.test/rachael.jpg");
  });

  it("a single unlinked login resolves the same as before", async () => {
    const supabase = createAdminPrimaryLinkedTeacherSupabase({ linked: false });

    const [teacherPortalId, primaryFirstId] = await Promise.all([
      getTeacherPortalStaffMemberIdForUser(supabase, ADMIN_USER_ID, ORG_ID),
      getStaffMemberIdForUser(supabase, ADMIN_USER_ID, ORG_ID),
    ]);

    assert.equal(teacherPortalId, "staff-admin");
    assert.equal(primaryFirstId, "staff-admin");
  });
});

describe("loadTeacherPortalContext", () => {
  function countTableReads(supabase: SupabaseClient) {
    const reads: string[] = [];
    const from = (supabase as unknown as { from: (table: string) => unknown }).from;
    const counted = {
      from(table: string) {
        reads.push(table);
        return from(table);
      },
    } as unknown as SupabaseClient;
    return { counted, reads };
  }

  it("answers every teacher helper from one set of reads per client", async () => {
    const { counted, reads } = countTableReads(createAdminPrimaryLinkedTeacherSupabase());
    const user = { id: ADMIN_USER_ID, email: "admin@school.test", user_metadata: {} } as User;

    const [hasAccess, staffMemberId, role, profile] = await Promise.all([
      userHasTeacherPortalAccess(counted, ADMIN_USER_ID, ORG_ID),
      getTeacherPortalStaffMemberIdForUser(counted, ADMIN_USER_ID, ORG_ID),
      getStaffPortalRoleForUser(counted, ADMIN_USER_ID, ORG_ID),
      getStaffUserProfile(counted, ADMIN_USER_ID, ORG_ID, user),
    ]);

    assert.equal(hasAccess, true);
    assert.equal(staffMemberId, "staff-teacher");
    assert.equal(role, "teacher");
    assert.equal(profile.displayName, "Rachael Sparhawk");
    // Link member row + group + group members, then memberships and staff in parallel.
    assert.deepEqual([...reads].sort(), [
      "organization_memberships",
      "organization_portal_account_link_groups",
      "organization_portal_account_link_members",
      "organization_portal_account_link_members",
      "staff_members",
    ]);
  });

  it("orders the linked teacher login first and keeps the primary first in orderedUserIds", async () => {
    const context = await loadTeacherPortalContext(
      createAdminPrimaryLinkedTeacherSupabase(),
      ADMIN_USER_ID,
      ORG_ID,
    );

    assert.deepEqual(context.orderedUserIds, [ADMIN_USER_ID, TEACHER_USER_ID]);
    assert.deepEqual(context.teacherOrderedUserIds, [TEACHER_USER_ID, ADMIN_USER_ID]);
    assert.equal(context.staffMember?.role_title, "Main Lesson Teacher");
  });

  it("denies access when no linked login has an active teacher/staff membership", async () => {
    const context = await loadTeacherPortalContext(
      createAdminPrimaryLinkedTeacherSupabase({ linked: false }),
      ADMIN_USER_ID,
      ORG_ID,
    );

    assert.equal(context.hasAccess, false);
    assert.equal(context.portalRole, null);
    // Staff record lookup still works (admin-side previews rely on it).
    assert.equal(context.staffMember?.id, "staff-admin");
  });

  it("does not cache a failed read", async () => {
    let fail = true;
    const base = createAdminPrimaryLinkedTeacherSupabase();
    const baseFrom = (base as unknown as { from: (table: string) => unknown }).from;
    const flaky = {
      from(table: string) {
        if (fail && table === "staff_members") {
          const failing = {
            select: () => failing,
            eq: () => failing,
            in: () => failing,
            then: (
              resolve: (value: unknown) => unknown,
              reject?: (reason?: unknown) => unknown,
            ) =>
              Promise.resolve({ data: null, error: new Error("boom") }).then(resolve, reject),
          };
          return failing;
        }
        return baseFrom(table);
      },
    } as unknown as SupabaseClient;

    await assert.rejects(() => loadTeacherPortalContext(flaky, ADMIN_USER_ID, ORG_ID));
    fail = false;
    const context = await loadTeacherPortalContext(flaky, ADMIN_USER_ID, ORG_ID);
    assert.equal(context.staffMember?.id, "staff-teacher");
  });
});
