import {
  buildParentCoopCurriculumPdfApiPath,
  resolveParentPortalPdfDownloadUrl,
} from '@/lib/pdf/build-parent-portal-pdf-request';

describe('buildParentCoopCurriculumPdfApiPath', () => {
  it('builds curriculum pdf query path', () => {
    expect(
      buildParentCoopCurriculumPdfApiPath('org-1', 'prog-1', 'curr-1'),
    ).toBe('/api/parent-portal/curriculum/pdf?organizationId=org-1&programId=prog-1&curriculumId=curr-1');
  });
});

describe('resolveParentPortalPdfDownloadUrl', () => {
  it('prefixes site URL for live path', () => {
    const apiPath = buildParentCoopCurriculumPdfApiPath('org', 'prog', 'curr');
    const { requestPath, downloadUrl } = resolveParentPortalPdfDownloadUrl(apiPath);
    expect(requestPath).toBe(apiPath);
    expect(downloadUrl).toContain('/api/parent-portal/curriculum/pdf?');
  });
});
