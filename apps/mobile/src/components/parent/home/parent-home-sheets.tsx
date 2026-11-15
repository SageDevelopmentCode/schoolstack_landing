import type { ParentHomeDashboardProps } from '@/components/parent/home/parent-home-types';
import type { ParentHomeDashboardModel } from '@/components/parent/home/use-parent-home-dashboard-model';
import { ParentBulletinSheet } from '@/components/parent/home/sheets/parent-bulletin-sheet';
import { ParentNotificationsSheet } from '@/components/parent/home/sheets/parent-notifications-sheet';
import { ParentOnboardingSheet } from '@/components/parent/parent-onboarding-sheet';
import { PortalAccountSheet } from '@/components/portal-account-sheet';
import { PortalSupportRequestSheet } from '@/components/portal/portal-support-request-sheet';
import { useParentHome } from '@/contexts/parent-home-context';
import { useParentPortalContext } from '@/contexts/parent-portal-context';
import { submitParentSupportRequest } from '@/lib/parent/parent-portal-api';

type ParentHomeSheetsProps = {
  props: ParentHomeDashboardProps;
  model: ParentHomeDashboardModel;
  /** Optional observers for feedback (toasts/haptics). They never change behaviour. */
  onProfilePhotoUpdated?: () => void;
  onProgramSelected?: (label: string) => void;
};

/** The five sheets the parent Home owns (bulletin, notifications, support, account, to-dos). */
export function ParentHomeSheets({
  props,
  model,
  onProfilePhotoUpdated,
  onProgramSelected,
}: ParentHomeSheetsProps) {
  const { data, slug, programSlug, sourcePagePath, onMarkedNotificationsRead, onAttentionItem } =
    props;
  const { refresh: refreshParentHome } = useParentHome();
  const {
    contexts,
    activeContext,
    showSwitcher,
    switchToContext,
    isLoading: portalContextsLoading,
    organizationId,
  } = useParentPortalContext();

  return (
    <>
      <ParentBulletinSheet
        visible={model.bulletinOpen}
        posts={model.bulletinPosts}
        onClose={() => model.setBulletinOpen(false)}
        onOpenPost={(postId) => {
          model.setBulletinOpen(false);
          props.onOpenBulletinPost(postId);
        }}
      />

      <ParentNotificationsSheet
        visible={model.notificationsOpen}
        onClose={() => model.setNotificationsOpen(false)}
        organizationId={data.organizationId}
        slug={slug}
        programSlug={programSlug}
        notificationContext={model.activityNotificationContext}
        firstChildApplicationId={model.firstChildApplicationId}
        unreadCount={props.notificationUnreadCount}
        onMarkedRead={onMarkedNotificationsRead}
      />

      <PortalSupportRequestSheet
        visible={model.supportSheetOpen}
        onClose={() => model.setSupportSheetOpen(false)}
        organizationId={data.organizationId}
        userEmail={data.userProfile.email}
        sourcePagePath={sourcePagePath}
        errorOperation="parent_portal_support_request_submit"
        onSubmit={submitParentSupportRequest}
      />

      <PortalAccountSheet
        visible={model.accountSheetOpen}
        onClose={() => model.setAccountSheetOpen(false)}
        displayName={data.userProfile.displayName}
        photoUrl={model.heroProfilePhotoUrl}
        organizationId={organizationId}
        slug={slug}
        onProfilePhotoUpdated={(url) => {
          model.setHeroProfilePhotoUrl(url);
          void refreshParentHome();
          onProfilePhotoUpdated?.();
        }}
        programSwitcher={
          portalContextsLoading || showSwitcher
            ? {
                contexts: contexts.map((context) => ({
                  id: context.id,
                  label: context.label,
                })),
                activeContextId: activeContext?.id ?? null,
                loading: portalContextsLoading,
                onSelect: (context) => {
                  const match = contexts.find((item) => item.id === context.id);
                  if (match) {
                    switchToContext(match);
                    onProgramSelected?.(match.label);
                  }
                },
              }
            : undefined
        }
      />

      <ParentOnboardingSheet
        visible={model.onboardingOpen}
        items={data.onboardingItems}
        attentionItems={model.portalAttentionItems}
        onClose={() => model.setOnboardingOpen(false)}
        onSelectItem={(item) => void model.handleOnboardingItem(item)}
        onSelectAttentionItem={(item) => {
          model.setOnboardingOpen(false);
          onAttentionItem(item);
        }}
      />
    </>
  );
}
