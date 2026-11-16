import { ParentNewsletterDetailGardenScreen } from '@/components/parent/newsletters/garden/parent-newsletter-detail-garden-screen';
import { useParentNewsletterDetailController } from '@/components/parent/newsletters/garden/use-parent-newsletter-detail-controller';

type ParentNewsletterDetailScreenProps = {
  organizationId: string;
  editionId: string;
};

/** Thin entry: controller (data + callbacks) → Garden screen. */
export function ParentNewsletterDetailScreen({
  organizationId,
  editionId,
}: ParentNewsletterDetailScreenProps) {
  const controller = useParentNewsletterDetailController({ organizationId, editionId });
  return <ParentNewsletterDetailGardenScreen controller={controller} />;
}
