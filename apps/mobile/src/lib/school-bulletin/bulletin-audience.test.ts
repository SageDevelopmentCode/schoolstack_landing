import {
  formatBulletinAudiencesLabel,
  resolveBulletinDisplayStatus,
} from '@/lib/school-bulletin/bulletin-audience';
import type { BulletinPost } from '@/lib/school-bulletin/types';

function makePost(
  overrides: Partial<BulletinPost> = {},
): Pick<BulletinPost, 'status' | 'publishedAt' | 'expiresAt'> {
  return {
    status: 'published',
    ...overrides,
  };
}

describe('resolveBulletinDisplayStatus', () => {
  const now = new Date('2026-09-14T12:00:00.000Z');

  it('returns draft and archived statuses directly', () => {
    expect(resolveBulletinDisplayStatus(makePost({ status: 'draft' }), now)).toBe('draft');
    expect(resolveBulletinDisplayStatus(makePost({ status: 'archived' }), now)).toBe('archived');
  });

  it('returns scheduled when publish time is in the future', () => {
    expect(
      resolveBulletinDisplayStatus(
        makePost({ publishedAt: '2026-09-15T12:00:00.000Z' }),
        now,
      ),
    ).toBe('scheduled');
  });

  it('returns expired when expiry is in the past', () => {
    expect(
      resolveBulletinDisplayStatus(
        makePost({ expiresAt: '2026-09-13T12:00:00.000Z' }),
        now,
      ),
    ).toBe('expired');
  });

  it('returns active for published posts that are live', () => {
    expect(
      resolveBulletinDisplayStatus(
        makePost({ publishedAt: '2026-09-13T12:00:00.000Z' }),
        now,
      ),
    ).toBe('active');
  });
});

describe('formatBulletinAudiencesLabel', () => {
  const programNameById = new Map([
    ['prog-1', 'Kindergarten Co-op'],
    ['prog-2', 'Grade School'],
  ]);

  it('formats school-wide audience', () => {
    expect(formatBulletinAudiencesLabel(['school_wide'], programNameById)).toBe('School-wide');
  });

  it('formats program-scoped parent audience', () => {
    expect(
      formatBulletinAudiencesLabel(['parents'], programNameById, ['prog-1']),
    ).toBe('Kindergarten Co-op families');
  });

  it('joins multiple audience labels', () => {
    expect(
      formatBulletinAudiencesLabel(['school_wide', 'teachers'], programNameById),
    ).toBe('School-wide · Teachers only');
  });
});
