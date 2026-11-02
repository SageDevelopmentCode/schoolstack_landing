import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  dedupeCommitteeSections,
  resolveParentTeacherCommitteeNavSections,
  resolveSchoolAdminCommitteeNavSections,
} from '@/lib/committees/committee-workspace-nav-sections';
import type { CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';

const LEGACY_PARENT_SECTIONS: CommitteeWorkspaceSection[] = [
  'home',
  'resources',
  'calendar',
  'tasks',
  'messages',
  'members',
];

describe('committee-workspace-nav-sections', () => {
  describe('dedupeCommitteeSections', () => {
    it('preserves order and removes duplicates', () => {
      assert.deepEqual(
        dedupeCommitteeSections(['tasks', 'projects', 'tasks', 'projects']),
        ['tasks', 'projects'],
      );
    });
  });

  describe('resolveParentTeacherCommitteeNavSections', () => {
    it('appends projects when missing from stored config', () => {
      const nav = resolveParentTeacherCommitteeNavSections(LEGACY_PARENT_SECTIONS);
      assert.ok(nav.includes('projects'));
      assert.ok(nav.indexOf('projects') > nav.indexOf('tasks'));
    });

    it('does not duplicate projects when config already includes it', () => {
      const withProjects: CommitteeWorkspaceSection[] = [...LEGACY_PARENT_SECTIONS, 'projects'];
      const nav = resolveParentTeacherCommitteeNavSections(withProjects);
      assert.equal(nav.filter((section) => section === 'projects').length, 1);
    });

    it('drops admin-only sections from parent nav', () => {
      const nav = resolveParentTeacherCommitteeNavSections([
        ...LEGACY_PARENT_SECTIONS,
        'activity',
        'settings',
      ]);
      assert.ok(!nav.includes('activity'));
      assert.ok(!nav.includes('settings'));
    });
  });

  describe('resolveSchoolAdminCommitteeNavSections', () => {
    it('appends projects in preview without activity or settings', () => {
      const nav = resolveSchoolAdminCommitteeNavSections(LEGACY_PARENT_SECTIONS, {
        preview: true,
      });
      assert.ok(nav.includes('projects'));
      assert.ok(!nav.includes('activity'));
      assert.ok(!nav.includes('settings'));
    });

    it('appends projects, activity, and settings when not preview', () => {
      const nav = resolveSchoolAdminCommitteeNavSections(LEGACY_PARENT_SECTIONS, {
        preview: false,
      });
      assert.ok(nav.includes('projects'));
      assert.ok(nav.includes('activity'));
      assert.ok(nav.includes('settings'));
    });
  });
});
