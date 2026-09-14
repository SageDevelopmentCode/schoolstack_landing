import type { MessageContact } from '@/lib/messages/types';

export type MessageContactAudienceFilter = 'all' | 'parents' | 'staff';

function matchesContactSearch(contact: MessageContact, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [contact.name, contact.subtitle ?? ''].join(' ').toLowerCase().includes(normalized);
}

export function countContactsByAudience(
  contacts: MessageContact[],
): Record<MessageContactAudienceFilter, number> {
  let parents = 0;
  let staff = 0;

  for (const contact of contacts) {
    if (contact.kind === 'guardian') parents += 1;
    if (contact.kind === 'staff_member') staff += 1;
  }

  return {
    all: contacts.length,
    parents,
    staff,
  };
}

export function filterContactsByAudience(
  contacts: MessageContact[],
  audience: MessageContactAudienceFilter,
): MessageContact[] {
  if (audience === 'all') return contacts;
  if (audience === 'parents') {
    return contacts.filter((contact) => contact.kind === 'guardian');
  }
  return contacts.filter((contact) => contact.kind === 'staff_member');
}

export function filterContactsForPicker(
  contacts: MessageContact[],
  audience: MessageContactAudienceFilter,
  searchQuery: string,
): MessageContact[] {
  return filterContactsByAudience(contacts, audience).filter((contact) =>
    matchesContactSearch(contact, searchQuery),
  );
}

export function getContactPickerEmptyMessage(
  audience: MessageContactAudienceFilter,
  hasSearchQuery: boolean,
): string {
  if (hasSearchQuery) return 'No contacts match this filter';
  if (audience === 'parents') return 'No parents available';
  if (audience === 'staff') return 'No staff available';
  return 'No contacts found.';
}
