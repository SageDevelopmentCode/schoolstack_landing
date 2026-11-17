import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GChip, GOutlineButton, GPressable, GProgress, GTick } from '@/components/parent/garden/ui';
import { haptic } from '@/lib/haptics';
import type { TeacherDocGuide } from '@/lib/teacher/teacher-portal-api';

/**
 * How-to guide as a walkthrough: numbered steps on a rail, the current step
 * highlighted, a tick per step so the teacher can keep their place, and each
 * step's action as an outline button. Ticks are local to this open sheet.
 */
export function TeacherGuideSheet({
  guide: openGuide,
  onClose,
  onStepAction,
}: {
  guide: TeacherDocGuide | null;
  onClose: () => void;
  /** Closes the sheet first, then navigates or explains (feedback hook). */
  onStepAction: (href: string) => void;
}) {
  const accent = useGardenAccent();
  const [done, setDone] = useState<Set<number>>(() => new Set());

  // Keep showing the last guide while the sheet animates closed; fresh ticks per guide.
  const [guide, setGuide] = useState(openGuide);
  if (openGuide && openGuide !== guide) {
    setGuide(openGuide);
    setDone(new Set());
  }

  const steps = guide?.steps ?? [];
  const total = steps.length;
  const doneCount = steps.filter((_, i) => done.has(i)).length;
  const currentIndex = steps.findIndex((_, i) => !done.has(i));
  const allDone = total > 0 && doneCount === total;

  const toggle = (index: number) => {
    setDone((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
        haptic.select();
      } else {
        next.add(index);
        if (next.size === total) haptic.success();
        else haptic.select();
      }
      return next;
    });
  };

  return (
    <GSheet
      visible={openGuide !== null}
      onClose={onClose}
      title={guide?.title ?? 'How-to guide'}
      subtitle={guide?.summary}
      accessibilityLabel={`Close ${guide?.title ?? 'how-to guide'}`}
      headerAside={
        allDone ? (
          <GChip label="All done" tone="success" icon="checkmark" />
        ) : (
          <GChip label={`${total} step${total === 1 ? '' : 's'}`} tone="info" />
        )
      }
      footer={
        total > 0 ? (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {allDone ? 'Nice work. You finished every step.' : `${doneCount} of ${total} steps ticked off`}
            </Text>
            <GProgress
              value={total ? doneCount / total : 0}
              done={allDone}
              label={`${doneCount} of ${total} steps ticked off`}
            />
          </View>
        ) : undefined
      }>
      <View accessibilityRole="list" style={styles.list}>
        {steps.map((step, index) => {
          const isDone = done.has(index);
          const isCurrent = index === currentIndex;
          const last = index === total - 1;
          return (
            <View key={`${guide?.id}-step-${index}`} style={styles.row}>
              <View style={styles.rail}>
                <GPressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isDone }}
                  accessibilityLabel={`Step ${index + 1} of ${total}: ${step.title}. ${
                    isDone ? 'Ticked off' : 'Tick off'
                  }`}
                  haptic="none"
                  hitSlop={10}
                  onPress={() => toggle(index)}>
                  {isDone ? (
                    <GTick size={30} />
                  ) : (
                    <View
                      style={[
                        styles.marker,
                        isCurrent
                          ? { backgroundColor: accent.clay, borderColor: accent.clay }
                          : { backgroundColor: Garden.white, borderColor: Garden.ink60 },
                      ]}>
                      <Text style={[styles.markerText, { color: isCurrent ? Garden.white : Garden.ink }]}>
                        {index + 1}
                      </Text>
                    </View>
                  )}
                </GPressable>
                {!last ? (
                  <View
                    style={[styles.connector, { backgroundColor: isDone ? Garden.forest : Garden.ink15 }]}
                  />
                ) : null}
              </View>
              <View
                style={[
                  styles.card,
                  isCurrent && { borderColor: accent.clay, backgroundColor: accent.wash },
                  isDone && styles.cardDone,
                  !last && styles.cardSpaced,
                ]}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, isDone && styles.titleDone]}>{step.title}</Text>
                  {isCurrent ? <GChip label="Up next" tone="warning" /> : null}
                </View>
                <Text style={styles.description}>{step.description}</Text>
                <View style={styles.actions}>
                  {step.action ? (
                    <GOutlineButton
                      label={step.action.label}
                      icon="arrow-forward"
                      onPress={() => onStepAction(step.action!.href)}
                    />
                  ) : null}
                  <GPressable
                    accessibilityLabel={isDone ? `Untick step ${index + 1}` : `Mark step ${index + 1} done`}
                    haptic="none"
                    hitSlop={8}
                    onPress={() => toggle(index)}
                    style={styles.markDone}>
                    <Ionicons
                      name={isDone ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
                      size={16}
                      color={accent.clayDeep}
                    />
                    <Text style={[styles.markDoneText, { color: accent.clayDeep }]}>
                      {isDone ? 'Undo' : 'Mark done'}
                    </Text>
                  </GPressable>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </GSheet>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 30 },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: { fontFamily: GardenFonts.bodyExtra, fontSize: 13 },
  connector: { flex: 1, width: 2, marginVertical: 4, borderRadius: 1, minHeight: 14 },
  card: {
    flex: 1,
    gap: 6,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.white,
  },
  cardDone: { backgroundColor: Garden.paper, borderColor: Garden.ink06 },
  cardSpaced: { marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontFamily: GardenFonts.bodyExtra, fontSize: 15.5, lineHeight: 21, color: Garden.ink },
  titleDone: { color: Garden.soft, textDecorationLine: 'line-through' },
  description: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 20, color: Garden.soft },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 6 },
  markDone: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 40 },
  markDoneText: { fontFamily: GardenFonts.bodyExtra, fontSize: 13.5 },
  footer: { gap: 8, paddingBottom: 6 },
  footerText: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
});
