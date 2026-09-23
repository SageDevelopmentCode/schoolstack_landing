import {
  buildCommitteeTaskNotifyAssignmentPath,
  notifyCommitteeTaskAssignment,
} from '@/lib/committees/notify-committee-task-assignment';
import { fetchParentApi } from '@/lib/parent/parent-portal-api';
import { fetchSchoolAdminApi } from '@/lib/school-admin-api';
import { fetchTeacherApi } from '@/lib/teacher/teacher-portal-api';

jest.mock('@/lib/parent/parent-portal-api', () => ({
  fetchParentApi: jest.fn(),
}));

jest.mock('@/lib/school-admin-api', () => ({
  fetchSchoolAdminApi: jest.fn(),
}));

jest.mock('@/lib/teacher/teacher-portal-api', () => ({
  fetchTeacherApi: jest.fn(),
}));

describe('buildCommitteeTaskNotifyAssignmentPath', () => {
  it('builds parent portal path', () => {
    expect(buildCommitteeTaskNotifyAssignmentPath('parent-portal', 'task-1')).toBe(
      '/api/parent-portal/committees/tasks/task-1/notify-assignment',
    );
  });

  it('builds teacher portal path', () => {
    expect(buildCommitteeTaskNotifyAssignmentPath('teacher-portal', 'task-2')).toBe(
      '/api/teacher-portal/committees/tasks/task-2/notify-assignment',
    );
  });

  it('builds school admin path', () => {
    expect(buildCommitteeTaskNotifyAssignmentPath('school-admin', 'task-3')).toBe(
      '/api/school-admin/committees/tasks/task-3/notify-assignment',
    );
  });
});

describe('notifyCommitteeTaskAssignment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls parent API for parent portal', async () => {
    await notifyCommitteeTaskAssignment({
      portalApiNamespace: 'parent-portal',
      taskId: 'task-1',
      organizationId: 'org-1',
      previousAssigneeMemberId: null,
    });

    expect(fetchParentApi).toHaveBeenCalledWith(
      '/api/parent-portal/committees/tasks/task-1/notify-assignment',
      {
        method: 'POST',
        body: {
          organizationId: 'org-1',
          previousAssigneeMemberId: null,
        },
      },
    );
  });

  it('calls teacher API for teacher portal', async () => {
    await notifyCommitteeTaskAssignment({
      portalApiNamespace: 'teacher-portal',
      taskId: 'task-2',
      organizationId: 'org-1',
      previousAssigneeMemberId: 'member-a',
    });

    expect(fetchTeacherApi).toHaveBeenCalledWith(
      '/api/teacher-portal/committees/tasks/task-2/notify-assignment',
      {
        method: 'POST',
        body: {
          organizationId: 'org-1',
          previousAssigneeMemberId: 'member-a',
        },
      },
    );
  });

  it('calls school admin API for school admin portal', async () => {
    await notifyCommitteeTaskAssignment({
      portalApiNamespace: 'school-admin',
      taskId: 'task-3',
      organizationId: 'org-1',
    });

    expect(fetchSchoolAdminApi).toHaveBeenCalledWith(
      '/api/school-admin/committees/tasks/task-3/notify-assignment',
      {
        method: 'POST',
        body: {
          organizationId: 'org-1',
          previousAssigneeMemberId: null,
        },
      },
    );
  });
});
