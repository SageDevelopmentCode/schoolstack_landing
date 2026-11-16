import { ParentFormsDocumentsGardenScreen } from '@/components/parent/forms-documents/garden/parent-forms-documents-garden-screen';
import { useParentFormsDocumentsScreenController } from '@/components/parent/forms-documents/garden/use-parent-forms-documents-screen-controller';

type ParentFormsDocumentsScreenProps = {
  slug: string;
};

/** Thin entry: controller (data + callbacks) → Garden screen. */
export function ParentFormsDocumentsScreen({ slug }: ParentFormsDocumentsScreenProps) {
  const controller = useParentFormsDocumentsScreenController({ slug });
  return <ParentFormsDocumentsGardenScreen controller={controller} />;
}
