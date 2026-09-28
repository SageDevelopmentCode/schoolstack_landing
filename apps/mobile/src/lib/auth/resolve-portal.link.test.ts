import type { SupabaseClient } from '@supabase/supabase-js';

import { resolvePortalForSchool } from '@/lib/auth/resolve-portal';
import type { LiveOrganization } from '@/lib/organizations';

const ORG_ID = 'org-1111-1111-1111-111111111111';
const PARENT_USER_ID = 'parent-2222-2222-2222-222222222222';
const STAFF_USER_ID = 'staff-3333-3333-3333-333333333333';
const PRIMARY_PARENT_USER_ID = 'parent-5555-5555-5555-555555555555';
const SECOND_PARENT_USER_ID = 'parent-6666-6666-6666-666666666666';
const GROUP_ID = 'group-4444-4444-4444-444444444444';
const PARENT_PARENT_GROUP_ID = 'group-7777-7777-7777-777777777777';
const FAMILY_ID = 'family-8888-8888-8888-888888888888';
const STUDENT_ID = 'student-9999-9999-9999-999999999999';

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
          data: { id: 'link-member-1', group_id: GROUP_ID },
          error: null,
        };
      }
      if (filters.group_id === GROUP_ID) {
        return {
          data: [{ user_id: PARENT_USER_ID }, { user_id: STAFF_USER_ID }],
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
        return { data: { id: 'membership-admin' }, error: null };
      }
      return { data: null, error: null };
    },
    profiles: async () => ({ data: { role: 'user' }, error: null }),
  });

  return { from } as unknown as SupabaseClient;
}

function createLinkedParentParentEnrolledSupabase(): SupabaseClient {
  const from = createTableHandler({
    organization_portal_account_link_members: async (filters) => {
      if (
        filters.user_id === SECOND_PARENT_USER_ID &&
        !filters.group_id
      ) {
        return {
          data: { id: 'link-member-2', group_id: PARENT_PARENT_GROUP_ID },
          error: null,
        };
      }
      if (filters.group_id === PARENT_PARENT_GROUP_ID) {
        return {
          data: [
            { user_id: SECOND_PARENT_USER_ID },
            { user_id: PRIMARY_PARENT_USER_ID },
          ],
          error: null,
        };
      }
      return { data: null, error: null };
    },
    organization_portal_account_link_groups: async (filters) => {
      if (filters.id === PARENT_PARENT_GROUP_ID) {
        return {
          data: {
            id: PARENT_PARENT_GROUP_ID,
            primary_user_id: PRIMARY_PARENT_USER_ID,
          },
          error: null,
        };
      }
      return { data: null, error: null };
    },
    organization_memberships: async () => ({ data: null, error: null }),
    guardians: async (filters) => {
      if (
        filters.organization_id === ORG_ID &&
        filters.user_id === PRIMARY_PARENT_USER_ID
      ) {
        return { data: [{ family_id: FAMILY_ID }], error: null };
      }
      return { data: [], error: null };
    },
    students: async (filters) => {
      const familyIds = filters.family_id as string[] | undefined;
      if (
        filters.organization_id === ORG_ID &&
        Array.isArray(familyIds) &&
        familyIds.includes(FAMILY_ID)
      ) {
        return { data: [{ id: STUDENT_ID }], error: null };
      }
      return { data: [], error: null };
    },
    enrollments: async (filters) => {
      const studentIds = filters.student_id as string[] | undefined;
      if (
        filters.organization_id === ORG_ID &&
        filters.status === 'enrolled' &&
        Array.isArray(studentIds) &&
        studentIds.includes(STUDENT_ID)
      ) {
        return { data: [{ id: 'enrollment-1' }], error: null };
      }
      return { data: [], error: null };
    },
    profiles: async () => ({ data: { role: 'user' }, error: null }),
  });

  return { from } as unknown as SupabaseClient;
}

describe('resolvePortalForSchool linked accounts', () => {
  it('resolves school_admin when the parent login is linked to a staff admin', async () => {
    const supabase = createLinkedParentStaffSupabase();
    const school: LiveOrganization = {
      id: ORG_ID,
      slug: 'demo-school',
      name: 'Demo School',
    };

    const resolved = await resolvePortalForSchool(
      supabase,
      PARENT_USER_ID,
      school,
    );

    expect(resolved.portalType).toBe('school_admin');
    expect(resolved.school?.id).toBe(ORG_ID);
  });

  it('resolves parent when a linked co-parent has enrolled access via the primary guardian', async () => {
    const supabase = createLinkedParentParentEnrolledSupabase();
    const school: LiveOrganization = {
      id: ORG_ID,
      slug: 'demo-school',
      name: 'Demo School',
    };

    const resolved = await resolvePortalForSchool(
      supabase,
      SECOND_PARENT_USER_ID,
      school,
    );

    expect(resolved.portalType).toBe('parent');
    expect(resolved.school?.id).toBe(ORG_ID);
  });
});
