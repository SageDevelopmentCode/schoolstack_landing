import { fetchSchoolPortalOptions } from '@/lib/auth/school-portal-options-api';
import {
  clearSchoolPortalOptionsCache,
  prefetchSchoolPortalOptions,
  readCachedSchoolPortalOptions,
} from '@/lib/auth/school-portal-options-cache';
import type { SchoolPortalOption } from '@/lib/auth/school-portal-options-types';
import { getSupabaseClient } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock('@/lib/auth/school-portal-options-api', () => ({
  fetchSchoolPortalOptions: jest.fn(),
}));

const mockGetSupabaseClient = getSupabaseClient as jest.MockedFunction<typeof getSupabaseClient>;
const mockFetchSchoolPortalOptions = fetchSchoolPortalOptions as jest.MockedFunction<
  typeof fetchSchoolPortalOptions
>;

const organizationId = 'org-1';
const slug = 'rooted-meadows-demo';

const staffAndParent: SchoolPortalOption[] = [
  { id: 'teacher', label: 'Staff portal', href: '/school/x/teacher' },
  { id: 'family_apply', label: 'My applications', href: '/school/x/apply' },
  { id: 'family_parent', label: 'Parent portal', href: '/school/x/parent' },
];

const parentOnly: SchoolPortalOption[] = [
  { id: 'family_apply', label: 'My applications', href: '/school/x/apply' },
  { id: 'family_parent', label: 'Parent portal', href: '/school/x/parent' },
];

describe('school portal options cache', () => {
  let sessionUserId: string | null = 'user-a';

  beforeEach(() => {
    clearSchoolPortalOptionsCache();
    sessionUserId = 'user-a';
    mockFetchSchoolPortalOptions.mockReset();
    mockGetSupabaseClient.mockReturnValue({
      auth: {
        getSession: async () => ({
          data: {
            session: sessionUserId ? { user: { id: sessionUserId } } : null,
          },
        }),
      },
    } as never);
    mockFetchSchoolPortalOptions.mockImplementation(async () =>
      sessionUserId === 'user-a' ? staffAndParent : parentOnly,
    );
  });

  it('does not share cached options for the same school across users', async () => {
    const first = await prefetchSchoolPortalOptions(organizationId, slug);
    expect(first.map((option) => option.id)).toEqual(['teacher', 'family_parent']);
    expect(mockFetchSchoolPortalOptions).toHaveBeenCalledTimes(1);

    await expect(prefetchSchoolPortalOptions(organizationId, slug)).resolves.toEqual(first);
    expect(mockFetchSchoolPortalOptions).toHaveBeenCalledTimes(1);

    sessionUserId = 'user-b';
    const second = await prefetchSchoolPortalOptions(organizationId, slug);
    expect(second.map((option) => option.id)).toEqual(['family_parent']);
    expect(mockFetchSchoolPortalOptions).toHaveBeenCalledTimes(2);

    expect(readCachedSchoolPortalOptions('user-a', organizationId, slug)?.map((option) => option.id)).toEqual([
      'teacher',
      'family_parent',
    ]);
    expect(readCachedSchoolPortalOptions('user-b', organizationId, slug)?.map((option) => option.id)).toEqual([
      'family_parent',
    ]);
  });

  it('drops cached options when the cache is cleared', async () => {
    await prefetchSchoolPortalOptions(organizationId, slug);
    sessionUserId = 'user-b';
    await prefetchSchoolPortalOptions(organizationId, slug);
    expect(mockFetchSchoolPortalOptions).toHaveBeenCalledTimes(2);

    clearSchoolPortalOptionsCache();

    expect(readCachedSchoolPortalOptions('user-a', organizationId, slug)).toBeNull();
    expect(readCachedSchoolPortalOptions('user-b', organizationId, slug)).toBeNull();

    sessionUserId = 'user-a';
    await prefetchSchoolPortalOptions(organizationId, slug);
    expect(mockFetchSchoolPortalOptions).toHaveBeenCalledTimes(3);
  });

  it('returns no options and skips the cache when nobody is signed in', async () => {
    sessionUserId = null;

    await expect(prefetchSchoolPortalOptions(organizationId, slug)).resolves.toEqual([]);
    expect(mockFetchSchoolPortalOptions).not.toHaveBeenCalled();

    sessionUserId = 'user-a';
    await prefetchSchoolPortalOptions(organizationId, slug);
    expect(mockFetchSchoolPortalOptions).toHaveBeenCalledTimes(1);
  });
});
