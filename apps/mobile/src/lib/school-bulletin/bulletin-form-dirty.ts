import {
  normalizeBulletinAudiences,
  normalizeBulletinProgramIds,
  toDateTimeLocalValue,
} from '@/lib/school-bulletin/bulletin-audience';
import type { BulletinAudience, BulletinPost } from '@/lib/school-bulletin/types';
import { haveSameIds } from '@/lib/unsaved-changes';

export type BulletinEditorFormSnapshot = {
  title: string;
  body: string;
  audiences: BulletinAudience[];
  programIds: string[];
  publishScheduleEnabled: boolean;
  publishedAt: string;
  expiryEnabled: boolean;
  expiresAt: string;
};

const EMPTY_DEFAULTS: BulletinEditorFormSnapshot = {
  title: '',
  body: '',
  audiences: ['school_wide'],
  programIds: [],
  publishScheduleEnabled: false,
  publishedAt: '',
  expiryEnabled: false,
  expiresAt: '',
};

function audiencesEqual(left: BulletinAudience[], right: BulletinAudience[]): boolean {
  const a = [...normalizeBulletinAudiences(left)].sort().join('\0');
  const b = [...normalizeBulletinAudiences(right)].sort().join('\0');
  return a === b;
}

function snapshotsEqual(left: BulletinEditorFormSnapshot, right: BulletinEditorFormSnapshot): boolean {
  return (
    left.title.trim() === right.title.trim() &&
    left.body === right.body &&
    audiencesEqual(left.audiences, right.audiences) &&
    haveSameIds(
      normalizeBulletinProgramIds(left.programIds),
      normalizeBulletinProgramIds(right.programIds),
    ) &&
    left.publishScheduleEnabled === right.publishScheduleEnabled &&
    left.publishedAt === right.publishedAt &&
    left.expiryEnabled === right.expiryEnabled &&
    left.expiresAt === right.expiresAt
  );
}

export function snapshotFromBulletinPost(post: BulletinPost): BulletinEditorFormSnapshot {
  const publishedLocal = toDateTimeLocalValue(post.publishedAt);
  const expiresLocal = toDateTimeLocalValue(post.expiresAt);
  return {
    title: post.title ?? '',
    body: post.body ?? '',
    audiences: normalizeBulletinAudiences(post.audiences),
    programIds: normalizeBulletinProgramIds(post.programIds),
    publishScheduleEnabled: Boolean(publishedLocal),
    publishedAt: publishedLocal,
    expiryEnabled: Boolean(expiresLocal),
    expiresAt: expiresLocal,
  };
}

export function isBulletinEditorDirty(
  form: BulletinEditorFormSnapshot,
  savedPost: BulletinPost | null,
): boolean {
  const baseline = savedPost ? snapshotFromBulletinPost(savedPost) : EMPTY_DEFAULTS;
  return !snapshotsEqual(form, baseline);
}
