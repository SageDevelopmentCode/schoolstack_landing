import { organizationSelectorEmptyMessage } from '@/components/organization-selector-empty-message';

describe('organizationSelectorEmptyMessage', () => {
  it('shows catalog copy when accessibleSlugs is null', () => {
    expect(organizationSelectorEmptyMessage(null)).toContain('No schools are available');
  });

  it('shows no-access copy when slug list is empty', () => {
    expect(organizationSelectorEmptyMessage([])).toContain('do not have access');
  });

  it('shows load-failure copy when slugs exist but organizations did not load', () => {
    expect(organizationSelectorEmptyMessage(['rooted-meadows-demo'])).toContain(
      "Couldn't load your schools",
    );
  });
});
