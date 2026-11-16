import { ParentBillingGardenScreen } from '@/components/parent/billing/parent-billing-garden-screen';
import { useParentBillingFeedback } from '@/components/parent/billing/use-parent-billing-feedback';
import { useParentBillingScreenController } from '@/components/parent/billing/use-parent-billing-screen-controller';

type ParentBillingScreenProps = {
  slug: string;
  initialTab?: string;
  initialFormId?: string;
};

/** Parent Billing tab (main and program routes). Controller → Garden screen. */
export function ParentBillingScreen({ slug, initialTab, initialFormId }: ParentBillingScreenProps) {
  const feedback = useParentBillingFeedback();
  const controller = useParentBillingScreenController(slug, {
    initialTab,
    initialFormId,
    onEvent: feedback.handleEvent,
  });
  return <ParentBillingGardenScreen controller={controller} feedback={feedback} />;
}
