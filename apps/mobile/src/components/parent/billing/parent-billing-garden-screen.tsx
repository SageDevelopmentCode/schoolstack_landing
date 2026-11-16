import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BillingCtx } from '@/components/parent/billing/billing-ctx';
import { BillingAgreements } from '@/components/parent/billing/sections/billing-agreements';
import { BillingAttention } from '@/components/parent/billing/sections/billing-attention';
import { BillingChildren } from '@/components/parent/billing/sections/billing-children';
import { BillingDueCard } from '@/components/parent/billing/sections/billing-due-card';
import { BillingHeader } from '@/components/parent/billing/sections/billing-header';
import {
  BillingChargesSection,
  BillingPaymentsSection,
} from '@/components/parent/billing/sections/billing-lists';
import { BillingScheduleSetup } from '@/components/parent/billing/sections/billing-schedule-setup';
import { BillingSettingsCard } from '@/components/parent/billing/sections/billing-settings-card';
import { BillingSetupCard } from '@/components/parent/billing/sections/billing-setup-card';
import { BillingAutopaySheet } from '@/components/parent/billing/sheets/billing-autopay-sheet';
import {
  BillingChargesSheet,
  BillingPaymentsSheet,
} from '@/components/parent/billing/sheets/billing-list-sheets';
import { BillingPaySheet } from '@/components/parent/billing/sheets/billing-pay-sheet';
import { BillingReceiptSheet } from '@/components/parent/billing/sheets/billing-receipt-sheet';
import {
  useParentBillingRefreshFeedback,
  type ParentBillingFeedback,
} from '@/components/parent/billing/use-parent-billing-feedback';
import { useParentBillingModel } from '@/components/parent/billing/use-parent-billing-model';
import type {
  ParentBillingScreenController,
  ParentBillingView,
} from '@/components/parent/billing/use-parent-billing-screen-controller';
import { GCelebrate } from '@/components/parent/garden/celebrate';
import { Garden, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GErrorCard, GSkeleton } from '@/components/parent/garden/ui';
import { haptic } from '@/lib/haptics';
import { childFirstNameFromFullName } from '@/lib/tuition/billing-helpers';
import { formatCents } from '@/lib/tuition/format-cents';
import type { ParentBillingSetupStepKey } from '@/lib/tuition/parent-billing-setup-steps';

/** Parent Billing (main and program portals): Garden skeleton, error card, or the tab. */
export function ParentBillingGardenScreen({
  controller,
  feedback,
}: {
  controller: ParentBillingScreenController;
  feedback: ParentBillingFeedback;
}) {
  const failed = controller.status === 'error';
  useEffect(() => {
    if (failed) haptic.error();
  }, [failed]);

  if (controller.status === 'loading') return <ParentBillingGardenSkeleton />;

  if (controller.status === 'error') {
    return (
      <View style={[styles.root, styles.centered]}>
        <GErrorCard
          title="We couldn't load your billing"
          message={controller.error}
          onRetry={controller.refresh}
        />
      </View>
    );
  }

  if (controller.status !== 'ready') return null;

  return <BillingContent view={controller.view} error={controller.error} feedback={feedback} />;
}

function BillingContent({
  view,
  error,
  feedback,
}: {
  view: ParentBillingView;
  error: string | null;
  feedback: ParentBillingFeedback;
}) {
  const insets = useSafeAreaInsets();
  const accent = useGardenAccent();
  const model = useParentBillingModel(view);
  const refreshWithFeedback = useParentBillingRefreshFeedback(view.isRefreshing, error, view.refresh);
  const ctx: BillingCtx = { view, model, feedback };
  const { familySummary, activeChild, data } = view;

  const payFromDueCard = feedback.guarded(activeChild ? view.payChild : view.payFamily);

  const onStep = (key: ParentBillingSetupStepKey) => {
    switch (key) {
      case 'plan':
        model.goToPlan(view.setupProgress.firstPendingChildKey);
        return;
      case 'agreements':
        model.goToAgreements();
        return;
      case 'payment_method':
        view.manageCard();
        return;
      case 'pay':
        payFromDueCard();
        return;
    }
  };

  const onScheduleConfirmed = () => {
    const next = view.childViews.find(
      (child) => child.status === 'needs_schedule' && child.childKey !== activeChild?.childKey,
    );
    feedback.scheduleConfirmed(
      activeChild ? childFirstNameFromFullName(activeChild.studentName) : 'Your',
      next
        ? {
            firstName: childFirstNameFromFullName(next.studentName),
            onOpen: () => model.goToPlan(next.childKey),
          }
        : null,
    );
    view.onScheduleComplete();
  };

  const settingsCard = (index: number) => (
    <BillingSettingsCard
      index={index}
      autopayEnabled={data.autopayEnabled}
      savedPaymentMethod={data.savedPaymentMethod}
      paymentMethodLoading={view.paymentMethodLoading}
      onAutopay={feedback.guarded(model.autopay.openSheet)}
      onManagePaymentMethod={view.manageCard}
    />
  );

  let panel: React.ReactNode = null;
  if (view.isAgreementsTab) {
    panel = <BillingAgreements agreements={view.tuitionAgreements} onOpenAgreement={view.openAgreement} />;
  } else if (!activeChild) {
    panel = (
      <>
        <BillingDueCard
          index={0}
          testID="parent-billing-summary"
          balanceDueCents={familySummary.balanceDueCents}
          nextCharge={familySummary.nextCharge}
          nextChargeId={view.nextChargeId}
          payNowLabel={view.familyPayNowLabel}
          paying={view.pay.loading}
          autopayEnabled={data.autopayEnabled}
          hasMultipleChildren={view.childViews.length > 1}
          hasPendingSchedule={familySummary.hasPendingSchedule}
          hasAnyCharges={data.charges.length > 0}
          familyTotalRemainingCents={familySummary.familyTotalRemainingCents}
          showEstimatedAnnual={familySummary.hasPendingSchedule && familySummary.balanceDueCents === 0}
          estimatedAnnualCents={familySummary.annualTuitionCents}
          lastPaymentSummary={view.lastPaymentSummary}
          justPaid={feedback.justPaid}
          onPay={payFromDueCard}
        />
        <BillingAttention ctx={ctx} part="tips" />
        <BillingSetupCard index={1} progress={view.setupProgress} onStep={onStep} />
        {settingsCard(2)}
        <BillingChildren index={3} childViews={view.childViews} onSelectChild={view.selectTab} />
        <BillingChargesSection ctx={ctx} index={4} />
        <BillingPaymentsSection ctx={ctx} index={5} />
      </>
    );
  } else {
    const planSubtitle =
      activeChild.paymentPlanLabel ?? `Annual ${formatCents(activeChild.annualTuitionCents)}`;
    const needsSchedule = activeChild.status === 'needs_schedule' && activeChild.selectionItem;
    panel = (
      <>
        <GChip label={planSubtitle} icon="school-outline" style={styles.planChip} />
        {needsSchedule ? (
          <BillingScheduleSetup
            index={0}
            organizationId={data.organizationId}
            selectionItem={activeChild.selectionItem!}
            studentName={activeChild.studentName}
            guard={feedback.guarded}
            onConfirmed={onScheduleConfirmed}
            onLayout={model.onScheduleLayout}
          />
        ) : null}
        <BillingDueCard
          index={1}
          testID={`parent-billing-child-${activeChild.childKey}`}
          balanceDueCents={activeChild.balanceDueCents}
          nextCharge={activeChild.nextCharge}
          nextChargeId={activeChild.nextChargeId}
          payNowLabel={view.childPayNowLabel}
          paying={view.pay.loading}
          autopayEnabled={data.autopayEnabled}
          hasPendingSchedule={activeChild.status === 'needs_schedule'}
          hasAnyCharges={view.displayedCharges.length > 0 || data.charges.length > 0}
          lastPaymentSummary={view.lastPaymentSummary}
          canPayExtra={view.childCanPayExtra}
          justPaid={feedback.justPaid}
          onPay={payFromDueCard}
          onPayExtra={feedback.guarded(() => {
            if (activeChild.nextChargeId) view.payExtra(activeChild.nextChargeId);
          })}
        />
        {!view.hasMultipleChildren ? (
          <BillingSetupCard index={2} progress={view.setupProgress} onStep={onStep} />
        ) : null}
        {settingsCard(3)}
        <BillingChargesSection ctx={ctx} index={4} />
        <BillingPaymentsSection ctx={ctx} index={5} />
      </>
    );
  }

  return (
    // The parent layout's SafeAreaView pads the top. Pull only the background up so
    // the iOS refresh spinner (inside the ScrollView) stays below the status bar.
    <View style={[styles.root, { marginTop: -insets.top, paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView
        ref={model.scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={view.isRefreshing}
            onRefresh={refreshWithFeedback}
            tintColor={accent.clay}
          />
        }>
        <BillingHeader ctx={ctx} />
        <BillingAttention ctx={ctx} />
        <View
          key={view.activeTabKey}
          testID={!activeChild && !view.isAgreementsTab ? 'parent-billing-summary-panel' : undefined}
          onLayout={(event) => model.onPanelLayout(event.nativeEvent.layout.y)}
          style={styles.panel}>
          {panel}
        </View>
      </ScrollView>

      <GCelebrate
        active={Boolean(feedback.celebrationKey) && !feedback.isPreview}
        celebrationKey={feedback.celebrationKey ?? 'parent-billing-idle'}
      />

      <BillingPaySheet flow={view.pay} />
      <BillingAutopaySheet
        autopay={model.autopay}
        savedPaymentMethod={data.savedPaymentMethod}
        onAddCard={view.manageCard}
      />
      <BillingChargesSheet ctx={ctx} />
      <BillingPaymentsSheet ctx={ctx} />
      <BillingReceiptSheet visible={view.receiptOpen} receipt={view.receipt} onClose={view.closeReceipt} />
    </View>
  );
}

export function ParentBillingGardenSkeleton() {
  return (
    <ScrollView
      style={styles.root}
      scrollEnabled={false}
      accessibilityLabel="Loading billing"
      contentContainerStyle={styles.skeleton}>
      <GSkeleton style={styles.skKicker} />
      <GSkeleton style={styles.skTitle} />
      <GSkeleton style={styles.skSubtitle} />
      <GSkeleton style={styles.skTabs} />
      <GSkeleton style={styles.skDue} />
      <GSkeleton style={styles.skSetup} />
      <GSkeleton style={[styles.skSetup, styles.skDark]} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Garden.cream,
  },
  centered: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 16,
  },
  panel: {
    gap: 16,
  },
  planChip: {
    alignSelf: 'flex-start',
  },
  skeleton: {
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  skKicker: {
    width: 140,
    height: 12,
    borderRadius: 6,
  },
  skTitle: {
    width: '70%',
    height: 34,
    borderRadius: 10,
  },
  skSubtitle: {
    width: '80%',
    height: 16,
    borderRadius: 8,
  },
  skTabs: {
    height: 48,
    borderRadius: 999,
    marginTop: 6,
  },
  skDue: {
    height: 220,
    borderRadius: 24,
  },
  skSetup: {
    height: 160,
    borderRadius: 24,
  },
  skDark: {
    opacity: 0.7,
  },
});
