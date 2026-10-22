import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  filterStoryInboxThreads,
  isMudKitchenSupportListThread,
  MUDKITCHEN_SUPPORT_LEGACY_TEAM_NAME,
  MUDKITCHEN_SUPPORT_PLACEHOLDER_ID,
  mudKitchenSupportPlaceholderThread,
  pinMudKitchenSupportThread,
  prepareMobileInboxThreads,
  resolveMudKitchenSupportNavigationThreadId,
} from './platform-support';
import type { MessageThreadSummary } from './types';

function thread(
  id: string,
  participants: MessageThreadSummary['participants'],
  overrides: Partial<MessageThreadSummary> = {},
): MessageThreadSummary {
  return {
    id,
    subject: null,
    title: 'Conversation',
    color: '#7FA888',
    lastMessagePreview: 'Hello',
    lastMessageAt: '2026-10-20T12:00:00.000Z',
    lastMessageTimeLabel: '12:00 PM',
    unreadCount: 0,
    participants,
    ...overrides,
  };
}

describe('mobile platform-support', () => {
  it('placeholder thread has no subtitle', () => {
    assert.equal(mudKitchenSupportPlaceholderThread().subtitle, undefined);
  });

  it('legacy support thread title still matches support list thread', () => {
    const legacy = thread('legacy', [{ kind: 'platform_support' }], {
      title: MUDKITCHEN_SUPPORT_LEGACY_TEAM_NAME,
    });
    assert.equal(isMudKitchenSupportListThread(legacy), true);
  });

  it('pins placeholder when no support thread exists', () => {
    const other = thread('other', []);
    const pinned = pinMudKitchenSupportThread([other], null, {
      mode: 'parent',
      guardianId: 'guardian-1',
    });
    assert.equal(pinned[0]?.id, MUDKITCHEN_SUPPORT_PLACEHOLDER_ID);
    assert.equal(pinned[1]?.id, 'other');
  });

  it('keeps support pinned when search does not match', () => {
    const support = mudKitchenSupportPlaceholderThread();
    const other = thread('family-chat', [], {
      title: 'Cecilia Family',
      lastMessagePreview: 'Hello',
    });
    const filtered = filterStoryInboxThreads([support, other], 'cecilia');
    assert.equal(filtered.length, 2);
    assert.equal(filtered[0]?.id, MUDKITCHEN_SUPPORT_PLACEHOLDER_ID);
  });

  it('resolveMudKitchenSupportNavigationThreadId uses existing support thread', () => {
    const support = thread('support-real', [
      { kind: 'platform_support' },
      { kind: 'guardian', guardianId: 'guardian-1' },
    ]);
    const id = resolveMudKitchenSupportNavigationThreadId([support, thread('other', [])], {
      mode: 'parent',
      guardianId: 'guardian-1',
    });
    assert.equal(id, 'support-real');
  });

  it('resolveMudKitchenSupportNavigationThreadId falls back to placeholder', () => {
    const id = resolveMudKitchenSupportNavigationThreadId([thread('other', [])], {
      mode: 'teacher',
      staffMemberId: 'staff-1',
    });
    assert.equal(id, MUDKITCHEN_SUPPORT_PLACEHOLDER_ID);
  });

  it('prepareMobileInboxThreads keeps pin first after sorting rest', () => {
    const support = mudKitchenSupportPlaceholderThread();
    const old = thread('old', [], { lastMessageAt: '2026-01-01T12:00:00.000Z' });
    const newThread = thread('new', [], { lastMessageAt: '2026-10-21T12:00:00.000Z' });
    const listed = prepareMobileInboxThreads(
      [old, newThread],
      { mode: 'teacher', staffMemberId: 'staff-1' },
      '',
    );
    assert.equal(listed[0]?.id, MUDKITCHEN_SUPPORT_PLACEHOLDER_ID);
    assert.equal(listed[1]?.id, 'new');
    assert.equal(listed[2]?.id, 'old');
  });
});
