import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { SchoolAdminCommitteeActivityFeed } from '@/components/school-admin/committees/school-admin-committee-activity-feed';
import { StoryCard } from '@/components/story/story-card';
import { StoryDisplayHeading } from '@/components/story/story-display-heading';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { StoryTextLink } from '@/components/story/story-text-link';
import { useParentTheme } from '@/contexts/parent-theme-context';
import type { CommitteeActivityItem, CommitteeWorkspaceSection } from '@/lib/parent/parent-committees-types';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import { fetchAdminCommitteeActivity } from '@/lib/school-admin-api';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';
import { createSchoolAdminErrorReporter } from '@/lib/mobile-error-reporter';

export function SchoolAdminCommitteeHomeSection({
  committee,
  organizationId,
  schoolSlug,
  onNavigate,
}: ParentCommitteeSectionProps) {
  const theme = useParentTheme();
  const reportError = createSchoolAdminErrorReporter(organizationId);

  const [activityItems, setActivityItems] = useState<CommitteeActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const upcomingEvents = committee.events.slice(0, 3);
  const urgentTasks = committee.tasks.filter((task) => task.status !== 'done').slice(0, 4);
  const leaders = committee.members.filter((member) => member.role === 'lead');

  const quickLinks = [
    {
      section: 'resources' as const,
      label: 'Resources',
      icon: 'document-text-outline' as const,
      sub: `${committee.resources.length} guides & links`,
    },
    {
      section: 'calendar' as const,
      label: 'Calendar',
      icon: 'calendar-outline' as const,
      sub: `${committee.events.length} upcoming dates`,
    },
    {
      section: 'messages' as const,
      label: 'Messages',
      icon: 'chatbubble-outline' as const,
      sub: `${committee.messages.length} recent posts`,
    },
  ];

  useEffect(() => {
    if (!schoolSlug) return;

    let cancelled = false;
    (async () => {
      setLoadingActivity(true);
      try {
        const items = await fetchAdminCommitteeActivity(organizationId, schoolSlug, {
          committeeId: committee.id,
          limit: 8,
        });
        if (!cancelled) setActivityItems(items);
      } catch (error) {
        reportError('committees.activity.home_load', error, {
          entityType: 'committee',
          entityId: committee.id,
        });
        if (!cancelled) setActivityItems([]);
      } finally {
        if (!cancelled) setLoadingActivity(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [committee.id, organizationId, reportError, schoolSlug]);

  const navigate = onNavigate ?? (() => undefined);

  return (
    <View style={styles.container}>
      <StoryCard style={{ ...styles.welcomeCard, backgroundColor: '#EAF4EB', borderColor: '#C7DFCB' }}>
        <StorySectionKicker>{committee.termLabel}</StorySectionKicker>
        <StoryDisplayHeading size="section" style={styles.welcomeTitle}>
          Welcome to {committee.name}
        </StoryDisplayHeading>
        <Text style={[styles.welcomeCopy, { color: theme.muted }]}>{committee.description}</Text>
        {leaders.length > 0 ? (
          <Text style={[styles.leadersCopy, { color: theme.muted }]}>
            Led by {leaders.map((leader) => leader.name).join(', ')}
          </Text>
        ) : null}
      </StoryCard>

      <View style={styles.quickLinks}>
        {quickLinks.map((link) => (
          <Pressable
            key={link.section}
            accessibilityRole="button"
            onPress={() => navigate(link.section)}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
            <StoryCard compact style={styles.quickLinkCard}>
              <Ionicons name={link.icon} size={18} color={theme.primary} />
              <Text style={[styles.quickLinkValue, { color: theme.ink }]}>
                {link.sub.split(' ')[0]}
              </Text>
              <Text style={[styles.quickLinkLabel, { color: theme.muted }]}>
                {link.label} · {link.sub}
              </Text>
            </StoryCard>
          </Pressable>
        ))}
      </View>

      <StoryCard compact style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <StoryDisplayHeading size="section" style={styles.panelTitle}>
            Upcoming dates
          </StoryDisplayHeading>
          <StoryTextLink label="View all →" onPress={() => navigate('calendar')} />
        </View>
        {upcomingEvents.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>No upcoming dates.</Text>
        ) : (
          upcomingEvents.map((event) => (
            <View
              key={event.id}
              style={[styles.eventRow, { borderColor: '#E0E7E0', backgroundColor: theme.white }]}>
              <View style={[styles.dateBadge, { backgroundColor: '#EAF4EB' }]}>
                <Text style={[styles.dateMonth, { color: theme.primary }]}>
                  {new Date(`${event.date}T00:00:00`)
                    .toLocaleDateString('en-US', { month: 'short' })
                    .toUpperCase()}
                </Text>
                <Text style={[styles.dateDay, { color: theme.primary }]}>
                  {new Date(`${event.date}T00:00:00`).getDate()}
                </Text>
              </View>
              <View style={styles.eventCopy}>
                <Text style={[styles.eventTitle, { color: theme.ink }]}>{event.title}</Text>
                <Text style={[styles.eventMeta, { color: theme.muted }]}>
                  {event.type}
                  {event.time ? ` · ${event.time}` : ''}
                  {event.location ? ` · ${event.location}` : ''}
                </Text>
              </View>
            </View>
          ))
        )}
      </StoryCard>

      <StoryCard compact style={styles.panelCard}>
        <View style={styles.panelHeader}>
          <StoryDisplayHeading size="section" style={styles.panelTitle}>
            Action items
          </StoryDisplayHeading>
          <StoryTextLink label="View tasks →" onPress={() => navigate('tasks')} />
        </View>
        {urgentTasks.length === 0 ? (
          <Text style={[styles.emptyCopy, { color: theme.muted }]}>No open tasks.</Text>
        ) : (
          urgentTasks.map((task) => (
            <View
              key={task.id}
              style={[styles.taskRow, { borderColor: '#E0E7E0', backgroundColor: theme.white }]}>
              <Ionicons name="checkbox-outline" size={16} color={theme.primary} />
              <View style={styles.taskCopy}>
                <Text style={[styles.taskTitle, { color: theme.ink }]}>{task.title}</Text>
                <Text style={[styles.taskMeta, { color: theme.muted }]}>
                  {task.assigneeName ?? 'Unassigned'}
                  {task.dueDate
                    ? ` · Due ${new Date(`${task.dueDate}T00:00:00`).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}`
                    : ''}
                </Text>
              </View>
            </View>
          ))
        )}
      </StoryCard>

      <StoryCard compact style={styles.panelCard}>
        {loadingActivity ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : (
          <SchoolAdminCommitteeActivityFeed
            items={activityItems}
            compact
            title="Recent activity"
            onViewAll={() => navigate('activity' as CommitteeWorkspaceSection)}
          />
        )}
      </StoryCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  welcomeCard: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  welcomeTitle: {
    fontSize: 22,
  },
  welcomeCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  leadersCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  quickLinks: {
    gap: Spacing.two,
  },
  quickLinkCard: {
    padding: StoryCardPadding,
    gap: Spacing.one,
  },
  quickLinkValue: {
    fontFamily: StoryFonts.display,
    fontSize: 20,
    fontWeight: '700',
  },
  quickLinkLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  panelCard: {
    padding: StoryCardPadding,
    gap: Spacing.two,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  panelTitle: {
    fontSize: 18,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  eventRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  dateBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 9,
  },
  dateDay: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 12,
  },
  eventCopy: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
  },
  eventMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  taskCopy: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
  },
  taskMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  loadingRow: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
