import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  CoopActionPill,
  CoopSignedUpChip,
} from '@/components/parent/coop/garden/coop-garden-ui';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { DateStamp, GChip, GDashedRule, GKicker, GLink } from '@/components/parent/garden/ui';
import { calmEnter, staggerDelay } from '@/lib/motion/portal-motion';
import {
  canParentSignUpForTeachingRole,
  formatTeachingAssignedParents,
  formatTeachingScheduleDateRange,
  getTeachingScheduleFamilyIdsForRole,
  isTeachingParentAssigned,
  teachingScheduleWeekDisplayName,
  type TeachingScheduleParentRole,
} from '@/lib/parent/coop/teaching-schedule-helpers';
import type { ParentCoopTeachingScheduleWeek } from '@/lib/parent/parent-portal-api';

const ROLES: { role: TeachingScheduleParentRole; label: string }[] = [
  { role: 'instructor', label: 'Instructor' },
  { role: 'assistant', label: 'Assistant' },
];

/**
 * One teaching week: a ticket header (date stamp, dashed rule, name + dates,
 * Next up / Done chip), the two volunteer roles with their actions, then the
 * week's theme, lesson and event as labelled fields.
 */
export const TeachingWeekCard = memo(function TeachingWeekCard({
  week,
  index,
  isPast,
  isNext,
  currentFamilyId,
  familyNameMap,
  pendingKey,
  onToggleRole,
}: {
  week: ParentCoopTeachingScheduleWeek;
  index: number;
  isPast: boolean;
  isNext: boolean;
  currentFamilyId: string;
  familyNameMap: Record<string, string>;
  pendingKey: string | null;
  onToggleRole: (week: ParentCoopTeachingScheduleWeek, role: TeachingScheduleParentRole) => void;
}) {
  const accent = useGardenAccent();
  const name = teachingScheduleWeekDisplayName(week);
  const dates = formatTeachingScheduleDateRange(week.startDate, week.endDate);
  const theme = week.seasonalTheme.trim();
  const lesson = week.characterLesson.trim();
  const event = week.celebrationEvent?.trim() ?? '';

  return (
    <Animated.View
      entering={index < 6 ? calmEnter({ delay: staggerDelay(index) }) : undefined}
      testID={`parent-coop-teaching-week-${week.id}`}
      style={[
        styles.card,
        isNext
          ? { borderColor: accent.clay, borderWidth: 2 }
          : isPast
            ? styles.cardPast
            : null,
      ]}>
      <View style={styles.ticket}>
        <View style={isPast ? styles.dim : undefined}>
          <DateStamp date={week.startDate} />
        </View>
        <GDashedRule vertical color={Garden.ink25} style={styles.ticketRule} />
        <View style={[styles.ticketCopy, isPast && styles.dim]}>
          <Text style={styles.weekName} numberOfLines={2} accessibilityRole="header">
            {name}
          </Text>
          <Text style={styles.weekDates}>{dates}</Text>
        </View>
        {isNext ? (
          <GChip tone="info" icon="arrow-forward" label="Next up" />
        ) : isPast ? (
          <GChip tone="neutral" icon="checkmark" label="Done" />
        ) : null}
      </View>

      <View style={styles.roles}>
        {ROLES.map(({ role, label }) => {
          const familyIds = getTeachingScheduleFamilyIdsForRole(week, role);
          const signedUp = isTeachingParentAssigned(familyIds, currentFamilyId);
          const canSignUp = canParentSignUpForTeachingRole(familyIds);
          const pending = pendingKey === `${week.id}:${role}`;
          const roleWord = label.toLowerCase();
          return (
            <View key={role} style={styles.role}>
              <View style={styles.field}>
                <GKicker style={styles.fieldLabel}>{label}</GKicker>
                <Text
                  style={[styles.fieldValue, familyIds.length === 0 && styles.fieldOpen]}
                  numberOfLines={2}>
                  {formatTeachingAssignedParents(familyIds, familyNameMap)}
                </Text>
              </View>
              {signedUp ? (
                <View style={styles.signedUpRow}>
                  <CoopSignedUpChip />
                  <GLink
                    label={pending ? 'Withdrawing…' : 'Withdraw'}
                    icon={null}
                    accessibilityLabel={`Withdraw as ${roleWord} for ${name}`}
                    onPress={() => onToggleRole(week, role)}
                    style={styles.withdraw}
                  />
                </View>
              ) : canSignUp ? (
                <CoopActionPill
                  label={`Sign up as ${roleWord}`}
                  accessibilityLabel={`Sign up as ${roleWord} for ${name}, ${dates}`}
                  loading={pending}
                  disabled={Boolean(pendingKey) && !pending}
                  onPress={() => onToggleRole(week, role)}
                  style={styles.rolePill}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      {theme || lesson || event ? (
        <View style={[styles.details, isPast && styles.dim]}>
          {theme ? <DetailField label="Theme" value={theme} /> : null}
          {lesson ? <DetailField label="Lesson" value={lesson} /> : null}
          {event ? <DetailField label="Event" value={event} strong /> : null}
        </View>
      ) : null}
    </Animated.View>
  );
});

function DetailField({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.field}>
      <GKicker style={styles.fieldLabel}>{label}</GKicker>
      <Text style={[styles.detailValue, strong && styles.detailStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    padding: 16,
    gap: 14,
  },
  cardPast: { backgroundColor: Garden.paper, borderColor: Garden.ink06 },
  dim: { opacity: 0.7 },
  ticket: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // Fixed height: a stretched vertical rule sizes to its 60 dashes and blows the row up.
  ticketRule: { alignSelf: 'center', height: 58 },
  ticketCopy: { flex: 1, minWidth: 0, gap: 2 },
  weekName: {
    fontFamily: GardenFonts.display,
    fontSize: 19,
    lineHeight: 23,
    letterSpacing: -0.3,
    color: Garden.ink,
  },
  weekDates: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  roles: {
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Garden.ink10,
  },
  role: { gap: 8 },
  field: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  fieldLabel: { width: 108, paddingTop: 1 },
  fieldValue: {
    flex: 1,
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 15,
    lineHeight: 20,
    color: Garden.ink,
  },
  fieldOpen: { fontFamily: GardenFonts.bodySemi, color: Garden.soft },
  rolePill: { marginLeft: 118 },
  signedUpRow: {
    marginLeft: 118,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  withdraw: { minHeight: 32 },
  details: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Garden.ink10,
  },
  detailValue: {
    flex: 1,
    fontFamily: GardenFonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: Garden.soft,
  },
  detailStrong: { fontFamily: GardenFonts.bodyExtra, color: Garden.ink },
});
