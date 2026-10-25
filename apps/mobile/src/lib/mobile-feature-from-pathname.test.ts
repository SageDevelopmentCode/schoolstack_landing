import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  resolveParentMobileFeatureKey,
  resolveSchoolAdminMobileFeatureKey,
  resolveTeacherMobileFeatureKey,
} from '@/lib/mobile-feature-from-pathname';

describe('resolveTeacherMobileFeatureKey', () => {
  it('maps primary tabs', () => {
    assert.equal(
      resolveTeacherMobileFeatureKey('/teacher/rooted-meadows/home'),
      'home',
    );
    assert.equal(
      resolveTeacherMobileFeatureKey('/teacher/rooted-meadows/more/attendance'),
      'attendance',
    );
  });

  it('skips student detail', () => {
    assert.equal(
      resolveTeacherMobileFeatureKey('/teacher/rooted-meadows/students/abc'),
      null,
    );
  });
});

describe('resolveSchoolAdminMobileFeatureKey', () => {
  it('maps dashboard and more routes', () => {
    assert.equal(
      resolveSchoolAdminMobileFeatureKey('/school-admin/rooted-meadows/dashboard'),
      'dashboard',
    );
    assert.equal(
      resolveSchoolAdminMobileFeatureKey('/school-admin/rooted-meadows/more/schedule'),
      'schedule',
    );
  });
});

describe('resolveParentMobileFeatureKey', () => {
  it('maps billing tab', () => {
    assert.equal(
      resolveParentMobileFeatureKey('/parent/rooted-meadows/billing', [
        { tabId: 'home', pathSegment: 'home' },
        { tabId: 'billing', pathSegment: 'billing' },
      ]),
      'billing',
    );
  });
});
