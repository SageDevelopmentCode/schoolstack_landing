import { type Href, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { goBackOrReplace } from '@/lib/navigation';
import { parentProgramBasePath, parentTabRoute } from '@/lib/parent/parent-nav';
import {
  fetchParentPhotoMediaConsents,
  patchParentPhotoMediaConsent,
  type ParentPhotoMediaConsentLearner,
} from '@/lib/parent/parent-photo-media-consent-api';
import { groupGalleryPhotosByDate } from '@/lib/school-gallery/group-gallery-photos';
import { listParentGalleryPhotos } from '@/lib/school-gallery/parent-gallery-api';
import { useGalleryPhotosFeed } from '@/lib/school-gallery/use-gallery-photos-feed';
import {
  childFirstName,
  photoMediaConsentLabel,
  type PhotoMediaConsent,
} from '@/lib/students/photo-media-consent';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type PhotoPermissionChange = {
  studentId: string;
  consent: PhotoMediaConsent;
};

export type PhotoPermissionSaveResult = {
  savedIds: string[];
  failures: { studentId: string; name: string; message: string }[];
};

export type ConsentsStatus = 'loading' | 'ready' | 'error';

const HIGHLIGHT_MS = 2600;

/**
 * Parent Photos data + callbacks (no UI): the school gallery feed, each child's
 * photo permission, and saving permissions. Same requests and error operations
 * as the Story screen (`parent_gallery_list`, `parent_gallery_load_more`,
 * `parent_photo_media_consents_load`, `parent_photo_media_consent_update`).
 */
export function useParentPhotosController({
  organizationId,
  slug,
  programId,
}: {
  organizationId: string;
  slug: string;
  programId?: string;
}) {
  const router = useRouter();
  const { programSlug } = useLocalSearchParams<{ programSlug?: string }>();
  const { reportError } = useMobileErrorReporter(organizationId);

  /* ---------------- Photo permissions ---------------- */

  const [learners, setLearners] = useState<ParentPhotoMediaConsentLearner[]>([]);
  const [consentsStatus, setConsentsStatus] = useState<ConsentsStatus>('loading');
  const [recentlyUpdatedIds, setRecentlyUpdatedIds] = useState<string[]>([]);
  const [justCompletedAll, setJustCompletedAll] = useState(false);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasConsentsRef = useRef(false);

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );

  const loadConsents = useCallback(async () => {
    // Keep showing what we have while refreshing; only the first load shows a skeleton.
    if (!hasConsentsRef.current) setConsentsStatus('loading');
    try {
      const rows = await fetchParentPhotoMediaConsents(organizationId, slug, programId);
      hasConsentsRef.current = true;
      setLearners(rows);
      setConsentsStatus('ready');
    } catch (error) {
      reportError('parent_photo_media_consents_load', error);
      setConsentsStatus(hasConsentsRef.current ? 'ready' : 'error');
      throw error;
    }
  }, [organizationId, programId, reportError, slug]);

  useFocusEffect(
    useCallback(() => {
      loadConsents().catch(() => {
        // Reported in loadConsents; the card shows the retry state.
      });
    }, [loadConsents]),
  );

  const retryConsents = useCallback(() => {
    loadConsents().catch(() => {
      // Reported in loadConsents; the card shows the retry state.
    });
  }, [loadConsents]);

  const unsetLearners = useMemo(() => learners.filter((learner) => !learner.consent), [learners]);
  const total = learners.length;
  const setCount = total - unsetLearners.length;
  const allSet = total > 0 && unsetLearners.length === 0;

  const savePermissions = useCallback(
    async (changes: PhotoPermissionChange[]): Promise<PhotoPermissionSaveResult> => {
      const wasAllSet = allSet;
      const settled = await Promise.allSettled(
        changes.map(async ({ studentId, consent }) => {
          const saved = await patchParentPhotoMediaConsent(organizationId, studentId, consent);
          return { studentId, ...saved };
        }),
      );

      const updates = new Map<string, { consent: PhotoMediaConsent; updatedAt: string }>();
      const failures: PhotoPermissionSaveResult['failures'] = [];
      settled.forEach((result, index) => {
        const { studentId } = changes[index];
        if (result.status === 'fulfilled') {
          updates.set(studentId, {
            consent: result.value.consent,
            updatedAt: result.value.updatedAt,
          });
          return;
        }
        const message =
          result.reason instanceof Error
            ? result.reason.message
            : 'Could not save photo permissions.';
        reportError('parent_photo_media_consent_update', result.reason, {
          error: message,
          entityType: 'student',
          entityId: studentId,
        });
        const learner = learners.find((entry) => entry.studentId === studentId);
        failures.push({
          studentId,
          name: learner ? childFirstName(learner.studentName) : 'your child',
          message,
        });
      });

      const savedIds = Array.from(updates.keys());
      if (savedIds.length > 0) {
        const next = learners.map((learner) => {
          const update = updates.get(learner.studentId);
          return update
            ? {
                ...learner,
                consent: update.consent,
                consentLabel: photoMediaConsentLabel(update.consent),
                updatedAt: update.updatedAt,
              }
            : learner;
        });
        const nowAllSet = next.length > 0 && next.every((learner) => Boolean(learner.consent));
        if (!wasAllSet && nowAllSet) setJustCompletedAll(true);
        setLearners(next);
        setRecentlyUpdatedIds(savedIds);
        if (highlightTimer.current) clearTimeout(highlightTimer.current);
        highlightTimer.current = setTimeout(() => setRecentlyUpdatedIds([]), HIGHLIGHT_MS);
      }

      return { savedIds, failures };
    },
    [allSet, learners, organizationId, reportError],
  );

  /* ---------------- Gallery feed ---------------- */

  const listPage = useCallback(
    (offset: number) => listParentGalleryPhotos(organizationId, slug, offset, programId),
    [organizationId, slug, programId],
  );

  const onGalleryLoadError = useCallback(
    (error: unknown, phase: 'initial' | 'load_more') => {
      reportError(phase === 'initial' ? 'parent_gallery_list' : 'parent_gallery_load_more', error);
    },
    [reportError],
  );

  const feed = useGalleryPhotosFeed({ listPage, onLoadError: onGalleryLoadError });
  const groups = useMemo(() => groupGalleryPhotosByDate(feed.photos), [feed.photos]);
  /** Photos in the order the grid shows them, so the viewer swipes the same way. */
  const orderedPhotos = useMemo(() => groups.flatMap((group) => group.photos), [groups]);

  const loadMore = useCallback(() => {
    if (feed.loadingMore || !feed.hasMore || feed.loadMoreError) return;
    void feed.loadMore();
  }, [feed]);

  const retryLoadMore = useCallback(() => {
    void feed.loadMore();
  }, [feed]);

  /** Pull to refresh: gallery and permissions together. */
  const refresh = useCallback(async () => {
    await Promise.all([
      feed.reload(),
      loadConsents().catch(() => {
        // Reported in loadConsents.
      }),
    ]);
  }, [feed, loadConsents]);

  const onBack = useCallback(() => {
    goBackOrReplace(
      router,
      programSlug ? (parentProgramBasePath(slug, programSlug) as Href) : parentTabRoute(slug, 'home'),
    );
  }, [programSlug, router, slug]);

  return {
    organizationId,
    slug,
    onBack,
    // permissions
    learners,
    consentsStatus,
    retryConsents,
    unsetLearners,
    total,
    setCount,
    allSet,
    savePermissions,
    recentlyUpdatedIds,
    justCompletedAll,
    // gallery
    photos: orderedPhotos,
    groups,
    isInitialLoading: feed.loading && feed.photos.length === 0,
    initialError: feed.initialError,
    loadingMore: feed.loadingMore,
    loadMoreError: feed.loadMoreError,
    hasMore: feed.hasMore,
    loadMore,
    retryLoadMore,
    retryGallery: () => void feed.reload(),
    refresh,
  };
}

export type ParentPhotosController = ReturnType<typeof useParentPhotosController>;
