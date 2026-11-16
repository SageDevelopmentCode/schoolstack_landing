import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, type GChipTone } from '@/components/parent/garden/tokens';
import { GChip, GPressable } from '@/components/parent/garden/ui';
import { AdminIconChip } from '@/components/school-admin/garden/admin-ui';
import type { AdminScheduledVisit } from '@/lib/admissions/admin-scheduled-visits';
import type { ScheduledVisitTiming } from '@/lib/admissions/admissions-availability';

const TIMING: Record<ScheduledVisitTiming, { label: string; tone: GChipTone }> = {
  happening: { label: 'Now', tone: 'success' },
  past: { label: 'Past', tone: 'neutral' },
  upcoming: { label: 'Upcoming', tone: 'info' },
};

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  schedule_campus_tour: 'walk-outline',
  schedule_family_interview: 'chatbubbles-outline',
  schedule_observation_day: 'school-outline',
};

const TYPE_TINT: Record<string, string> = {
  schedule_campus_tour: Garden.sky,
  schedule_family_interview: Garden.lav,
  schedule_observation_day: Garden.mint,
};

/** Booked visit row: type icon, step title, student · when, form title, timing chip. Opens the application. */
export const VisitRow = memo(function VisitRow({
  visit,
  onPress,
  showFormTitle = false,
  divider = false,
}: {
  visit: AdminScheduledVisit;
  onPress?: () => void;
  showFormTitle?: boolean;
  divider?: boolean;
}) {
  const timing = TIMING[visit.timing] ?? TIMING.upcoming;
  const body = (
    <>
      <AdminIconChip name={TYPE_ICON[visit.actionType] ?? 'calendar-outline'} tint={TYPE_TINT[visit.actionType] ?? Garden.sky} />
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {visit.stepTitle}
        </Text>
        <Text numberOfLines={2} style={styles.meta}>
          {visit.studentLabel ?? 'Student pending'} · {visit.whenLabel}
        </Text>
        {showFormTitle ? (
          <Text numberOfLines={1} style={styles.meta}>
            {visit.formTitle}
          </Text>
        ) : null}
      </View>
      <GChip label={timing.label} tone={timing.tone} />
      {onPress ? <Ionicons name="chevron-forward" size={16} color={Garden.ink60} /> : null}
    </>
  );
  const label = `${visit.stepTitle}. ${visit.studentLabel ?? 'Student pending'}. ${visit.whenLabel}. ${timing.label}`;
  if (!onPress) {
    return (
      <View style={[styles.row, divider && styles.divider]} accessible accessibilityLabel={label}>
        {body}
      </View>
    );
  }
  return (
    <GPressable accessibilityLabel={label} accessibilityHint="Opens the application" pressedScale={0.985} onPress={onPress} style={[styles.row, divider && styles.divider]}>
      {body}
    </GPressable>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingVertical: 10 },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  meta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
});
