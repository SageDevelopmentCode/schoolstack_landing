import type { SupabaseClient } from '@supabase/supabase-js';

import { resolvePortalForOption } from '@/lib/auth/resolve-portal-choice';
import { PortalAccessError } from '@/lib/auth/resolve-portal';
import type { LiveOrganization } from '@/lib/organizations';

const ORG_ID = 'org-1111-1111-1111-111111111111';
const PARENT_USER_ID = 'parent-2222-2222-2222-222222222222';
const STAFF_USER_ID = 'staff-3333-3333-3333-333333333333';
const GROUP_ID = 'group-4444-4444-4444-444444444444';

const SCHOOL: LiveOrganization = {
  id: ORG_ID,
  slug: 'rooted-meadows-demo',
  name: 'Rooted Meadows Demo',
  branding: {
    colors: { primary: '#000', secondary: '#000', accent: '#000', bg: '#fff' },
    logoSrc: '',
    logoAlt: '',
  },
};

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
    profiles: async () => ({ data: { role: 'user' }, error: null }),
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
      return { data: [], error: null };
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
      if (filters.organization_id !== ORG_ID) {
        return { data: null, error: null };
      }

      const userIds = Array.isArray(filters.user_id)
        ? (filters.user_id as string[])
        : filters.user_id
          ? [String(filters.user_id)]
          : [];
      const roles = Array.isArray(filters.role)
        ? (filters.role as string[])
        : filters.role
          ? [String(filters.role)]
          : [];

      if (
        userIds.includes(STAFF_USER_ID) &&
        roles.some((role) => role === 'teacher' || role === 'staff')
      ) {
        return { data: { id: 'membership-teacher' }, error: null };
      }

      if (userIds.includes(PARENT_USER_ID) && roles.includes('parent')) {
        return { data: { id: 'membership-parent' }, error: null };
      }

      return { data: null, error: null };
    },
    guardians: async () => ({ data: null, error: null }),
    students: async () => ({ data: [], error: null }),
    enrollments: async () => ({ data: [], error: null }),
    applications: async () => ({ data: [], error: null }),
  });

  return { from } as SupabaseClient;
}

describe('resolvePortalForOption', () => {
  it('resolves teacher portal for linked staff membership', async () => {
    const supabase = createLinkedParentStaffSupabase();
    const portal = await resolvePortalForOption(
      supabase,
      PARENT_USER_ID,
      SCHOOL,
      'teacher',
    );
    expect(portal.portalType).toBe('teacher');
    expect(portal.school?.id).toBe(ORG_ID);
  });

  it('resolves family_apply for linked parent membership', async () => {
    const supabase = createLinkedParentStaffSupabase();
    const portal = await resolvePortalForOption(
      supabase,
      PARENT_USER_ID,
      SCHOOL,
      'family_apply',
    );
    expect(portal.portalType).toBe('parent_apply');
  });

  it('rejects teacher portal when staff membership is missing', async () => {
    const from = createTableHandler({
      profiles: async () => ({ data: { role: 'user' }, error: null }),
      organization_portal_account_link_members: async () => ({
        data: [],
        error: null,
      }),
      organization_memberships: async () => ({ data: null, error: null }),
      guardians: async () => ({ data: null, error: null }),
      applications: async () => ({ data: [], error: null }),
    });
    const supabase = { from } as SupabaseClient;

    await expect(
      resolvePortalForOption(supabase, PARENT_USER_ID, SCHOOL, 'teacher'),
    ).rejects.toBeInstanceOf(PortalAccessError);
  });
});
