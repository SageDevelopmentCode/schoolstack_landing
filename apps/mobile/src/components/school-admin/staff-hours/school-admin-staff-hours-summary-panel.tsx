import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryDateField } from '@/components/story/story-date-field';
import { StoryTextLink } from '@/components/story/story-text-link';
import { SchoolAdminStaffHoursSessionRow } from '@/components/school-admin/staff-hours/school-admin-staff-hours-session-row';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { formatHoursMinutes } from '@/lib/teacher/my-hours/format-duration';
import { galleryPhotoDateToDate } from '@/lib/school-gallery/gallery-photo-date';
import type {
  AdminStaffHoursPageData,
  AdminStaffHoursSessionRow,
  AdminStaffHoursSummaryRow,
} from '@/lib/school-admin/staff-hours/staff-hours-types';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

const TABLE_LINE = '#EDF1ED';

type SchoolAdminStaffHoursSummaryPanelProps = {
  pageData: AdminStaffHoursPageData;
  summaryFrom: string;
  summaryTo: string;
  staffFilter: string;
  staffFilterLabel: string;
  loading: boolean;
  expandedStaffId: string | null;
  onSummaryFromChange: (value: string) => void;
  onSummaryToChange: (value: string) => void;
  onOpenStaffPicker: () => void;
  onApply: () => void;
  onToggleExpanded: (staffMemberId: string | null) => void;
  sessionsForStaff: (staffMemberId: string) => AdminStaffHoursSessionRow[];
};

function FilterLabel({ children }: { children: string }) {
  const theme = useParentTheme();
  return (
    <Text style={[styles.filterLabel, { color: theme.muted }]}>{children.toUpperCase()}</Text>
  );
}

function SummaryStaffRow({
  row,
  expanded,
  sessions,
  onToggle,
  isFirst,
}: {
  row: AdminStaffHoursSummaryRow;
  expanded: boolean;
  sessions: AdminStaffHoursSessionRow[];
  onToggle: () => void;
  isFirst: boolean;
}) {
  const theme = useParentTheme();

  return (
    <View
      style={[
        styles.summaryRowWrap,
        !isFirst && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: TABLE_LINE },
      ]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryMain}>
          <Text style={[styles.staffName, { color: theme.ink }]}>{row.staffName}</Text>
          <Text style={[styles.roleTitle, { color: theme.muted }]}>
            {row.roleTitle ?? '—'}
          </Text>
        </View>
        <View style={styles.summaryStats}>
          <Text style={[styles.statMeta, { color: theme.muted }]}>
            {row.daysWorked}d · {row.sessionCount} sessions
          </Text>
          <Text style={[styles.totalHours, { color: theme.ink }]}>
            {formatHoursMinutes(row.totalMinutes)}
          </Text>
        </View>
        <StoryTextLink label={expanded ? 'Hide' : 'Sessions'} onPress={onToggle} />
      </View>
      {expanded ? (
        <View style={styles.expandedSessions}>
          {sessions.length === 0 ? (
            <Text style={[styles.emptyCopy, { color: theme.muted }]}>No sessions in range.</Text>
          ) : (
            sessions.map((session, index) => (
              <SchoolAdminStaffHoursSessionRow
                key={session.id}
                session={session}
                isFirst={index === 0}
              />
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

export function SchoolAdminStaffHoursSummaryPanel({
  pageData,
  summaryFrom,
  summaryTo,
  staffFilterLabel,
  loading,
  expandedStaffId,
  onSummaryFromChange,
  onSummaryToChange,
  onOpenStaffPicker,
  onApply,
  onToggleExpanded,
  sessionsForStaff,
}: SchoolAdminStaffHoursSummaryPanelProps) {
  const theme = useParentTheme();

  const minToDate = useMemo(() => galleryPhotoDateToDate(summaryFrom) ?? undefined, [summaryFrom]);
  const maxFromDate = useMemo(() => galleryPhotoDateToDate(summaryTo) ?? undefined, [summaryTo]);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(350)}>
        <StoryCard style={styles.filterCard}>
          <StoryDateField
            label="From"
            value={summaryFrom}
            onChange={onSummaryFromChange}
            maximumDate={maxFromDate}
          />
          <StoryDateField
            label="To"
            value={summaryTo}
            onChange={onSummaryToChange}
            minimumDate={minToDate}
          />
          <View style={styles.staffField}>
            <FilterLabel>Staff</FilterLabel>
            <Pressable
              accessibilityRole="button"
              onPress={onOpenStaffPicker}
              style={[styles.staffTrigger, { borderColor: theme.line }]}>
              <Text style={[styles.staffTriggerText, { color: theme.ink }]}>
                {staffFilterLabel}
              </Text>
            </Pressable>
          </View>
          <StoryButton
            label={loading ? 'Loading…' : 'Apply'}
            onPress={onApply}
            disabled={loading}
          />
        </StoryCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40).duration(350)}>
        <StoryCard style={styles.sectionCardOuter}>
          <View style={[styles.sectionHeader, { borderBottomColor: TABLE_LINE }]}>
            <Text style={[styles.sectionTitle, { color: theme.ink }]}>Hours by staff</Text>
          </View>
          <View style={styles.sectionBody}>
            {pageData.summaryRows.length === 0 ? (
              <Text style={[styles.emptyCopy, { color: theme.muted }]}>
                No staff to show for this range.
              </Text>
            ) : (
              pageData.summaryRows.map((row, index) => (
                <SummaryStaffRow
                  key={row.staffMemberId}
                  row={row}
                  isFirst={index === 0}
                  expanded={expandedStaffId === row.staffMemberId}
                  sessions={sessionsForStaff(row.staffMemberId)}
                  onToggle={() =>
                    onToggleExpanded(
                      expandedStaffId === row.staffMemberId ? null : row.staffMemberId,
                    )
                  }
                />
              ))
            )}
          </View>
        </StoryCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  filterCard: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  filterLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: Spacing.one,
  },
  staffField: {
    gap: Spacing.one,
  },
  staffTrigger: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  staffTriggerText: {
    fontFamily: StoryFonts.body,
    fontSize: 15,
  },
  sectionCardOuter: {
    padding: 0,
    overflow: 'hidden',
  },
  sectionHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: StoryCardPadding,
    paddingVertical: Spacing.three,
  },
  sectionTitle: {
    fontFamily: StoryFonts.display,
    fontSize: 17,
    fontWeight: '600',
  },
  sectionBody: {
    paddingHorizontal: StoryCardPadding,
    paddingBottom: StoryCardPadding,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: Spacing.two,
  },
  summaryRowWrap: {},
  summaryRow: {
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  summaryMain: {
    gap: 4,
  },
  staffName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  roleTitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  statMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
  totalHours: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  expandedSessions: {
    paddingBottom: Spacing.two,
    paddingLeft: Spacing.one,
  },
});
