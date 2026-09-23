import {
  isAdminNavPathEnabled,
  isSchoolAdminFridayBranchEnabled,
  parseSchoolAdminFeatures,
} from '@/lib/school-admin/school-admin-features';

describe('school-admin-features', () => {
  it('parses admin features and feature_nav children', () => {
    const features = parseSchoolAdminFeatures({
      admin: { my_school: true },
      feature_nav: {
        admin: {
          items: {
            my_school: {
              children: [{ key: 'friday_branch', enabled: true }],
            },
          },
        },
      },
    });

    expect(features.admin?.my_school).toBe(true);
    expect(isSchoolAdminFridayBranchEnabled(features)).toBe(true);
  });

  it('defaults friday_branch to disabled without explicit enablement', () => {
    const features = parseSchoolAdminFeatures({
      admin: { my_school: true },
    });

    expect(isSchoolAdminFridayBranchEnabled(features)).toBe(false);
  });

  it('requires my_school admin feature', () => {
    const features = parseSchoolAdminFeatures({
      admin: { my_school: false },
      feature_nav: {
        admin: {
          items: {
            my_school: {
              children: [{ key: 'friday_branch', enabled: true }],
            },
          },
        },
      },
    });

    expect(isAdminNavPathEnabled(features, 'my_school', 'friday_branch')).toBe(false);
  });
});
