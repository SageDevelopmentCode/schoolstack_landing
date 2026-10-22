import {
  cacheDirectory,
  deleteAsync,
  downloadAsync,
} from 'expo-file-system/legacy';

import {
  buildParentCoopCurriculumPdfApiPath,
  getParentPortalPdfDownloadHeaders,
  resolveParentPortalPdfDownloadUrl,
} from '@/lib/pdf/build-parent-portal-pdf-request';

function curriculumCacheFileUri(curriculumId: string): string {
  const safeId = curriculumId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const base = cacheDirectory ?? '';
  return `${base}parent-coop-curriculum-${safeId}.pdf`;
}

export async function cacheParentCoopCurriculumPdf(input: {
  organizationId: string;
  programId: string;
  curriculumId: string;
}): Promise<string> {
  const apiPath = buildParentCoopCurriculumPdfApiPath(
    input.organizationId,
    input.programId,
    input.curriculumId,
  );
  const { downloadUrl } = resolveParentPortalPdfDownloadUrl(apiPath);
  const cachePath = curriculumCacheFileUri(input.curriculumId);
  const headers = await getParentPortalPdfDownloadHeaders(apiPath);

  await deleteAsync(cachePath, { idempotent: true });

  const result = await downloadAsync(downloadUrl, cachePath, { headers });
  if (result.status < 200 || result.status >= 300) {
    await deleteAsync(cachePath, { idempotent: true });
    throw new Error('Failed to load curriculum PDF.');
  }

  return result.uri;
}
