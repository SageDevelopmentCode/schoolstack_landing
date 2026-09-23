import {
  getParentFeatureRoute,
  parentBillingAgreementsRoute,
  parentFormDetailRoute,
  parentFridayBranchRoute,
  resolveParentAttentionNavigation,
} from '@/lib/parent/parent-nav';

const slug = 'rooted-meadows';

describe('parentBillingAgreementsRoute', () => {
  it('builds billing agreements tab route without form id', () => {
    expect(parentBillingAgreementsRoute(slug)).toBe('/parent/rooted-meadows/billing?tab=agreements');
  });

  it('builds billing agreements tab route with form id', () => {
    expect(parentBillingAgreementsRoute(slug, 'form-123')).toBe(
      '/parent/rooted-meadows/billing?tab=agreements&form=form-123',
    );
  });
});

describe('parentFridayBranchRoute', () => {
  it('builds the Friday Branch more menu route', () => {
    expect(parentFridayBranchRoute(slug)).toBe('/parent/rooted-meadows/more/friday-branch');
  });
});

describe('getParentFeatureRoute', () => {
  it('maps friday_branch feature key to the mobile route', () => {
    expect(getParentFeatureRoute(slug, 'friday_branch')).toBe(
      '/parent/rooted-meadows/more/friday-branch',
    );
  });
});

describe('resolveParentAttentionNavigation', () => {
  it('routes tuition agreement attention with formId to billing agreements', () => {
    expect(
      resolveParentAttentionNavigation(slug, {
        formId: 'agreement-1',
        href: '/school/rooted-meadows/parent/billing?tab=agreements&form=agreement-1',
      }),
    ).toBe(parentBillingAgreementsRoute(slug, 'agreement-1'));
  });

  it('routes general form attention with formId to form detail', () => {
    expect(
      resolveParentAttentionNavigation(slug, {
        formId: 'form-1',
        href: '/school/rooted-meadows/parent/forms_documents?form=form-1',
      }),
    ).toBe(parentFormDetailRoute(slug, 'form-1'));
  });

  it('routes tuition agreement href with embedded form param', () => {
    expect(
      resolveParentAttentionNavigation(slug, {
        href: '/school/rooted-meadows/parent/billing?tab=agreements&form=agreement-2',
      }),
    ).toBe(parentBillingAgreementsRoute(slug, 'agreement-2'));
  });

  it('routes tuition agreement href without form param to agreements tab', () => {
    expect(
      resolveParentAttentionNavigation(slug, {
        href: '/school/rooted-meadows/parent/billing?tab=agreements',
      }),
    ).toBe(parentBillingAgreementsRoute(slug));
  });
});
