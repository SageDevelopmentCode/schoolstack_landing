/**
 * Ensures gallery route modules evaluate without throwing (production Hermes / lazy routes).
 */

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  // Layout animation builders chain (`FadeInDown.delay(40).duration(320).easing(…)`).
  const builder = (): Record<string, unknown> => {
    const chain: Record<string, unknown> = {};
    for (const key of ['delay', 'duration', 'easing', 'springify', 'reduceMotion', 'withInitialValues']) {
      chain[key] = () => chain;
    }
    return chain;
  };
  const identity = (value: unknown) => value;
  const base: Record<string | symbol, unknown> = {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (Component: typeof View) => Component,
    },
    FadeIn: builder(),
    FadeOut: builder(),
    FadeInDown: builder(),
    FadeInUp: builder(),
    LinearTransition: builder(),
    Easing: {
      bezier: () => identity,
      in: identity,
      out: identity,
      inOut: identity,
      cubic: identity,
      quad: identity,
      linear: identity,
    },
    ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
    useReducedMotion: () => false,
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (factory: () => Record<string, unknown>) => factory(),
    useAnimatedScrollHandler: () => () => undefined,
    runOnJS: identity,
    withRepeat: identity,
    withTiming: identity,
    withSpring: identity,
    withDelay: (_delay: number, value: unknown) => value,
    withSequence: (...values: unknown[]) => values[0],
  };
  // Any other layout animation (`FadeOutUp`, `SlideInRight`, …) gets a chainable builder.
  return new Proxy(base, {
    get: (target, key) =>
      key in target ? target[key] : typeof key === 'string' && /^[A-Z]/.test(key) ? builder() : undefined,
  });
});

// Matches TestFlight binaries built before expo-image-manipulator was added.
jest.mock('expo-image-manipulator', () => {
  throw new Error("Cannot find native module 'ExpoImageManipulator'");
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, replace: jest.fn(), push: jest.fn() }),
  useLocalSearchParams: () => ({}),
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
  it('loads the parent Garden photos screen without upload modules', () => {
    expect(() =>
      require('@/components/parent/photos/garden/parent-photos-garden-screen'),
    ).not.toThrow();
    const mod = require('@/components/parent/photos/garden/parent-photos-garden-screen');
    expect(mod.ParentPhotosGardenScreen).toBeDefined();
  });

  it('loads parent photos screen wrapper', () => {
    expect(() => require('@/components/parent/parent-photos-screen')).not.toThrow();
    const mod = require('@/components/parent/parent-photos-screen');
    expect(mod.ParentPhotosScreen).toBeDefined();
  });

  it('loads the teacher Garden photos screen and route', () => {
    expect(() => require('@/components/teacher/photos/garden/teacher-photos-garden-screen')).not.toThrow();
    const mod = require('@/components/teacher/photos/garden/teacher-photos-garden-screen');
    expect(mod.TeacherPhotosGardenScreen).toBeDefined();
    expect(typeof require('@/app/teacher/[slug]/more/photos').default).toBe('function');
  });

  it('loads school admin Garden photos screen', () => {
    expect(() => require('@/components/school-admin/gallery/garden/admin-photos-screen')).not.toThrow();
    const mod = require('@/components/school-admin/gallery/garden/admin-photos-screen');
    expect(mod.PhotosScreen).toBeDefined();
  });

  it('loads school admin Garden upload sheet and shared upload hook', () => {
    expect(() => require('@/components/school-admin/gallery/garden/admin-photo-upload-sheet')).not.toThrow();
    expect(typeof require('@/lib/school-gallery/use-gallery-upload').useGalleryUpload).toBe('function');
  });

  it('loads school admin photos route when expo-image-manipulator native module is missing', () => {
    expect(() => require('@/app/school-admin/[slug]/more/photos')).not.toThrow();
    const mod = require('@/app/school-admin/[slug]/more/photos');
    expect(typeof mod.default).toBe('function');
  });

});
