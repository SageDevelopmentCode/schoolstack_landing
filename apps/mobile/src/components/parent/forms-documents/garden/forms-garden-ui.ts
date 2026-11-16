import type { GChipTone } from '@/components/parent/garden/tokens';
import type {
  ParentFormDetail,
  ParentFormListItem,
} from '@/lib/parent/parent-forms-documents-types';
import {
  formatFormDueDate,
  formatFormSignedDate,
} from '@/lib/parent/parent-forms-documents-utils';

/** Overdue text on cream/paper (same as the Home forms notebook). */
export const OVERDUE_INK = '#7E4533';

type FormStatusSource = {
  listStatus?: ParentFormListItem['listStatus'];
  response: ParentFormListItem['response'];
};

/** List / detail status → chip (same mapping the web Garden page uses). */
export function formStatusChip(item: FormStatusSource): { tone: GChipTone; label: string } {
  const signed = item.listStatus ? item.listStatus === 'signed' : item.response.status === 'signed';
  if (signed) return { tone: 'success', label: 'Signed' };
  if (item.response.status === 'overdue') return { tone: 'alert', label: 'Overdue' };
  return { tone: 'warning', label: 'Needs action' };
}

/** One meta line: "Due Nov 20, 2026" / "Signed on Nov 3, 2026". */
export function formDateLine(item: ParentFormListItem | ParentFormDetail): string | null {
  if (item.response.status === 'signed') {
    return item.response.signedAt
      ? `Signed on ${formatFormSignedDate(item.response.signedAt)}`
      : null;
  }
  return item.form.dueDate ? `Due ${formatFormDueDate(item.form.dueDate)}` : null;
}

/** "Ava", "Ava and Leo", "Ava, Leo and Mia". */
export function joinStudentNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Forms still waiting on the family: overdue first, then soonest due, undated last. */
export function sortFormQueue(items: ParentFormListItem[]): ParentFormListItem[] {
  return items
    .filter((item) => item.listStatus === 'needs_action')
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aOver = a.item.response.status === 'overdue' ? 0 : 1;
      const bOver = b.item.response.status === 'overdue' ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      const aDue = a.item.form.dueDate ?? '9999-12-31';
      const bDue = b.item.form.dueDate ?? '9999-12-31';
      if (aDue !== bDue) return aDue < bDue ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}

/** "1 form" / "3 forms". */
export function formsCount(n: number): string {
  return `${n} form${n === 1 ? '' : 's'}`;
}
