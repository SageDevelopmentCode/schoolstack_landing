import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GCard, GHand, GProgress, GPressable, GTick } from '@/components/parent/garden/ui';
import type {
  ParentBillingSetupProgress,
  ParentBillingSetupStep,
  ParentBillingSetupStepKey,
} from '@/lib/tuition/parent-billing-setup-steps';

function StepMarker({ step, number }: { step: ParentBillingSetupStep; number: number }) {
  if (step.status === 'done') return <GTick size={28} />;
  if (step.status === 'waiting') {
    return (
      <View style={[styles.marker, styles.markerWaiting]}>
        <Ionicons name="hourglass-outline" size={14} color={Garden.ink60} />
      </View>
    );
  }
  return (
    <View style={[styles.marker, styles.markerTodo]}>
      <Text style={styles.markerText}>{number}</Text>
    </View>
  );
}

const STATUS_LABEL: Record<ParentBillingSetupStep['status'], string> = {
  done: 'Done',
  todo: 'To do',
  waiting: 'Waiting on your school',
};

/**
 * "Tuition setup": the four steps from choosing a plan to paying, so the parent
 * always knows what is next. Mirrors the web BillingSetupCard.
 */
export function BillingSetupCard({
  progress,
  onStep,
  index = 0,
}: {
  progress: ParentBillingSetupProgress;
  onStep: (key: ParentBillingSetupStepKey) => void;
  index?: number;
}) {
  const accent = useGardenAccent();
  if (progress.totalCount === 0) return null;

  if (progress.allDone) {
    return (
      <GCard index={index} title="Tuition setup" tone="paper">
        <View style={styles.allDone}>
          <GTick size={36} />
          <View style={styles.allDoneCopy}>
            <Text style={styles.allDoneTitle}>You&apos;re all set for tuition</Text>
            <Text style={styles.allDoneMeta}>
              {progress.doneCount} of {progress.totalCount} steps done
            </Text>
          </View>
        </View>
        <GHand>all squared away ✿</GHand>
      </GCard>
    );
  }

  return (
    <GCard
      index={index}
      title={`${progress.doneCount} of ${progress.totalCount} steps done`}>
      <GProgress
        value={progress.doneCount / progress.totalCount}
        label={`Tuition setup, ${progress.doneCount} of ${progress.totalCount} steps done`}
        style={styles.progress}
      />
      <View style={styles.list}>
        {progress.steps.map((step, i) => {
          const current = step.key === progress.currentKey;
          const actionable = step.status === 'todo';
          const content = (
            <>
              <StepMarker step={step} number={i + 1} />
              <View style={styles.copy}>
                <Text
                  style={[styles.label, step.status === 'done' && styles.labelDone]}
                  numberOfLines={1}>
                  {step.label}
                </Text>
                <Text style={styles.detail} numberOfLines={2}>
                  {step.detail}
                </Text>
              </View>
              {actionable ? (
                <View style={styles.go}>
                  {current ? (
                    <Text style={[styles.goText, { color: accent.clayDeep }]}>Go</Text>
                  ) : null}
                  <Ionicons name="arrow-forward" size={15} color={accent.clayDeep} />
                </View>
              ) : null}
            </>
          );
          const rowStyle = [styles.row, current && { backgroundColor: accent.wash }];
          return actionable ? (
            <GPressable
              key={step.key}
              accessibilityLabel={`Step ${i + 1}: ${step.label}. ${step.detail}. ${STATUS_LABEL[step.status]}`}
              accessibilityHint="Takes you to this step"
              pressedScale={0.98}
              haptic={current ? 'press' : 'tap'}
              onPress={() => onStep(step.key)}
              style={rowStyle}>
              {content}
            </GPressable>
          ) : (
            <View
              key={step.key}
              accessible
              accessibilityLabel={`Step ${i + 1}: ${step.label}. ${step.detail}. ${STATUS_LABEL[step.status]}`}
              style={rowStyle}>
              {content}
            </View>
          );
        })}
      </View>
    </GCard>
  );
}

const styles = StyleSheet.create({
  progress: {
    marginTop: 12,
  },
  list: {
    marginTop: 10,
    gap: 2,
    marginHorizontal: -8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 14,
  },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerTodo: {
    borderWidth: 2,
    borderColor: Garden.ink,
    backgroundColor: Garden.white,
  },
  markerWaiting: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Garden.ink25,
    backgroundColor: Garden.paper,
  },
  markerText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
    color: Garden.ink,
  },
  copy: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  labelDone: {
    color: Garden.ink65,
  },
  detail: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  go: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  goText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
  },
  allDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: Garden.mint,
  },
  allDoneCopy: {
    flex: 1,
  },
  allDoneTitle: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 16,
    color: Garden.forest,
  },
  allDoneMeta: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    color: Garden.forest,
  },
});
