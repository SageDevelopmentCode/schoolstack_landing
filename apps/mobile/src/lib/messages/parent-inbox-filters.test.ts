import {
  contactKeysWithThreads,
  countUnreadThreads,
  filterThreadsByTab,
  groupContactsByKind,
} from '@/lib/messages/parent-inbox-filters';
import type { MessageContact, MessageThreadSummary } from '@/lib/messages/types';

function thread(id: string, unreadCount: number, overrides: Partial<MessageThreadSummary> = {}) {
  return {
    id,
    subject: null,
    title: id,
    color: '#000',
    lastMessagePreview: null,
    lastMessageAt: null,
    lastMessageTimeLabel: null,
    unreadCount,
    participants: [],
    ...overrides,
  } satisfies MessageThreadSummary;
}

function contact(key: string, kind: MessageContact['kind'], name: string, subtitle?: string) {
  return { key, kind, name, subtitle, color: '#000' } satisfies MessageContact;
}

describe('filterThreadsByTab', () => {
  const threads = [thread('a', 0), thread('b', 2), thread('c', 1)];

  it('keeps everything on All', () => {
    expect(filterThreadsByTab(threads, 'all')).toBe(threads);
  });

  it('keeps only unread threads, in order, on Unread', () => {
    expect(filterThreadsByTab(threads, 'unread').map((t) => t.id)).toEqual(['b', 'c']);
    expect(countUnreadThreads(threads)).toBe(2);
  });
});

describe('groupContactsByKind', () => {
  const contacts = [
    contact('s1', 'staff_member', 'Ms. Rivera', 'Kindergarten'),
    contact('o1', 'school_office', 'Front office'),
    contact('p1', 'platform_support', 'MudKitchen Support'),
    contact('s2', 'staff_member', 'Mr. Chen', 'Art'),
  ];

  it('orders groups office → teachers → families → MudKitchen and drops empty ones', () => {
    const sections = groupContactsByKind(contacts, '');
    expect(sections.map((s) => s.title)).toEqual(['School office', 'Teachers', 'MudKitchen']);
    expect(sections[1].data.map((c) => c.key)).toEqual(['s1', 's2']);
  });

  it('matches name or subtitle, case-insensitively', () => {
    expect(groupContactsByKind(contacts, 'MR. CHEN').flatMap((s) => s.data.map((c) => c.key))).toEqual([
      's2',
    ]);
    expect(groupContactsByKind(contacts, 'kinder').flatMap((s) => s.data.map((c) => c.key))).toEqual([
      's1',
    ]);
    expect(groupContactsByKind(contacts, 'zzqx')).toEqual([]);
  });
});

describe('contactKeysWithThreads', () => {
  it('collects keys for threads that map to a contact', () => {
    const keys = contactKeysWithThreads(
      [
        thread('support', 0, {
          participants: [
            {
              id: 'p',
              kind: 'platform_support',
              familyId: null,
              guardianId: null,
              staffMemberId: null,
            },
          ],
        }),
        thread('empty', 0),
      ],
      'g1',
    );
    expect(keys.size).toBe(1);
  });
});
