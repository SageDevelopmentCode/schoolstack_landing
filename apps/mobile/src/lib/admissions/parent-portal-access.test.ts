import { getParentMobileGateCopy } from '@/lib/admissions/parent-portal-access';

function createSupabaseMock(handlers: {
  guardians?: { family_id: string }[];
  applications?: { id: string }[];
}) {
  return {
    from: (table: string) => {
      if (table === 'guardians') {
        return {
          select: () => ({
            eq: () => ({
              eq: async () => ({
                data: handlers.guardians ?? [],
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === 'applications') {
        return {
          select: () => ({
            eq: () => ({
              in: () => ({
                eq: () => ({
                  limit: async () => ({
                    data: handlers.applications ?? [],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  } as never;
}

describe('getParentMobileGateCopy', () => {
  it('returns enrollment copy when a family application is enrolling', async () => {
    const supabase = createSupabaseMock({
      guardians: [{ family_id: 'family-1' }],
      applications: [{ id: 'app-1' }],
    });

    const copy = await getParentMobileGateCopy(supabase, 'user-1', 'org-1', 'Rooted Meadows');

    expect(copy.title).toBe('Continue on the web');
    expect(copy.ctaLabel).toBe('Continue enrollment');
    expect(copy.body).toContain('enrollment checklist');
    expect(copy.body).toContain('Rooted Meadows');
  });

  it('returns application copy when no enrolling application exists', async () => {
    const supabase = createSupabaseMock({
      guardians: [{ family_id: 'family-1' }],
      applications: [],
    });

    const copy = await getParentMobileGateCopy(supabase, 'user-1', 'org-1', 'Rooted Meadows');

    expect(copy.ctaLabel).toBe('Continue application');
    expect(copy.body).toContain('application or enrollment');
  });
});
