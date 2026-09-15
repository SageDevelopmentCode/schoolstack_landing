import {
  fetchSchoolAdminApi,
  fetchSchoolAdminApiFormData,
} from '@/lib/school-admin-api';
import type {
  BulletinPost,
  ProgramOption,
  SaveBulletinPostInput,
  StagedBulletinFile,
} from '@/lib/school-bulletin/types';

export async function fetchBulletinPosts(slug: string): Promise<{
  posts: BulletinPost[];
  programs: ProgramOption[];
}> {
  const payload = await fetchSchoolAdminApi<{
    posts?: BulletinPost[];
    programs?: ProgramOption[];
  }>(`/api/school/${slug}/bulletin`);
  return {
    posts: payload.posts ?? [],
    programs: payload.programs ?? [],
  };
}

export async function createBulletinPost(
  slug: string,
  input: SaveBulletinPostInput,
): Promise<BulletinPost> {
  const payload = await fetchSchoolAdminApi<{ post?: BulletinPost }>(
    `/api/school/${slug}/bulletin`,
    {
      method: 'POST',
      body: input,
    },
  );
  if (!payload.post) {
    throw new Error('Could not create bulletin post.');
  }
  return payload.post;
}

export async function updateBulletinPost(
  slug: string,
  postId: string,
  input: Partial<SaveBulletinPostInput>,
): Promise<BulletinPost> {
  const payload = await fetchSchoolAdminApi<{ post?: BulletinPost }>(
    `/api/school/${slug}/bulletin/${postId}`,
    {
      method: 'PATCH',
      body: input,
    },
  );
  if (!payload.post) {
    throw new Error('Could not update bulletin post.');
  }
  return payload.post;
}

export async function deleteBulletinPost(slug: string, postId: string): Promise<void> {
  await fetchSchoolAdminApi(`/api/school/${slug}/bulletin/${postId}`, {
    method: 'DELETE',
  });
}

export async function uploadBulletinAttachments(
  slug: string,
  postId: string,
  files: StagedBulletinFile[],
): Promise<BulletinPost> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);
  }

  const payload = await fetchSchoolAdminApiFormData<{ post?: BulletinPost }>(
    `/api/school/${slug}/bulletin/${postId}/attachments`,
    formData,
  );
  if (!payload.post) {
    throw new Error('Could not upload attachments.');
  }
  return payload.post;
}

export async function removeBulletinAttachment(
  slug: string,
  postId: string,
  attachmentId: string,
): Promise<BulletinPost> {
  const payload = await fetchSchoolAdminApi<{ post?: BulletinPost }>(
    `/api/school/${slug}/bulletin/${postId}/attachments?attachmentId=${encodeURIComponent(attachmentId)}`,
    { method: 'DELETE' },
  );
  if (!payload.post) {
    throw new Error('Could not remove attachment.');
  }
  return payload.post;
}

export function formatBulletinApiError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}
