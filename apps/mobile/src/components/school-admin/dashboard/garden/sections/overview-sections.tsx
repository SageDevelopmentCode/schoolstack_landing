import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GStepList, type GStep } from '@/components/parent/garden/steps';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import {
  GCard,
  GChip,
  GHand,
  GOutlineButton,
  GProgress,
  GTick,
} from '@/components/parent/garden/ui';
import { ctaText } from '@/components/school-admin/garden/admin-feedback';
import {
  AdminKpiTiles,
  AdminLeadStrip,
  AdminLiveDot,
  AdminWorkRow,
  type AdminKpiTile,
} from '@/components/school-admin/garden/admin-ui';
import type {
  AdmissionsSetupStatus,
  AdmissionsSetupStep,
  DashboardFocusItem,
  DashboardMetric,
  DashboardQuickAction,
} from '@/lib/school-admin/dashboard-summary-types';

type IoniconName = keyof typeof Ionicons.glyphMap;

export const FOCUS_ICONS: Record<DashboardFocusItem['icon'], IoniconName> = {
  application: 'clipboard-outline',
  schedule: 'calendar-outline',
  message: 'chatbubble-outline',
  setup: 'settings-outline',
};

export const FOCUS_TINTS: Record<DashboardFocusItem['icon'], string> = {
  application: Garden.butter,
  schedule: Garden.sky,
  message: Garden.lav,
  setup: Garden.peach,
};

export function focusTitle(count: number): string {
  return count > 0
    ? `${count} thing${count === 1 ? '' : 's'} need your attention`
    : "You're caught up for now";
}

/* ------------------------------------------------------------------ */
/* Focus queue                                                         */
/* ------------------------------------------------------------------ */

/** Today's focus as a work queue: "Do this first" strip, then numbered rows; mint caught-up state. */
export function FocusQueueCard({
  items,
  onPressItem,
  index = 0,
}: {
  items: DashboardFocusItem[];
  onPressItem: (item: DashboardFocusItem) => void;
  index?: number;
}) {
  const [lead, ...rest] = items;
  return (
    <GCard title={focusTitle(items.length)} index={index} testID="dashboard-focus-queue">
      {lead ? (
        <View style={styles.focusBody}>
          <Text style={styles.copy}>
            Prioritize the work only you can do, then let the rest of the system stay organized in
            the background.
          </Text>
          <AdminLeadStrip
            testID={`dashboard-focus-${lead.id}`}
            icon={FOCUS_ICONS[lead.icon]}
            title={lead.title}
            subtitle={lead.subtitle}
            pillLabel={ctaText(lead.ctaLabel)}
            onPress={() => onPressItem(lead)}
          />
          {rest.length > 0 ? (
            <View accessibilityRole="list">
              {rest.map((item, i) => (
                <AdminWorkRow
                  key={item.id}
                  testID={`dashboard-focus-${item.id}`}
                  step={i + 2}
                  divider={i > 0}
                  icon={FOCUS_ICONS[item.icon]}
                  tint={FOCUS_TINTS[item.icon]}
                  title={item.title}
                  meta={item.subtitle}
                  ctaLabel={ctaText(item.ctaLabel)}
                  onPress={() => onPressItem(item)}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : (
        <CaughtUpPanel />
      )}
    </GCard>
  );
}

export function CaughtUpPanel({
  line = 'Nothing needs you right now. New work shows up here as it arrives.',
}: {
  line?: string;
}) {
  return (
    <View style={styles.caughtUp} testID="dashboard-caught-up">
      <GTick size={32} />
      <View style={styles.caughtUpCopy}>
        <Text style={styles.caughtUpText}>{line}</Text>
        <GHand>enjoy the quiet ✿</GHand>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Setup stepper                                                       */
/* ------------------------------------------------------------------ */

/** Go-live setup: progress + numbered steps (current one highlighted, live Stripe check). */
export function SetupStepsCard({
  setupStatus,
  stripeChecking,
  onPressStep,
  index = 0,
}: {
  setupStatus: AdmissionsSetupStatus;
  stripeChecking: boolean;
  onPressStep: (step: AdmissionsSetupStep) => void;
  index?: number;
}) {
  const { steps, completedCount, totalCount, firstIncompleteStepId } = setupStatus;
  const remaining = totalCount - completedCount;
  const gSteps: GStep[] = steps.map((step) => {
    const done = step.status === 'completed';
    const current = !done && step.id === firstIncompleteStepId;
    const checking = step.id === 'stripe' && stripeChecking;
    return {
      id: step.id,
      title: step.title,
      meta: checking ? 'Checking Stripe status…' : done ? null : step.description,
      state: done ? 'done' : current ? 'current' : 'todo',
      chip: checking
        ? { label: 'In progress', tone: 'info' }
        : current
          ? { label: 'Next', tone: 'warning' }
          : null,
      onPress: () => onPressStep(step),
      testID: `dashboard-setup-step-${step.id}`,
    };
  });

  return (
    <GCard
      title="Setup progress"
      index={index}
      testID="dashboard-setup-progress"
      action={<GChip label={`${completedCount}/${totalCount}`} tone={remaining === 0 ? 'success' : 'neutral'} />}>
      <View style={styles.setupProgress}>
        <GProgress
          value={totalCount > 0 ? completedCount / totalCount : 0}
          label="Setup progress"
          done={remaining === 0}
        />
        <Text style={styles.meta}>
          {`${remaining} step${remaining === 1 ? '' : 's'} remaining before go-live`}
        </Text>
      </View>
      {stripeChecking ? (
        <View style={styles.liveNote}>
          <AdminLiveDot />
          <Text style={styles.liveNoteText}>Watching for Stripe updates every minute</Text>
        </View>
      ) : null}
      <GStepList steps={gSteps} accessibilityLabel="Go-live setup steps" />
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Signal                                                              */
/* ------------------------------------------------------------------ */

/** The page's one dark card: how admissions are going. */
export function SignalCard({
  signal,
  onPress,
  index = 0,
}: {
  signal: { headline: string; body: string; ctaLabel: string } | null;
  onPress: () => void;
  index?: number;
}) {
  if (!signal) {
    return (
      <GCard title="School signal" tone="paper" index={index} testID="dashboard-signal">
        <Text style={styles.copy}>Activity will appear here as families apply and enroll.</Text>
      </GCard>
    );
  }
  return (
    <GCard
      title={signal.headline}
      tone="dark"
      index={index}
      testID="dashboard-signal"
      action={
        <View style={styles.signalChip}>
          <Text style={styles.signalChipText}>School signal</Text>
        </View>
      }>
      <Text style={styles.signalBody}>{signal.body}</Text>
      <GOutlineButton
        onDark
        label={ctaText(signal.ctaLabel)}
        icon="arrow-forward"
        onPress={onPress}
        style={styles.signalCta}
      />
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* KPIs                                                                */
/* ------------------------------------------------------------------ */

const METRIC_BARS: Record<DashboardMetric['accent'], string> = {
  forest: Garden.forest,
  sky: '#5B8FC7',
  gold: '#D9A400',
  berry: '#B4536A',
};

export function KpiCard({
  metrics,
  onPressMetric,
  index = 0,
}: {
  metrics: DashboardMetric[];
  onPressMetric: (metric: DashboardMetric) => void;
  index?: number;
}) {
  const tiles: AdminKpiTile[] = metrics.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: metric.value,
    barColor: METRIC_BARS[metric.accent] ?? Garden.forest,
    onPress: () => onPressMetric(metric),
    testID: `dashboard-metric-${metric.id}`,
  }));
  return (
    <GCard title="At a glance" index={index} testID="dashboard-metrics">
      <AdminKpiTiles tiles={tiles} />
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Quick actions                                                       */
/* ------------------------------------------------------------------ */

export function QuickActionsCard({
  actions,
  onPressLink,
  onCopyApplyLink,
  pendingKey,
  flashKey,
  index = 0,
}: {
  actions: DashboardQuickAction[];
  onPressLink: (action: Extract<DashboardQuickAction, { kind: 'link' }>) => void;
  onCopyApplyLink: (action: Extract<DashboardQuickAction, { kind: 'copy-apply-link' }>) => void;
  pendingKey: string | null;
  flashKey: string | null;
  index?: number;
}) {
  if (actions.length === 0) return null;
  return (
    <GCard title="Keep moving" index={index} testID="dashboard-quick-actions">
      {actions.map((quick, i) => {
        if (quick.kind === 'copy-apply-link') {
          const key = `copy-apply-link-${quick.id}`;
          const copied = flashKey === key;
          return (
            <AdminWorkRow
              key={quick.id}
              testID={`dashboard-quick-${quick.id}`}
              divider={i > 0}
              icon={copied ? 'checkmark' : 'link-outline'}
              tint={copied ? Garden.mint : Garden.sky}
              title={copied ? 'Link copied' : quick.title}
              meta={quick.subtitle}
              pending={pendingKey === key}
              flash={copied}
              accessibilityLabel={copied ? 'Link copied' : `${quick.title}. ${quick.subtitle}. Copy`}
              trailing={
                <View style={styles.copyPill}>
                  <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={15} color={Garden.ink} />
                  <Text style={styles.copyPillText}>{copied ? 'Copied' : 'Copy'}</Text>
                </View>
              }
              onPress={() => onCopyApplyLink(quick)}
            />
          );
        }
        return (
          <AdminWorkRow
            key={quick.id}
            testID={`dashboard-quick-${quick.id}`}
            divider={i > 0}
            icon="arrow-forward-circle-outline"
            tint={Garden.lav}
            title={quick.title}
            meta={quick.subtitle}
            onPress={() => onPressLink(quick)}
          />
        );
      })}
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Help                                                                */
/* ------------------------------------------------------------------ */

export function HelpCard({ onPress, index = 0 }: { onPress: () => void; index?: number }) {
  return (
    <GCard title="Need help?" tone="paper" index={index} testID="dashboard-need-help">
      <Text style={styles.copy}>{"Tell us what's going on and attach screenshots if helpful."}</Text>
      <GOutlineButton label="Get help" icon="arrow-forward" onPress={onPress} style={styles.helpCta} />
    </GCard>
  );
}

const styles = StyleSheet.create({
  focusBody: { gap: 12 },
  copy: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.soft },
  meta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  caughtUp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: Garden.mint,
    padding: 16,
  },
  caughtUpCopy: { flex: 1, gap: 2 },
  caughtUpText: { fontFamily: GardenFonts.bodyBold, fontSize: 14, lineHeight: 20, color: Garden.forestDeep },
  setupProgress: { gap: 6, marginBottom: 14 },
  liveNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Garden.mint,
    alignSelf: 'flex-start',
  },
  liveNoteText: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.forestDeep },
  signalChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  signalChipText: { fontFamily: GardenFonts.bodyExtra, fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  signalBody: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.85)',
  },
  signalCta: { alignSelf: 'flex-start', marginTop: 14 },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
  },
  copyPillText: { fontFamily: GardenFonts.bodyExtra, fontSize: 13, color: Garden.ink },
  helpCta: { alignSelf: 'flex-start', marginTop: 12 },
});
