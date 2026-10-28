import { act } from 'react';
import TestRenderer from 'react-test-renderer';

import type { Committee } from '@/lib/parent/parent-committees-types';
import { getCommittee } from '@/lib/school-admin/committees/queries';

const mockReportError = jest.fn();

jest.mock('@/components/parent/committees/sections/parent-committee-calendar-section', () => ({
  ParentCommitteeCalendarSection: () => null,
}));
jest.mock('@/components/parent/committees/sections/parent-committee-messages-section', () => ({
  ParentCommitteeMessagesSection: () => null,
}));
jest.mock('@/components/parent/committees/sections/parent-committee-resources-section', () => ({
  ParentCommitteeResourcesSection: () => null,
}));
jest.mock('@/components/parent/committees/sections/parent-committee-tasks-section', () => ({
  ParentCommitteeTasksSection: () => null,
}));
jest.mock('@/components/school-admin/committees/school-admin-committee-about-section', () => ({
  SchoolAdminCommitteeAboutSection: () => null,
}));
jest.mock('@/components/school-admin/committees/school-admin-committee-activity-section', () => ({
  SchoolAdminCommitteeActivitySection: () => null,
}));
jest.mock('@/components/school-admin/committees/school-admin-committee-home-section', () => ({
  SchoolAdminCommitteeHomeSection: () => null,
}));
jest.mock('@/components/school-admin/committees/school-admin-committee-members-section', () => ({
  SchoolAdminCommitteeMembersSection: () => null,
}));
jest.mock('@/components/school-admin/committees/school-admin-committee-settings-section', () => ({
  SchoolAdminCommitteeSettingsSection: () => null,
}));
jest.mock('@/components/school-admin/committees/school-admin-committee-workspace-header', () => ({
  SchoolAdminCommitteeWorkspaceHeader: () => null,
}));
jest.mock('@/components/story/story-button', () => {
  const { Text: RNText } = require('react-native');
  return {
    StoryButton: ({ label }: { label: string }) => <RNText>{label}</RNText>,
  };
});

jest.mock('@/lib/school-admin/committees/queries', () => ({
  getCommittee: jest.fn(),
}));

// Import after jest mocks are registered.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SchoolAdminCommitteeWorkspaceScreen } =
  require('@/components/school-admin/committees/school-admin-committee-workspace-screen') as typeof import('@/components/school-admin/committees/school-admin-committee-workspace-screen');

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
