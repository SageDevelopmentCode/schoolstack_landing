import {
  countActiveSubmissions,
  submissionsPageHasMore,
} from '@/lib/school-admin/submissions-page-meta';

describe('countActiveSubmissions', () => {
  it('excludes withdrawn applications from active count', () => {
    const total = countActiveSubmissions({
      draft: 2,
      submitted: 1,
      enrolled: 3,
      withdrawn: 4,
    });

    expect(total).toBe(6);
  });
});

describe('submissionsPageHasMore', () => {
  it('returns true when a full page was fetched', () => {
    expect(submissionsPageHasMore(30, 30)).toBe(true);
  });

  it('returns false when fewer rows than page size were fetched', () => {
    expect(submissionsPageHasMore(12, 30)).toBe(false);
    expect(submissionsPageHasMore(0, 30)).toBe(false);
  });
});
