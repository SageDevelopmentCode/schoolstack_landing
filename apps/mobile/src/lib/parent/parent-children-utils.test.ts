import { programPortalChildrenEmptyMessage } from '@/lib/parent/parent-children-utils';

describe('programPortalChildrenEmptyMessage', () => {
  it('uses the portal label in the message', () => {
    expect(programPortalChildrenEmptyMessage('Friday Co-op')).toBe(
      'No learners enrolled in Friday Co-op yet.',
    );
  });

  it('falls back when the label is blank', () => {
    expect(programPortalChildrenEmptyMessage('  ')).toBe(
      'No learners enrolled in this program yet.',
    );
  });
});
