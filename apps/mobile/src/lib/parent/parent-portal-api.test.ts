import { fetchWithAuth } from '@/lib/auth/auth-session';
import {
  fetchParentApi,
  ParentPortalApiError,
} from '@/lib/parent/parent-portal-api';

jest.mock('@/lib/auth/auth-session', () => ({
  fetchWithAuth: jest.fn(),
  getApiAuthHeaders: jest.fn(),
  throwUnauthorized: jest.fn(),
}));

jest.mock('@/lib/platform-admin/preview-session-store', () => ({
  assertPreviewWriteAllowed: jest.fn(),
  isPreviewSessionActive: jest.fn(() => false),
}));

jest.mock('@/lib/platform-admin/mobile-preview-api', () => ({
  fetchMobilePreviewApi: jest.fn(),
  resolveParentPreviewPath: jest.fn(() => null),
}));

describe('fetchParentApi', () => {
  beforeEach(() => {
    jest.mocked(fetchWithAuth).mockReset();
  });

  it('throws ParentPortalApiError with status and code on 403', async () => {
    jest.mocked(fetchWithAuth).mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        error: 'Friday Branch signup is paused.',
        code: 'friday_branch_paused',
      }),
    } as Response);

    await expect(fetchParentApi('/api/parent-portal/friday-branch/schedule')).rejects.toMatchObject({
      name: 'ParentPortalApiError',
      message: 'Friday Branch signup is paused.',
      status: 403,
      code: 'friday_branch_paused',
    });

    await expect(fetchParentApi('/api/parent-portal/friday-branch/schedule')).rejects.toBeInstanceOf(
      ParentPortalApiError,
    );
  });
});
