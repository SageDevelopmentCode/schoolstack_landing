import {
  buildCommitteeMessagesPath,
  postCommitteeMessageViaPortalApi,
  resolveCommitteeMessagesPortalNamespace,
} from '@/lib/committees/post-committee-message-via-portal';
import { fetchParentApiFormData } from '@/lib/parent/parent-portal-api';
import { fetchSchoolAdminApiFormData } from '@/lib/school-admin-api';
import { fetchTeacherApiFormData } from '@/lib/teacher/teacher-portal-api';

jest.mock('@/lib/parent/parent-portal-api', () => ({
  fetchParentApiFormData: jest.fn(),
}));

jest.mock('@/lib/school-admin-api', () => ({
  fetchSchoolAdminApiFormData: jest.fn(),
}));

jest.mock('@/lib/teacher/teacher-portal-api', () => ({
  fetchTeacherApiFormData: jest.fn(),
}));

describe('resolveCommitteeMessagesPortalNamespace', () => {
  it('uses school-admin when isAdmin is true', () => {
    expect(resolveCommitteeMessagesPortalNamespace('parent-portal', true)).toBe('school-admin');
    expect(resolveCommitteeMessagesPortalNamespace('teacher-portal', true)).toBe('school-admin');
  });

  it('keeps namespace when isAdmin is false', () => {
    expect(resolveCommitteeMessagesPortalNamespace('teacher-portal', false)).toBe('teacher-portal');
  });
});

describe('buildCommitteeMessagesPath', () => {
  it('builds parent portal path', () => {
    expect(buildCommitteeMessagesPath('parent-portal', 'committee-1')).toBe(
      '/api/parent-portal/committees/committee-1/messages',
    );
  });

  it('builds teacher portal path', () => {
    expect(buildCommitteeMessagesPath('teacher-portal', 'committee-2')).toBe(
      '/api/teacher-portal/committees/committee-2/messages',
    );
  });

  it('builds school admin path', () => {
    expect(buildCommitteeMessagesPath('school-admin', 'committee-3')).toBe(
      '/api/school-admin/committees/committee-3/messages',
    );
  });
});

describe('postCommitteeMessageViaPortalApi', () => {
  const parentFormMock = fetchParentApiFormData as jest.MockedFunction<typeof fetchParentApiFormData>;
  const teacherFormMock = fetchTeacherApiFormData as jest.MockedFunction<typeof fetchTeacherApiFormData>;
  const adminFormMock = fetchSchoolAdminApiFormData as jest.MockedFunction<
    typeof fetchSchoolAdminApiFormData
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    parentFormMock.mockResolvedValue({ message: { id: 'msg-parent' } });
    teacherFormMock.mockResolvedValue({ message: { id: 'msg-teacher' } });
    adminFormMock.mockResolvedValue({ message: { id: 'msg-admin' } });
  });

  it('calls parent API for parent portal', async () => {
    const result = await postCommitteeMessageViaPortalApi('committee-1', {
      organizationId: 'org-1',
      body: 'Hello',
      portalApiNamespace: 'parent-portal',
    });

    expect(result.messageId).toBe('msg-parent');
    expect(parentFormMock).toHaveBeenCalledWith(
      '/api/parent-portal/committees/committee-1/messages',
      expect.any(FormData),
    );
    expect(teacherFormMock).not.toHaveBeenCalled();
    expect(adminFormMock).not.toHaveBeenCalled();
  });

  it('calls teacher API for teacher portal', async () => {
    const result = await postCommitteeMessageViaPortalApi('committee-2', {
      organizationId: 'org-1',
      body: 'Hello',
      portalApiNamespace: 'teacher-portal',
    });

    expect(result.messageId).toBe('msg-teacher');
    expect(teacherFormMock).toHaveBeenCalledWith(
      '/api/teacher-portal/committees/committee-2/messages',
      expect.any(FormData),
    );
    expect(parentFormMock).not.toHaveBeenCalled();
    expect(adminFormMock).not.toHaveBeenCalled();
  });

  it('calls school admin API when isAdmin is true', async () => {
    const result = await postCommitteeMessageViaPortalApi('committee-3', {
      organizationId: 'org-1',
      body: 'Hello',
      portalApiNamespace: 'teacher-portal',
      isAdmin: true,
    });

    expect(result.messageId).toBe('msg-admin');
    expect(adminFormMock).toHaveBeenCalledWith(
      '/api/school-admin/committees/committee-3/messages',
      expect.any(FormData),
    );
    expect(teacherFormMock).not.toHaveBeenCalled();
    expect(parentFormMock).not.toHaveBeenCalled();
  });
});
