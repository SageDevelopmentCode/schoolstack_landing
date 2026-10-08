import type { SupabaseClient } from '@supabase/supabase-js';

import {
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

describe('listAccessibleLiveOrganizationSlugs', () => {
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
                  slug: 'rooted-meadows',
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
                organizations: { slug: 'sage-field', status: 'live' },
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
              { organizations: { slug: 'school-a', status: 'live' } },
              { organizations: { slug: 'school-b', status: 'live' } },
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
});
