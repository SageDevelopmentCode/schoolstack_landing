import { act } from 'react';
import TestRenderer from 'react-test-renderer';

import type { Committee } from '@/lib/parent/parent-committees-types';
import { getCommittee } from '@/lib/school-admin/committees/queries';

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

const mockReportError = jest.fn();

const mockNull = () => null;
jest.mock('@/components/parent/committees/garden/sections/workspace-calendar-section', () => ({ WorkspaceCalendarSection: mockNull }));
jest.mock('@/components/parent/committees/garden/sections/workspace-messages-section', () => ({ WorkspaceMessagesSection: mockNull }));
jest.mock('@/components/parent/committees/garden/sections/workspace-resources-section', () => ({ WorkspaceResourcesSection: mockNull }));
jest.mock('@/components/parent/committees/garden/sections/workspace-tasks-section', () => ({ WorkspaceTasksSection: mockNull }));
jest.mock('@/components/parent/committees/garden/projects/workspace-projects-section', () => ({ WorkspaceProjectsSection: mockNull }));
jest.mock('@/components/school-admin/committees/garden/admin-committee-about', () => ({ AdminCommitteeAbout: mockNull }));
jest.mock('@/components/school-admin/committees/garden/admin-committee-home', () => ({
  AdminCommitteeHome: mockNull,
  AdminCommitteeActivitySection: mockNull,
}));
jest.mock('@/components/school-admin/committees/garden/admin-committee-members', () => ({ AdminCommitteeMembers: mockNull }));
jest.mock('@/components/school-admin/committees/garden/admin-committee-settings', () => ({ AdminCommitteeSettings: mockNull }));
jest.mock('@/components/parent/garden/back-header', () => ({ GBackHeader: mockNull }));
jest.mock('@/components/parent/garden/segmented', () => ({ GSegmented: mockNull }));
jest.mock('@/components/parent/garden/sheet', () => ({ GSheet: mockNull }));
jest.mock('@/components/parent/garden/ui', () => ({
  GChip: mockNull,
  GErrorCard: mockNull,
  GLink: mockNull,
  GSkeleton: mockNull,
  gText: { body: {} },
}));
jest.mock('@/components/parent/garden/feedback', () => ({
  useGardenPullRefresh: () => ({ pullRefreshing: false, onPullRefresh: jest.fn() }),
}));
jest.mock('@/components/parent/parent-keyboard-aware-scroll-view', () => {
  const { View } = require('react-native');
  return { ParentKeyboardAwareScrollView: ({ children }: { children: unknown }) => <View>{children as never}</View> };
});
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn(), push: jest.fn() }) }));
jest.mock('@/lib/portal-preview-gating', () => ({ usePortalPreview: () => ({ isPreview: false }) }));
jest.mock('@/lib/haptics', () => ({ haptic: { select: jest.fn() } }));

jest.mock('@/lib/school-admin/committees/queries', () => ({
  getCommittee: jest.fn(),
}));

// Import after jest mocks are registered.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SchoolAdminCommitteeWorkspaceScreen } =
  require('@/components/school-admin/committees/garden/committee-workspace-screen') as typeof import('@/components/school-admin/committees/garden/committee-workspace-screen');

jest.mock('@/lib/use-mobile-error-reporter', () => ({
  useMobileErrorReporter: () => ({
    reportError: mockReportError,
    surface: 'school_admin',
    organizationId: 'org-1',
  }),
}));

jest.mock('@/contexts/school-admin-committees-context', () => ({
  useSchoolAdminCommittees: () => ({
    refresh: jest.fn(),
  }),
}));

jest.mock('@/contexts/parent-theme-context', () => ({
  useParentTheme: () => ({
    primary: '#000',
    muted: '#666',
    ink: '#111',
    alert: '#c00',
    white: '#fff',
    line: '#eee',
  }),
}));

jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({}),
}));

const mockGetCommittee = getCommittee as jest.MockedFunction<typeof getCommittee>;

function stubCommittee(): Committee {
  return {
    id: 'committee-1',
    organizationId: 'org-1',
    templateId: null,
    name: 'Test Committee',
    type: 'annual_volunteer',
    description: 'Desc',
    status: 'active',
    termLabel: '2026–2027',
    termStart: '',
    termEnd: '',
    aboutHtml: '',
    config: { sections: ['home', 'resources'] },
    dutyRoles: [],
    members: [],
    resources: [],
    events: [],
    tasks: [],
    messages: [],
  };
}

describe('SchoolAdminCommitteeWorkspaceScreen', () => {
  beforeEach(() => {
    mockReportError.mockReset();
    mockGetCommittee.mockReset();
    mockGetCommittee.mockResolvedValue(stubCommittee());
  });

  it('loads the committee once when the parent re-renders', async () => {
    let renderer: TestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = TestRenderer.create(
        <SchoolAdminCommitteeWorkspaceScreen
          slug="demo"
          organizationId="org-1"
          committeeId="committee-1"
        />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      renderer?.update(
        <SchoolAdminCommitteeWorkspaceScreen
          slug="demo"
          organizationId="org-1"
          committeeId="committee-1"
        />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockGetCommittee).toHaveBeenCalledTimes(1);
  });
});
