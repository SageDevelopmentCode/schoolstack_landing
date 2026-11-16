import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { BillingCtx } from '@/components/parent/billing/billing-ctx';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GLink, GNoteTile, GOutlineButton, GPressable } from '@/components/parent/garden/ui';
import type { FamilyBillingReadiness } from '@/lib/parent/parent-portal-api';
import { formatCents } from '@/lib/tuition/format-cents';
import { EXTRA_PAY_BANNER_CTA } from '@/lib/tuition/tuition-pay-copy';

type ReadinessCopy = { title: string; body: string; cta: string | null };

/** Same states and copy as the pre-Garden readiness banner. */
function resolveReadinessCopy(
  readiness: FamilyBillingReadiness,
  hasCharges: boolean,
  hasPendingSchedule: boolean,
): ReadinessCopy | null {
  if (hasCharges) return null;
  const childrenLabel =
    readiness.childrenNames.length > 0 ? readiness.childrenNames.join(', ') : 'your student';

  switch (readiness.state) {
    case 'needs_assignment':
      return {
        title: 'Tuition has not been assigned yet',
        body: `Billing for ${childrenLabel} has not been set up by your school yet. Charges will appear here once tuition is assigned.`,
        cta: null,
      };
    case 'needs_payment_plan':
      if (hasPendingSchedule) return null;
      return {
        title: 'Choose your payment schedule',
        body: 'Complete your enrollment checklist to select an installment plan and generate tuition charges.',
        cta: readiness.enrollmentChecklistHref ? 'Go to enrollment' : null,
      };
    case 'no_charges':
      return {
        title: 'Your schedule is being prepared',
        body: 'Your school is finalizing tuition details. Check back soon or complete any remaining enrollment steps.',
        cta: readiness.enrollmentChecklistHref ? 'Go to enrollment' : null,
      };
    default:
      return null;
  }
}

/** Visual-only white toy pill inside the urgent strip (the strip is the button). */
function StripPill({ label }: { label: string }) {
  return (
    <View style={styles.pillWrap}>
      <View style={styles.pillUnderlay} />
      <View style={styles.pillFace}>
        <Text style={styles.pillLabel}>{label}</Text>
        <Ionicons name="arrow-forward" size={14} color={Garden.ink} />
      </View>
    </View>
  );
}

function DismissLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <GPressable
      accessibilityLabel={label}
      haptic="select"
      hitSlop={10}
      onPress={onPress}
      style={styles.dismiss}>
      <Ionicons name="close" size={18} color={Garden.ink60} />
    </GPressable>
  );
}

/**
 * Everything that needs the parent's attention, in one stack: schedule pending,
 * enrollment readiness, late fee, autopay failure and the tax-credit tip.
 * Same conditions, copy and dismiss behaviour as the old banners.
 */
export function BillingAttention({
  ctx,
  part = 'alerts',
}: {
  ctx: BillingCtx;
  /** `alerts` sit under the header; the optional tax-credit `tips` sit under the due card. */
  part?: 'alerts' | 'tips';
}) {
  const accent = useGardenAccent();
  const { view, model, feedback } = ctx;
  const readiness = resolveReadinessCopy(
    view.data.readiness,
    view.data.charges.length > 0,
    view.familySummary.hasPendingSchedule,
  );
  const lateFee = view.lateFeeNotice;
  const pendingChildKey = view.setupProgress.firstPendingChildKey;
  const scheduleTarget =
    pendingChildKey && view.activeChild?.status !== 'needs_schedule' ? pendingChildKey : null;

  const tips = [
    view.showTaxCreditBanner ? (
      <View key="tax-credit" testID="parent-billing-tax-credit-banner">
        <GNoteTile
          tint={Garden.butter}
          icon="ribbon-outline"
          title="Using Idaho Parent Choice Tax Credit?"
          subtitle="Apply a tax credit or lump sum on a child's tuition payment. Remaining monthly payments will be recalculated automatically."
          subtitleLines={4}
          trailing={
            <DismissLink label="Dismiss tax credit tip" onPress={view.dismissTaxCreditBanner} />
          }>
          {view.nextChargeId ? (
            <GOutlineButton
              label={EXTRA_PAY_BANNER_CTA}
              icon="arrow-forward"
              onPress={feedback.guarded(() => view.payExtra(view.nextChargeId!))}
              style={styles.noteAction}
            />
          ) : null}
        </GNoteTile>
      </View>
    ) : null,
  ];

  const alerts = [
    view.scheduleWarningMessage ? (
      <GNoteTile
        key="schedule"
        tint={Garden.butter}
        icon="calendar-outline"
        title="Payment schedule pending"
        subtitle={view.scheduleWarningMessage}
        subtitleLines={3}
        onPress={scheduleTarget ? () => model.goToPlan(scheduleTarget) : undefined}
        accessibilityHint={scheduleTarget ? 'Opens the payment schedule picker' : undefined}
      />
    ) : null,

    readiness && readiness.cta ? (
      <GPressable
        key="readiness"
        accessibilityLabel={`${readiness.title}. ${readiness.body}. ${readiness.cta}`}
        haptic="press"
        onPress={view.openEnrollment}
        style={[styles.strip, { backgroundColor: accent.clay }]}>
        <View style={styles.stripCopy}>
          <Text style={styles.stripTitle}>{readiness.title}</Text>
          <Text style={styles.stripBody}>{readiness.body}</Text>
        </View>
        <StripPill label={readiness.cta} />
      </GPressable>
    ) : readiness ? (
      <GNoteTile
        key="readiness"
        tint={Garden.sky}
        icon="hourglass-outline"
        title={readiness.title}
        subtitle={readiness.body}
        subtitleLines={4}
        tape={false}
      />
    ) : null,

    lateFee ? (
      <GNoteTile
        key="late-fee"
        tint={Garden.peach}
        icon="time-outline"
        tape={false}
        title="Late fee added"
        subtitle={`${formatCents(lateFee.totalCents)} was added${
          lateFee.labels.length === 1
            ? ` for ${lateFee.labels[0]}`
            : ` across ${lateFee.labels.length} late fees`
        }.`}
        subtitleLines={3}
        trailing={<DismissLink label="Dismiss late fee notice" onPress={view.dismissLateFeeNotice} />}
      />
    ) : null,

    view.showAutopayFailure && view.data.recentAutopayFailure ? (
      <GNoteTile
        key="autopay-failure"
        tint={Garden.peach}
        icon="alert-circle-outline"
        tape={false}
        title="Autopay failed"
        subtitle={view.data.recentAutopayFailure.summary}
        subtitleLines={4}
        trailing={
          <DismissLink label="Dismiss autopay failure" onPress={view.dismissAutopayFailure} />
        }>
        <GLink
          label={view.paymentMethodLoading ? 'Opening…' : 'Update card'}
          accessibilityLabel="Update your card for autopay"
          onPress={view.manageCard}
          style={styles.noteAction}
        />
      </GNoteTile>
    ) : null,

  ];

  const items = (part === 'tips' ? tips : alerts).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <View style={styles.stack} accessibilityLabel="Needs your attention">
      {items}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10,
  },
  strip: {
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    padding: 16,
  },
  stripCopy: {
    alignSelf: 'stretch',
    gap: 4,
  },
  stripTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 17,
    lineHeight: 22,
    color: Garden.white,
  },
  stripBody: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.85)',
  },
  pillWrap: {
    paddingBottom: 3,
  },
  pillUnderlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 3,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: Garden.ink,
  },
  pillFace: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Garden.ink,
    backgroundColor: Garden.white,
  },
  pillLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
    color: Garden.ink,
  },
  dismiss: {
    width: 44,
    height: 44,
    marginRight: -10,
    marginTop: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteAction: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
});
