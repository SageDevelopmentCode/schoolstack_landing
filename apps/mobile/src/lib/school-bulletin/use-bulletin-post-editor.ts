import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import {
  audiencesIncludeProgramTargeting,
  fromDateTimeLocalValue,
  normalizeBulletinAudiences,
  programSelectionRequired,
  toDateTimeLocalValue,
  toggleAudienceSelection,
  toggleProgramSelection,
} from '@/lib/school-bulletin/bulletin-audience';
import {
  createBulletinPost,
  deleteBulletinPost,
  removeBulletinAttachment,
  updateBulletinPost,
  uploadBulletinAttachments,
} from '@/lib/school-bulletin/bulletin-api';
import { MAX_BULLETIN_ATTACHMENTS } from '@/lib/school-bulletin/constants';
import type {
  BulletinAudience,
  BulletinPost,
  BulletinPostStatus,
  ProgramOption,
  SaveBulletinPostInput,
  StagedBulletinFile,
} from '@/lib/school-bulletin/types';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type UseBulletinPostEditorOptions = {
  slug: string;
  post: BulletinPost | null;
  programs: ProgramOption[];
  onSaved: (post: BulletinPost) => void;
  onDeleted?: () => void;
};

function buildSavePayload(
  title: string,
  body: string,
  audiences: BulletinAudience[],
  programIds: string[],
  showProgramPicker: boolean,
  status: BulletinPostStatus,
  publishedAt: string,
  expiresAt: string,
): SaveBulletinPostInput {
  return {
    title,
    body,
    audiences: normalizeBulletinAudiences(audiences),
    programIds: showProgramPicker ? programIds : [],
    status,
    publishedAt: fromDateTimeLocalValue(publishedAt),
    expiresAt: fromDateTimeLocalValue(expiresAt),
  };
}

export function useBulletinPostEditor({
  slug,
  post,
  programs: _programs,
  onSaved,
  onDeleted,
}: UseBulletinPostEditorOptions) {
  const { reportError } = useMobileErrorReporter();
  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [audiences, setAudiences] = useState<BulletinAudience[]>(
    post?.audiences?.length ? post.audiences : ['school_wide'],
  );
  const [programIds, setProgramIds] = useState<string[]>(post?.programIds ?? []);
  const [publishedAt, setPublishedAt] = useState(toDateTimeLocalValue(post?.publishedAt));
  const [expiresAt, setExpiresAt] = useState(toDateTimeLocalValue(post?.expiresAt));
  const [publishScheduleEnabled, setPublishScheduleEnabled] = useState(() =>
    Boolean(toDateTimeLocalValue(post?.publishedAt)),
  );
  const [expiryEnabled, setExpiryEnabled] = useState(() =>
    Boolean(toDateTimeLocalValue(post?.expiresAt)),
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingAttachmentId, setRemovingAttachmentId] = useState<string | null>(null);
  const [draftPost, setDraftPost] = useState<BulletinPost | null>(post);
  const postSyncKey = post ? `${post.id}:${post.updatedAt ?? ''}` : 'new';
  const [prevPostSyncKey, setPrevPostSyncKey] = useState(postSyncKey);

  if (postSyncKey !== prevPostSyncKey) {
    setPrevPostSyncKey(postSyncKey);
    setTitle(post?.title ?? '');
    setBody(post?.body ?? '');
    setAudiences(post?.audiences?.length ? post.audiences : ['school_wide']);
    setProgramIds(post?.programIds ?? []);
    const nextPublishedAt = toDateTimeLocalValue(post?.publishedAt);
    const nextExpiresAt = toDateTimeLocalValue(post?.expiresAt);
    setPublishedAt(nextPublishedAt);
    setExpiresAt(nextExpiresAt);
    setPublishScheduleEnabled(Boolean(nextPublishedAt));
    setExpiryEnabled(Boolean(nextExpiresAt));
    setDraftPost(post);
  }

  const activePost = draftPost ?? post;
  const normalizedAudiences = normalizeBulletinAudiences(audiences);
  const showProgramPicker = audiencesIncludeProgramTargeting(normalizedAudiences);
  const programRequired = programSelectionRequired(normalizedAudiences);
  const editingExisting = Boolean(activePost);

  const toggleAudience = useCallback((audience: BulletinAudience) => {
    setAudiences((current) => {
      const next = toggleAudienceSelection(current, audience);
      if (!audiencesIncludeProgramTargeting(next)) {
        setProgramIds([]);
      }
      return next;
    });
  }, []);

  const toggleProgramId = useCallback((programId: string) => {
    setProgramIds((current) => toggleProgramSelection(current, programId));
  }, []);

  const togglePublishSchedule = useCallback((enabled: boolean) => {
    setPublishScheduleEnabled(enabled);
    if (!enabled) setPublishedAt('');
  }, []);

  const toggleExpiry = useCallback((enabled: boolean) => {
    setExpiryEnabled(enabled);
    if (!enabled) setExpiresAt('');
  }, []);

  const validateBeforeSave = useCallback((): boolean => {
    if (programRequired && programIds.length === 0) {
      Alert.alert('Missing program', 'Choose at least one program for program-targeted bulletins.');
      return false;
    }
    return true;
  }, [programIds.length, programRequired]);

  const persistPost = useCallback(
    async (
      status: BulletinPostStatus,
      options?: { silent?: boolean; existingPost?: BulletinPost | null },
    ): Promise<BulletinPost | null> => {
      if (!validateBeforeSave()) return null;

      const currentPost = options?.existingPost ?? draftPost ?? post;
      const payload = buildSavePayload(
        title,
        body,
        normalizedAudiences,
        programIds,
        showProgramPicker,
        status,
        publishScheduleEnabled ? publishedAt : '',
        expiryEnabled ? expiresAt : '',
      );

      const saved = currentPost
        ? await updateBulletinPost(slug, currentPost.id, payload)
        : await createBulletinPost(slug, payload);

      setDraftPost(saved);
      onSaved(saved);
      return saved;
    },
    [
      body,
      draftPost,
      expiryEnabled,
      expiresAt,
      normalizedAudiences,
      onSaved,
      post,
      programIds,
      publishScheduleEnabled,
      publishedAt,
      showProgramPicker,
      slug,
      title,
      validateBeforeSave,
    ],
  );

  const savePost = useCallback(
    async (status: BulletinPostStatus) => {
      setSaving(true);
      try {
        await persistPost(status);
      } catch (error) {
        reportError('school_admin_bulletin_save', error);
        Alert.alert('Save failed', error instanceof Error ? error.message : 'Could not save bulletin post.');
      } finally {
        setSaving(false);
      }
    },
    [persistPost, reportError],
  );

  const handleArchive = useCallback(async () => {
    if (!activePost) return;
    setSaving(true);
    try {
      const saved = await updateBulletinPost(slug, activePost.id, { status: 'archived' });
      setDraftPost(saved);
      onSaved(saved);
    } catch (error) {
      reportError('school_admin_bulletin_archive', error);
      Alert.alert(
        'Archive failed',
        error instanceof Error ? error.message : 'Could not archive bulletin post.',
      );
    } finally {
      setSaving(false);
    }
  }, [activePost, onSaved, reportError, slug]);

  const handleDelete = useCallback(() => {
    if (!activePost || !onDeleted) return;

    Alert.alert(
      'Delete bulletin post?',
      'This permanently deletes the post and its attachments.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setSaving(true);
              try {
                await deleteBulletinPost(slug, activePost.id);
                onDeleted();
              } catch (error) {
                reportError('school_admin_bulletin_delete', error);
                Alert.alert(
                  'Delete failed',
                  error instanceof Error ? error.message : 'Could not delete bulletin post.',
                );
              } finally {
                setSaving(false);
              }
            })();
          },
        },
      ],
    );
  }, [activePost, onDeleted, reportError, slug]);

  const uploadFiles = useCallback(
    async (files: StagedBulletinFile[]) => {
      if (files.length === 0) return;

      if (!title.trim()) {
        Alert.alert('Title required', 'Add a title before uploading files.');
        return;
      }

      setUploading(true);
      try {
        let postForUpload = activePost;
        if (!postForUpload) {
          postForUpload = await persistPost('draft', { silent: true });
          if (!postForUpload) return;
        }

        const saved = await uploadBulletinAttachments(slug, postForUpload.id, files);
        setDraftPost(saved);
        onSaved(saved);
      } catch (error) {
        reportError('school_admin_bulletin_upload_attachments', error);
        Alert.alert(
          'Upload failed',
          error instanceof Error ? error.message : 'Could not upload attachments.',
        );
      } finally {
        setUploading(false);
      }
    },
    [activePost, onSaved, persistPost, reportError, slug, title],
  );

  const handleRemoveAttachment = useCallback(
    async (attachmentId: string) => {
      if (!activePost) return;
      setRemovingAttachmentId(attachmentId);
      try {
        const saved = await removeBulletinAttachment(slug, activePost.id, attachmentId);
        setDraftPost(saved);
        onSaved(saved);
      } catch (error) {
        reportError('school_admin_bulletin_remove_attachment', error);
        Alert.alert(
          'Remove failed',
          error instanceof Error ? error.message : 'Could not remove attachment.',
        );
      } finally {
        setRemovingAttachmentId(null);
      }
    },
    [activePost, onSaved, reportError, slug],
  );

  return {
    title,
    setTitle,
    body,
    setBody,
    audiences,
    toggleAudience,
    programIds,
    toggleProgramId,
    publishedAt,
    setPublishedAt,
    expiresAt,
    setExpiresAt,
    publishScheduleEnabled,
    expiryEnabled,
    togglePublishSchedule,
    toggleExpiry,
    saving,
    uploading,
    removingAttachmentId,
    activePost,
    showProgramPicker,
    programRequired,
    editingExisting,
    canUploadAttachments: Boolean(title.trim()),
    atAttachmentLimit: (activePost?.attachments.length ?? 0) >= MAX_BULLETIN_ATTACHMENTS,
    savePost,
    handleArchive,
    handleDelete,
    uploadFiles,
    handleRemoveAttachment,
  };
}

export function bulletinEditorSheetTitle(isNew: boolean, post: BulletinPost | null): string {
  if (isNew) return 'New bulletin post';
  return post?.title?.trim() || 'Bulletin post';
}

export function bulletinEditorSheetSubtitle(isNew: boolean): string {
  if (isNew) {
    return 'Draft announcements for families and staff.';
  }
  return 'Update audience, schedule, and attachments.';
}
