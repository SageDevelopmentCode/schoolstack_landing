import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import type { ParentHomeDashboardProps } from '@/components/parent/home/parent-home-types';
import type { ParentHomeDashboardModel } from '@/components/parent/home/use-parent-home-dashboard-model';
import type { ParentHomeFeedback } from '@/components/parent/home/use-parent-home-feedback';

/** Everything a Home lab section needs: the real Home props, the shared model and feedback. */
export type ParentHomeCtx = {
  props: ParentHomeDashboardProps;
  model: ParentHomeDashboardModel;
  feedback: ParentHomeFeedback;
};

/**
 * Open a to-do. Items with an in-app route behave exactly like the current Home
 * (`onAttentionItem`). Items without one were not tappable before; they now open
 * the to-do sheet, which knows how to open them (including web links).
 */
export function openAttentionItem(ctx: ParentHomeCtx, item: ParentHomeAttentionItem) {
  if (item.href) {
    ctx.props.onAttentionItem(item);
    return;
  }
  ctx.model.setOnboardingOpen(true);
}
