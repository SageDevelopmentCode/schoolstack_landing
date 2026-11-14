import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import type { ParentHomeDashboardProps } from '@/components/parent/home/parent-home-dashboard';
import type { ParentHomeDashboardModel } from '@/components/parent/home/use-parent-home-dashboard-model';
import type { HomeLabFeedback } from '@/components/parent/home-lab/use-home-lab-feedback';

/** Everything a Home lab section needs: the real Home props, the shared model and feedback. */
export type HomeLabCtx = {
  props: ParentHomeDashboardProps;
  model: ParentHomeDashboardModel;
  feedback: HomeLabFeedback;
};

/**
 * Open a to-do. Items with an in-app route behave exactly like the current Home
 * (`onAttentionItem`). Items without one were not tappable before; they now open
 * the to-do sheet, which knows how to open them (including web links).
 */
export function openAttentionItem(ctx: HomeLabCtx, item: ParentHomeAttentionItem) {
  if (item.href) {
    ctx.props.onAttentionItem(item);
    return;
  }
  ctx.model.setOnboardingOpen(true);
}

export function attentionCountTitle(count: number): string {
  return `${count} thing${count === 1 ? '' : 's'} need${count === 1 ? 's' : ''} your attention`;
}
