import type { SupabaseClient } from '@supabase/supabase-js';

jest.mock('@/lib/auth/auth-session', () => ({
  requireSupabaseAccessToken: jest.fn().mockResolvedValue('test-access-token'),
}));

jest.mock('@/lib/organizations', () => {
  const actual = jest.requireActual('@/lib/organizations');
  return {
    ...actual,
    hydrateLiveOrganizationsBranding: jest.fn(
      async (organizations: unknown[]) => organizations,
    ),
  };
});

import { requireSupabaseAccessToken } from '@/lib/auth/auth-session';
import {
  listAccessibleLiveOrganizations,
  listAccessibleLiveOrganizationSlugs,
  resolveMobileSchoolAfterAuth,
} from '@/lib/auth/list-accessible-organizations';

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

function createSupabase(
  handlers: Record<
    string,
    (filters: FilterState) => Promise<{ data: unknown; error: null }>
  >,
): SupabaseClient {
  return { from: createTableHandler(handlers) } as SupabaseClient;
}

const USER_ID = 'user-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const PEER_USER_ID = 'user-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const LINK_GROUP_ID = 'group-cccc-cccc-cccc-cccccccccccc';

describe('listAccessibleLiveOrganizationSlugs', () => {
  it('requires a Supabase access token before querying', async () => {
    const supabase = createSupabase({
      profiles: async () => ({ data: { role: 'user' }, error: null }),
      organization_portal_account_link_members: async () => ({
        data: [],
        error: null,
      }),
      organization_memberships: async () => ({ data: [], error: null }),
      guardians: async () => ({ data: [], error: null }),
    });

    await listAccessibleLiveOrganizationSlugs(supabase, USER_ID);
    expect(requireSupabaseAccessToken).toHaveBeenCalled();
  });

  it('returns empty when user has no memberships', async () => {
    const supabase = createSupabase({
      profiles: async () => ({ data: { role: 'user' }, error: null }),
      organization_portal_account_link_members: async () => ({
        data: [],
        error: null,
      }),
      organization_memberships: async () => ({ data: [], error: null }),
      guardians: async () => ({ data: [], error: null }),
    });

    const slugs = await listAccessibleLiveOrganizationSlugs(supabase, USER_ID);
    expect(slugs).toEqual([]);
  });

  it('includes parent guardian org slugs', async () => {
    const supabase = createSupabase({
      profiles: async () => ({ data: { role: 'user' }, error: null }),
      organization_portal_account_link_members: async () => ({
        data: [],
        error: null,
      }),
      organization_memberships: async (filters) => {
        if (filters.role === 'parent') {
          return {
            data: [
              {
                organizations: {
                  id: 'org-rooted',
                  slug: 'rooted-meadows',
                  name: 'Rooted Meadows',
                  status: 'live',
                },
              },
            ],
            error: null,
          };
        }
        return { data: [], error: null };
      },
      guardians: async () => ({ data: [], error: null }),
    });

    const slugs = await listAccessibleLiveOrganizationSlugs(supabase, USER_ID);
    expect(slugs).toEqual(['rooted-meadows']);
  });

  it('includes parent org slugs from a linked peer parent membership', async () => {
    const supabase = createSupabase({
      profiles: async () => ({ data: { role: 'user' }, error: null }),
      organization_portal_account_link_members: async (filters) => {
        if (filters.user_id === USER_ID && !filters.group_id) {
          return {
            data: [{ group_id: LINK_GROUP_ID }],
            error: null,
          };
        }
        if (filters.group_id === LINK_GROUP_ID) {
          return {
            data: [{ user_id: USER_ID }, { user_id: PEER_USER_ID }],
            error: null,
          };
        }
        return { data: [], error: null };
      },
      organization_memberships: async (filters) => {
        if (filters.role !== 'parent') {
          return { data: [], error: null };
        }
        const userIds = filters.user_id as string[] | undefined;
        if (Array.isArray(userIds) && userIds.includes(PEER_USER_ID)) {
          return {
            data: [
              {
                organizations: {
                  id: 'org-peer',
                  slug: 'linked-peer-school',
                  name: 'Peer School',
                  status: 'live',
                },
              },
            ],
            error: null,
          };
        }
        return { data: [], error: null };
      },
      guardians: async () => ({ data: [], error: null }),
    });

    const slugs = await listAccessibleLiveOrganizationSlugs(supabase, USER_ID);
    expect(slugs).toEqual(['linked-peer-school']);
  });
});

describe('listAccessibleLiveOrganizations', () => {
  it('dedupes organizations by id across membership sources', async () => {
    const supabase = createSupabase({
      profiles: async () => ({ data: { role: 'user' }, error: null }),
      organization_portal_account_link_members: async () => ({
        data: [],
        error: null,
      }),
      organization_memberships: async (filters) => {
        const roles = filters.role as string[] | string | undefined;
        const roleList = Array.isArray(roles) ? roles : [roles];
        if (roleList.includes('teacher')) {
          return {
            data: [
              {
                organizations: {
                  id: 'org-shared',
                  slug: 'shared-school',
                  name: 'Shared School',
                  status: 'live',
                },
              },
            ],
            error: null,
          };
        }
        if (filters.role === 'parent') {
          return {
            data: [
              {
                organizations: {
                  id: 'org-shared',
                  slug: 'shared-school',
                  name: 'Shared School',
                  status: 'live',
                },
              },
            ],
            error: null,
          };
        }
        return { data: [], error: null };
      },
      guardians: async () => ({ data: [], error: null }),
    });

    const organizations = await listAccessibleLiveOrganizations(supabase, USER_ID);
    expect(organizations).toHaveLength(1);
    expect(organizations[0]?.slug).toBe('shared-school');
    expect(organizations[0]?.id).toBe('org-shared');
  });
});

describe('resolveMobileSchoolAfterAuth', () => {
  it('returns none when there are no accessible schools', async () => {
    const supabase = createSupabase({
      profiles: async () => ({ data: { role: 'user' }, error: null }),
      organization_portal_account_link_members: async () => ({
        data: [],
        error: null,
      }),
      organization_memberships: async () => ({ data: [], error: null }),
      guardians: async () => ({ data: [], error: null }),
    });

    const result = await resolveMobileSchoolAfterAuth(supabase, USER_ID);
    expect(result).toEqual({ kind: 'none' });
  });

  it('returns single when user has one school', async () => {
    const supabase = createSupabase({
      profiles: async () => ({ data: { role: 'user' }, error: null }),
      organization_portal_account_link_members: async () => ({
        data: [],
        error: null,
      }),
      organization_memberships: async (filters) => {
        if (filters.role === 'parent') {
          return {
            data: [
              {
                organizations: {
                  id: 'org-sage',
                  slug: 'sage-field',
                  name: 'Sage Field',
                  status: 'live',
                },
              },
            ],
            error: null,
          };
        }
        return { data: [], error: null };
      },
      guardians: async () => ({ data: [], error: null }),
    });

    const result = await resolveMobileSchoolAfterAuth(supabase, USER_ID);
    expect(result).toEqual({ kind: 'single', slug: 'sage-field' });
  });

  it('returns choose when user has multiple schools', async () => {
    const supabase = createSupabase({
      profiles: async () => ({ data: { role: 'user' }, error: null }),
      organization_portal_account_link_members: async () => ({
        data: [],
        error: null,
      }),
      organization_memberships: async (filters) => {
        if (filters.role === 'parent') {
          return {
            data: [
              {
                organizations: {
                  id: 'org-a',
                  slug: 'school-a',
                  name: 'School A',
                  status: 'live',
                },
              },
              {
                organizations: {
                  id: 'org-b',
                  slug: 'school-b',
                  name: 'School B',
                  status: 'live',
                },
              },
            ],
            error: null,
          };
        }
        return { data: [], error: null };
      },
      guardians: async () => ({ data: [], error: null }),
    });

    const result = await resolveMobileSchoolAfterAuth(supabase, USER_ID);
    expect(result).toEqual({ kind: 'choose', slugs: ['school-a', 'school-b'] });
  });

  it('returns single when only a linked peer has parent membership', async () => {
    const supabase = createSupabase({
      profiles: async () => ({ data: { role: 'user' }, error: null }),
      organization_portal_account_link_members: async (filters) => {
        if (filters.user_id === USER_ID && !filters.group_id) {
          return {
            data: [{ group_id: LINK_GROUP_ID }],
            error: null,
          };
        }
        if (filters.group_id === LINK_GROUP_ID) {
          return {
            data: [{ user_id: USER_ID }, { user_id: PEER_USER_ID }],
            error: null,
          };
        }
        return { data: [], error: null };
      },
      organization_memberships: async (filters) => {
        if (filters.role !== 'parent') {
          return { data: [], error: null };
        }
        const userIds = filters.user_id as string[] | undefined;
        if (Array.isArray(userIds) && userIds.includes(PEER_USER_ID)) {
          return {
            data: [
              {
                organizations: {
                  id: 'org-peer-only',
                  slug: 'peer-only-school',
                  name: 'Peer Only',
                  status: 'live',
                },
              },
            ],
            error: null,
          };
        }
        return { data: [], error: null };
      },
      guardians: async () => ({ data: [], error: null }),
    });

    const result = await resolveMobileSchoolAfterAuth(supabase, USER_ID);
    expect(result).toEqual({ kind: 'single', slug: 'peer-only-school' });
  });
});
