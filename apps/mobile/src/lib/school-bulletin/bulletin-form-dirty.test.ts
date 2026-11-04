import {
  isBulletinEditorDirty,
  snapshotFromBulletinPost,
  type BulletinEditorFormSnapshot,
} from '@/lib/school-bulletin/bulletin-form-dirty';
import type { BulletinPost } from '@/lib/school-bulletin/types';

function makePost(overrides: Partial<BulletinPost> = {}): BulletinPost {
  return {
    id: 'post-1',
    organizationId: 'org-1',
    title: 'Lantern Walk',
    body: 'Hello families',
    status: 'draft',
    audiences: ['school_wide'],
    programIds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    attachments: [],
    ...overrides,
  };
}

function formFromPost(post: BulletinPost): BulletinEditorFormSnapshot {
  return snapshotFromBulletinPost(post);
}

describe('isBulletinEditorDirty', () => {
  it('is not dirty when form matches saved post', () => {
    const post = makePost();
    expect(isBulletinEditorDirty(formFromPost(post), post)).toBe(false);
  });

  it('is dirty when title changes', () => {
    const post = makePost();
    const form = formFromPost(post);
    expect(isBulletinEditorDirty({ ...form, title: 'Updated title' }, post)).toBe(true);
  });

  it('is not dirty for empty new post defaults', () => {
    expect(isBulletinEditorDirty(formFromPost(makePost({ title: '', body: '' })), null)).toBe(false);
  });

  it('is dirty for new post with content', () => {
    expect(
      isBulletinEditorDirty(
        {
          title: 'Draft',
          body: '',
          audiences: ['school_wide'],
          programIds: [],
          publishScheduleEnabled: false,
          publishedAt: '',
          expiryEnabled: false,
          expiresAt: '',
        },
        null,
      ),
    ).toBe(true);
  });
});
