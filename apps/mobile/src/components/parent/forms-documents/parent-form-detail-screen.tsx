import { ParentFormDetailGardenScreen } from '@/components/parent/forms-documents/garden/parent-form-detail-garden-screen';
import { useParentFormDetailScreenController } from '@/components/parent/forms-documents/garden/use-parent-form-detail-screen-controller';

type ParentFormDetailScreenProps = {
  slug: string;
  organizationId: string;
  formId: string;
};

/** Thin entry: controller (data + callbacks) → Garden screen. */
export function ParentFormDetailScreen({ slug, organizationId, formId }: ParentFormDetailScreenProps) {
  const controller = useParentFormDetailScreenController({ slug, organizationId, formId });
  return <ParentFormDetailGardenScreen controller={controller} />;
}
