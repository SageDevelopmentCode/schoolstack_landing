import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  Garden,
  GardenFonts,
  useGardenAccent,
  type GChipTone,
} from '@/components/parent/garden/tokens';
import { GChip, GPressable, GTick } from '@/components/parent/garden/ui';

export type GStepState = 'done' | 'current' | 'todo' | 'blocked';

export type GStep = {
  id: string;
  title: string;
  meta?: string | null;
  state: GStepState;
  chip?: { label: string; tone: GChipTone } | null;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
};

const STATE_SPOKEN: Record<GStepState, string> = {
  done: 'done',
  current: 'up next',
  todo: 'to do',
  blocked: 'locked',
};

/** Numbered marker: tick (done), accent ring with number (current), outline number (to do). */
function StepMarker({ state, index }: { state: GStepState; index: number }) {
  const accent = useGardenAccent();
  if (state === 'done') return <GTick size={28} />;
  if (state === 'blocked') {
    return (
      <View style={[styles.marker, { borderColor: Garden.ink25, backgroundColor: Garden.ink06 }]}>
        <Ionicons name="lock-closed" size={13} color={Garden.ink60} />
      </View>
    );
  }
  const current = state === 'current';
  return (
    <View
      style={[
        styles.marker,
        current
          ? { borderColor: accent.clay, backgroundColor: accent.clay }
          : { borderColor: Garden.ink60, backgroundColor: Garden.white },
      ]}>
      <Text style={[styles.markerText, { color: current ? Garden.white : Garden.ink }]}>
        {index + 1}
      </Text>
    </View>
  );
}

/**
 * Vertical step timeline. Each row can open something (`onPress`); the connector
 * between markers turns forest once the step above is done.
 */
export function GStepList({
  steps,
  style,
  accessibilityLabel,
}: {
  steps: GStep[];
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const accent = useGardenAccent();
  return (
    <View style={style} accessibilityLabel={accessibilityLabel} accessibilityRole="list">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        const spoken = `Step ${index + 1} of ${steps.length}, ${step.title}, ${
          step.chip?.label ?? STATE_SPOKEN[step.state]
        }${step.meta ? `. ${step.meta}` : ''}`;
        const body = (
          <>
            <View style={styles.rail}>
              <StepMarker state={step.state} index={index} />
              {!last ? (
                <View
                  style={[
                    styles.connector,
                    { backgroundColor: step.state === 'done' ? Garden.forest : Garden.ink15 },
                  ]}
                />
              ) : null}
            </View>
            <View style={[styles.copy, !last && styles.copySpaced]}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.title,
                    step.state === 'current' && { color: accent.clayDeep },
                    step.state === 'blocked' && { color: Garden.soft },
                  ]}
                  numberOfLines={2}>
                  {step.title}
                </Text>
                {step.onPress ? (
                  <Ionicons name="chevron-forward" size={18} color={Garden.ink60} />
                ) : null}
              </View>
              {step.meta ? <Text style={styles.meta}>{step.meta}</Text> : null}
              {step.chip ? (
                <GChip label={step.chip.label} tone={step.chip.tone} style={styles.chip} />
              ) : null}
            </View>
          </>
        );
        if (step.onPress) {
          return (
            <GPressable
              key={step.id}
              testID={step.testID}
              accessibilityLabel={step.accessibilityLabel ?? `${spoken}. Open`}
              pressedScale={0.99}
              onPress={step.onPress}
              style={styles.row}>
              {body}
            </GPressable>
          );
        }
        return (
          <View
            key={step.id}
            testID={step.testID}
            accessible
            accessibilityLabel={step.accessibilityLabel ?? spoken}
            style={styles.row}>
            {body}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, minHeight: 48 },
  rail: { alignItems: 'center', width: 28 },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: { fontFamily: GardenFonts.bodyExtra, fontSize: 13 },
  connector: { flex: 1, width: 2, marginVertical: 4, borderRadius: 1, minHeight: 14 },
  copy: { flex: 1, paddingTop: 3, gap: 3 },
  copySpaced: { paddingBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontFamily: GardenFonts.bodyExtra, fontSize: 15.5, color: Garden.ink },
  meta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  chip: { alignSelf: 'flex-start', marginTop: 4 },
});
