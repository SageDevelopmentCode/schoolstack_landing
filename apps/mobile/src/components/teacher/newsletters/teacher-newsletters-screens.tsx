import { useMemo } from 'react';

import { ParentNewsletterDetailGardenScreen } from '@/components/parent/newsletters/garden/parent-newsletter-detail-garden-screen';
import { ParentNewslettersGardenScreen } from '@/components/parent/newsletters/garden/parent-newsletters-garden-screen';
import {
  useParentNewsletterDetailController,
  type NewsletterDetailSource,
} from '@/components/parent/newsletters/garden/use-parent-newsletter-detail-controller';
import {
  useParentNewslettersScreenController,
  type NewslettersListSource,
} from '@/components/parent/newsletters/garden/use-parent-newsletters-screen-controller';
import { teacherNewsletterEditionRoute, teacherTabRoute } from '@/lib/teacher/teacher-nav';
import {
  fetchTeacherNewslettersList,
  getTeacherNewsletterDocumentWebViewSource,
} from '@/lib/teacher/teacher-portal-api';

/**
 * Staff Newsletters: the parent Garden list and WebView reader, fed from the
 * teacher-portal API (same published editions and Garden newsletter document).
 */
export function TeacherNewslettersScreen({ slug, organizationId }: { slug: string; organizationId: string }) {
  const source = useMemo<NewslettersListSource>(
    () => ({
      fetchList: fetchTeacherNewslettersList,
      editionRoute: (editionId) => teacherNewsletterEditionRoute(slug, editionId),
      backRoute: teacherTabRoute(slug, 'home'),
      loadOperation: 'teacher_newsletters_load',
    }),
    [slug],
  );
  const controller = useParentNewslettersScreenController({ slug, organizationId, source });
  return <ParentNewslettersGardenScreen controller={controller} testID="teacher-newsletters-screen" />;
}

const DETAIL_SOURCE: NewsletterDetailSource = {
  getWebViewSource: getTeacherNewsletterDocumentWebViewSource,
  operationPrefix: 'teacher_newsletter_detail',
};

export function TeacherNewsletterDetailScreen({
  organizationId,
  editionId,
}: {
  organizationId: string;
  editionId: string;
}) {
  const controller = useParentNewsletterDetailController({ organizationId, editionId, source: DETAIL_SOURCE });
  return <ParentNewsletterDetailGardenScreen controller={controller} testID="teacher-newsletter-detail-screen" />;
}
