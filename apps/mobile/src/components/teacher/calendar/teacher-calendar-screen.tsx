import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ParentCalendarSkeleton } from '@/components/parent/calendar/parent-calendar-skeleton';
import { TeacherCalendarManageView } from '@/components/teacher/calendar/teacher-calendar-manage-view';
import { TeacherCalendarReadonlyView } from '@/components/teacher/calendar/teacher-calendar-readonly-view';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StoryErrorBanner } from '@/components/story/story-error-banner';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useTeacherCalendar } from '@/contexts/teacher-calendar-context';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { Story, StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type TeacherCalendarScreenProps = {
  organizationId: string;
  slug: string;
};

function teacherFeatureEnabled(
  features: { teacher?: Record<string, boolean> } | undefined,
  key: string,
): boolean {
  const teacher = features?.teacher;
  if (!teacher || typeof teacher !== 'object') return false;
  return Boolean(teacher[key]);
}

export function TeacherCalendarScreen({ organizationId }: TeacherCalendarScreenProps) {
  const theme = useParentTheme();
  const { data: homeData, ensureLoaded: ensureHomeLoaded } = useTeacherHome();
  const { data, isLoading, isRefreshing, error, ensureLoaded, refresh } = useTeacherCalendar();

  useEffect(() => {
    ensureHomeLoaded();
    ensureLoaded();
  }, [ensureHomeLoaded, ensureLoaded]);

  const calendarEnabled = teacherFeatureEnabled(homeData?.features, 'calendar');

  if (!calendarEnabled && homeData) {
    return (
      <View style={styles.centered}>
        <StoryCard compact style={styles.disabledCard}>
          <StorySectionKicker>Calendar</StorySectionKicker>
          <StoryDisplayHeading size="section" style={styles.disabledHeading}>
            Calendar is not enabled
          </StoryDisplayHeading>
          <Text style={[styles.disabledCopy, { color: theme.muted }]}>
            Your school has not turned on the calendar for teachers in the mobile app.
          </Text>
        </StoryCard>
      </View>
    );
  }

  if (isLoading && !data) {
    return <ParentCalendarSkeleton />;
  }

  if (error && !data) {
    return (
      <View style={styles.centered}>
        <StoryErrorBanner message={error} />
        <StoryButton label="Try again" onPress={() => void refresh()} style={styles.retry} />
      </View>
    );
  }

  if (!data) {
    return <ParentCalendarSkeleton />;
  }

  if (data.canManageEvents) {
    return (
      <TeacherCalendarManageView
        organizationId={organizationId}
        events={data.events}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />
    );
  }

  return (
    <TeacherCalendarReadonlyView
      organizationId={organizationId}
      events={data.events}
      timezone={data.timezone}
      isRefreshing={isRefreshing}
      onRefresh={refresh}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    gap: Spacing.three,
    backgroundColor: Story.paper,
  },
  disabledCard: {
    width: '100%',
    gap: Spacing.two,
  },
  disabledHeading: {
    marginTop: 4,
  },
  disabledCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  retry: {
    minWidth: 160,
  },
});
