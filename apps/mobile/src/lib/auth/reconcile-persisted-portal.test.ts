import type { SupabaseClient } from '@supabase/supabase-js';

import type { PersistedPortalState } from '@/lib/auth/portal-persistence';
import { reconcilePersistedPortal } from '@/lib/auth/reconcile-persisted-portal';
import type { LiveOrganization } from '@/lib/organizations';

const ORG: LiveOrganization = {
  id: 'org-1',
  slug: 'rooted-meadows-demo',
  name: 'Rooted Meadows Demo',
  branding: {
    colors: {
      primary: '#000',
      secondary: '#000',
      accent: '#000',
      background: '#fff',
      text: '#000',
    },
    logoSrc: '',
    logoAlt: '',
  },
};

const TEACHER_USER_ID = 'teacher-user';

function createSupabaseMock(options: { teacherMembership?: boolean }): SupabaseClient {
  const from = (table: string) => {
    const filters: Record<string, unknown> = {};
    const builder = {
      select() {
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
        if (table === 'profiles' && filters.id === TEACHER_USER_ID) {
          return { data: { role: null }, error: null };
        }

        if (
          table === 'organization_memberships' &&
          filters.organization_id === ORG.id &&
          filters.user_id === TEACHER_USER_ID &&
          filters.status === 'active' &&
          options.teacherMembership &&
          Array.isArray(filters.role) &&
          (filters.role as string[]).includes('teacher')
        ) {
          return { data: { id: 'membership-1' }, error: null };
        }

        if (table === 'organization_memberships') {
          return { data: null, error: null };
        }

        if (table === 'organization_portal_account_link_members') {
          return { data: null, error: null };
        }

        if (table === 'guardians') {
          return { data: null, error: null };
        }

        if (table === 'applications') {
          return { data: [], error: null };
        }

        return { data: null, error: null };
      },
      then(
        resolve: (value: unknown) => unknown,
        reject?: (reason?: unknown) => unknown,
      ) {
        const result = Promise.resolve({ data: [], error: null });
        return result.then(resolve, reject);
      },
    };
    return builder;
  };

  return { from } as unknown as SupabaseClient;
}

describe('reconcilePersistedPortal', () => {
  it('keeps preview sessions unchanged', async () => {
    const persisted: PersistedPortalState = {
      portalType: 'school_admin',
      selectedSchool: ORG,
      isPlatformAdminSession: true,
      previewSession: {
        portal: 'school_admin',
        organizationId: ORG.id,
        slug: ORG.slug,
        subjectLabel: 'Preview',
      },
      persistedUserId: TEACHER_USER_ID,
    };

    const result = await reconcilePersistedPortal(
      createSupabaseMock({ teacherMembership: true }),
      TEACHER_USER_ID,
      persisted,
    );

    expect(result.didChange).toBe(false);
    expect(result.portalType).toBe('school_admin');
  });

  it('downgrades stale school_admin persistence to teacher', async () => {
    const persisted: PersistedPortalState = {
      portalType: 'school_admin',
      selectedSchool: ORG,
      isPlatformAdminSession: true,
      previewSession: null,
      persistedUserId: TEACHER_USER_ID,
    };

    const result = await reconcilePersistedPortal(
      createSupabaseMock({ teacherMembership: true }),
      TEACHER_USER_ID,
      persisted,
    );

    expect(result.didChange).toBe(true);
    expect(result.portalType).toBe('teacher');
    expect(result.isPlatformAdminSession).toBe(false);
  });
});
