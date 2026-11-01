/**
 * Ensures gallery route modules evaluate without throwing (production Hermes / lazy routes).
 */

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (Component: typeof View) => Component,
    },
    FadeInDown: { duration: () => ({}) },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (factory: () => Record<string, unknown>) => factory(),
    withRepeat: (value: unknown) => value,
    withTiming: (value: unknown) => value,
    withSpring: (value: unknown) => value,
  };
});

// Matches TestFlight binaries built before expo-image-manipulator was added.
jest.mock('expo-image-manipulator', () => {
  throw new Error("Cannot find native module 'ExpoImageManipulator'");
});

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const cleanup = callback();
    return cleanup;
  },
}));

jest.mock('@/contexts/parent-theme-context', () => ({
  useParentTheme: () => ({
    ink: '#000',
    muted: '#666',
    white: '#fff',
    line: '#ddd',
    primary: '#000',
    primarySoft: '#eee',
  }),
}));

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    portalType: 'parent',
    selectedSchool: { id: 'org-1', slug: 'demo' },
  }),
}));

describe('gallery photos module imports', () => {
  it('loads parent read-only gallery screen', () => {
    expect(() => require('@/components/gallery/gallery-photos-readonly-screen')).not.toThrow();
    const mod = require('@/components/gallery/gallery-photos-readonly-screen');
    expect(mod.GalleryPhotosReadonlyScreen).toBeDefined();
  });

  it('loads admin gallery photos screen', () => {
    expect(() => require('@/components/gallery/gallery-photos-screen')).not.toThrow();
    const mod = require('@/components/gallery/gallery-photos-screen');
    expect(mod.GalleryPhotosScreen).toBeDefined();
  });

  it('loads parent photos screen wrapper', () => {
    expect(() => require('@/components/parent/parent-photos-screen')).not.toThrow();
    const mod = require('@/components/parent/parent-photos-screen');
    expect(mod.ParentPhotosScreen).toBeDefined();
  });

  it('loads teacher photos screen wrapper', () => {
    expect(() => require('@/components/teacher/teacher-photos-screen')).not.toThrow();
    const mod = require('@/components/teacher/teacher-photos-screen');
    expect(mod.TeacherPhotosScreen).toBeDefined();
  });

  it('loads school admin photos screen wrapper', () => {
    expect(() => require('@/components/school-admin/gallery/photos-screen')).not.toThrow();
    const mod = require('@/components/school-admin/gallery/photos-screen');
    expect(mod.PhotosScreen).toBeDefined();
  });

  it('loads school admin photos route when expo-image-manipulator native module is missing', () => {
    expect(() => require('@/app/school-admin/[slug]/more/photos')).not.toThrow();
    const mod = require('@/app/school-admin/[slug]/more/photos');
    expect(typeof mod.default).toBe('function');
  });

  it('loads photos list skeleton', () => {
    expect(() => require('@/components/school-admin/gallery/photos-list-skeleton')).not.toThrow();
    const mod = require('@/components/school-admin/gallery/photos-list-skeleton');
    expect(typeof mod.PhotosListSkeleton).toBe('function');
  });

  it('loads gallery upload sheet', () => {
    expect(() => require('@/components/school-admin/gallery/gallery-upload-sheet')).not.toThrow();
    const mod = require('@/components/school-admin/gallery/gallery-upload-sheet');
    expect(typeof mod.GalleryUploadSheet).toBe('function');
  });

  it('loads gallery edit date modal', () => {
    expect(() => require('@/components/school-admin/gallery/gallery-edit-date-modal')).not.toThrow();
    const mod = require('@/components/school-admin/gallery/gallery-edit-date-modal');
    expect(typeof mod.GalleryEditDateModal).toBe('function');
  });
});
