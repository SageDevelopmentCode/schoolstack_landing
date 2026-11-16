import type { ParentBillingFeedback } from '@/components/parent/billing/use-parent-billing-feedback';
import type { ParentBillingModel } from '@/components/parent/billing/use-parent-billing-model';
import type { ParentBillingView } from '@/components/parent/billing/use-parent-billing-screen-controller';

/** Everything a Billing section needs: controller view, sheet model, feedback. */
export type BillingCtx = {
  view: ParentBillingView;
  model: ParentBillingModel;
  feedback: ParentBillingFeedback;
};
