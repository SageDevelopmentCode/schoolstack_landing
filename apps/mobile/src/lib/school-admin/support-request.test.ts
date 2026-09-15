import { fetchSchoolAdminApiFormData } from '@/lib/school-admin-api';
import { submitAdminSupportRequest } from '@/lib/school-admin/support-request';

jest.mock('@/lib/school-admin-api', () => ({
  fetchSchoolAdminApiFormData: jest.fn(),
}));

describe('submitAdminSupportRequest', () => {
  const fetchMock = fetchSchoolAdminApiFormData as jest.MockedFunction<
    typeof fetchSchoolAdminApiFormData
  >;

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({});
  });

  it('builds FormData with required fields and attachments', async () => {
    await submitAdminSupportRequest({
      organizationId: 'org-1',
      topic: 'bug',
      description: 'The admissions tab is blank.',
      sourcePagePath: '/school-admin/rooted-meadows/dashboard',
      attachments: [
        {
          uri: 'file:///tmp/screenshot.png',
          name: 'screenshot.png',
          mimeType: 'image/png',
          size: 1024,
        },
      ],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [path, formData] = fetchMock.mock.calls[0];
    expect(path).toBe('/api/school-admin/support-requests');
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('organizationId')).toBe('org-1');
    expect(formData.get('topic')).toBe('bug');
    expect(formData.get('description')).toBe('The admissions tab is blank.');
    expect(formData.get('sourcePagePath')).toBe('/school-admin/rooted-meadows/dashboard');
    expect(formData.getAll('attachments')).toHaveLength(1);
  });

  it('omits sourcePagePath when not provided', async () => {
    await submitAdminSupportRequest({
      organizationId: 'org-1',
      topic: 'general',
      description: 'Need help with setup.',
    });

    const [, formData] = fetchMock.mock.calls[0];
    expect(formData.get('sourcePagePath')).toBeNull();
    expect(formData.getAll('attachments')).toHaveLength(0);
  });
});
