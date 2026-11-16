import { ParentNewslettersGardenScreen } from '@/components/parent/newsletters/garden/parent-newsletters-garden-screen';
import { useParentNewslettersScreenController } from '@/components/parent/newsletters/garden/use-parent-newsletters-screen-controller';

type ParentNewslettersScreenProps = {
  slug: string;
  organizationId: string;
  programSlug?: string;
};

/** Thin entry: controller (data + callbacks) → Garden screen. */
export function ParentNewslettersScreen({
  slug,
  organizationId,
  programSlug,
}: ParentNewslettersScreenProps) {
  const controller = useParentNewslettersScreenController({ slug, organizationId, programSlug });
  return <ParentNewslettersGardenScreen controller={controller} />;
}
