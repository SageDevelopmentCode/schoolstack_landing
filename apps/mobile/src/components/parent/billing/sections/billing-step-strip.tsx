import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';

export type BillingStepState = 'done' | 'current' | 'todo';

/** Numbered "1 → 2 → 3" tracker for a short flow (pay sheet, schedule picker). */
export function BillingStepStrip({
  steps,
}: {
  steps: { label: string; state: BillingStepState }[];
}) {
  const accent = useGardenAccent();
  const currentIndex = steps.findIndex((step) => step.state === 'current');
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${currentIndex + 1} of ${steps.length}: ${steps[currentIndex]?.label ?? ''}`}
      style={styles.strip}>
      {steps.map((step, i) => {
        const done = step.state === 'done';
        const current = step.state === 'current';
        return (
          <Fragment key={step.label}>
            {i > 0 ? (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: done || current ? accent.clay : Garden.ink15 },
                ]}
              />
            ) : null}
            <View style={styles.step}>
              <View
                style={[
                  styles.dot,
                  done && { backgroundColor: accent.clay, borderColor: accent.clay },
                  current && { borderColor: accent.clay, backgroundColor: accent.wash },
                ]}>
                {done ? (
                  <Ionicons name="checkmark" size={14} color={Garden.white} />
                ) : (
                  <Text style={[styles.number, current && { color: accent.clayDeep }]}>{i + 1}</Text>
                )}
              </View>
              <Text
                numberOfLines={1}
                style={[styles.label, (done || current) && styles.labelActive]}>
                {step.label}
              </Text>
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  step: {
    alignItems: 'center',
    gap: 4,
    width: 78,
  },
  connector: {
    flex: 1,
    height: 2,
    marginTop: 13,
    marginHorizontal: -20,
    borderRadius: 1,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Garden.ink25,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 13,
    color: Garden.ink60,
  },
  label: {
    fontFamily: GardenFonts.bodyBold,
    fontSize: 12,
    color: Garden.soft,
  },
  labelActive: {
    color: Garden.ink,
  },
});
