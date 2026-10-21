import {
  isSchoolAdminPhotosEnabled,
  parseSchoolAdminFeatures,
} from '@/lib/school-admin/school-admin-features';

describe('parseSchoolAdminFeatures', () => {
  it('defaults admin.photos to true when omitted in stored settings', () => {
    const features = parseSchoolAdminFeatures({
      admin: {
        bulletin: true,
        finances: true,
      },
    });

    expect(features.admin?.photos).toBe(true);
    expect(isSchoolAdminPhotosEnabled(features)).toBe(true);
  });

  it('respects explicit admin.photos false', () => {
    const features = parseSchoolAdminFeatures({
      admin: { photos: false },
    });

    expect(isSchoolAdminPhotosEnabled(features)).toBe(false);
  });
});
