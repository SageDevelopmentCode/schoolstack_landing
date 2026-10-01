import {
  buildParentActivityNotificationContext,
  buildParentActivityNotificationSearchParams,
} from '@/lib/parent/fetch-activity-notifications';

describe('buildParentActivityNotificationSearchParams', () => {
  it('builds main portal params by default', () => {
    const params = buildParentActivityNotificationSearchParams('org-1', 'mud-school', {
      limit: 20,
    });

    expect(params.get('organizationId')).toBe('org-1');
    expect(params.get('slug')).toBe('mud-school');
    expect(params.get('mode')).toBe('main');
    expect(params.get('limit')).toBe('20');
    expect(params.get('parentNavBasePath')).toBe('/school/mud-school/parent');
    expect(params.get('applyBasePath')).toBe('/school/mud-school/apply');
    expect(params.get('programSlug')).toBeNull();
  });

  it('builds program portal params when context is program', () => {
    const params = buildParentActivityNotificationSearchParams('org-1', 'mud-school', {
      notificationContext: {
        mode: 'program',
        programId: 'prog-1',
        programSlug: 'kindergarten-co-op',
        coopModeEnabled: true,
        parentNavBasePath: '/school/mud-school/parent/p/kindergarten-co-op',
        applyBasePath: '/school/mud-school/apply',
      },
    });

    expect(params.get('mode')).toBe('program');
    expect(params.get('programId')).toBe('prog-1');
    expect(params.get('programSlug')).toBe('kindergarten-co-op');
    expect(params.get('coopModeEnabled')).toBe('true');
    expect(params.get('parentNavBasePath')).toBe(
      '/school/mud-school/parent/p/kindergarten-co-op',
    );
  });
});

describe('buildParentActivityNotificationContext', () => {
  it('returns main context without program fields', () => {
    const context = buildParentActivityNotificationContext({ slug: 'mud-school' });
    expect(context).toEqual({
      mode: 'main',
      parentNavBasePath: '/school/mud-school/parent',
      applyBasePath: '/school/mud-school/apply',
    });
  });

  it('returns program context when program ids are present', () => {
    const context = buildParentActivityNotificationContext({
      slug: 'mud-school',
      programSlug: 'co-op',
      programId: 'prog-9',
      coopModeEnabled: false,
    });
    expect(context).toMatchObject({
      mode: 'program',
      programSlug: 'co-op',
      programId: 'prog-9',
      coopModeEnabled: false,
    });
  });
});
