import { ParentPhotosGardenScreen } from '@/components/parent/photos/garden/parent-photos-garden-screen';
import { useParentPhotosController } from '@/components/parent/photos/garden/use-parent-photos-controller';

type ParentPhotosScreenProps = {
  organizationId: string;
  slug: string;
  programId?: string;
};

/**
 * Thin entry: controller (data + callbacks) → Garden screen. Imports no
 * upload / image-picker modules, so the parent route chunk stays small.
 */
export function ParentPhotosScreen({ organizationId, slug, programId }: ParentPhotosScreenProps) {
  const controller = useParentPhotosController({ organizationId, slug, programId });
  return <ParentPhotosGardenScreen controller={controller} />;
}
