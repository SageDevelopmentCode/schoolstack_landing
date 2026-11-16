import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { DateStamp, GCard, GLink, GPressable } from '@/components/parent/garden/ui';
import { AdminCommitteeActivity } from '@/components/school-admin/committees/garden/admin-committee-activity';
import { AdminWorkRow } from '@/components/school-admin/garden/admin-ui';
import { useAdminAction } from '@/components/school-admin/garden/use-admin-action';
import type { ParentCommitteeSectionProps } from '@/lib/parent/committees/section-props';
import type { CommitteeActivityItem } from '@/lib/parent/parent-committees-types';
import { fetchAdminCommitteeActivity } from '@/lib/school-admin-api';

/** Admin workspace › Home: quick links, upcoming dates, open tasks, recent activity (same data as Story). */
export function AdminCommitteeHome({ committee, organizationId, schoolSlug, onNavigate }: ParentCommitteeSectionProps) {
  const accent = useGardenAccent();
  const { reportError } = useAdminAction(organizationId);
  const [activity, setActivity] = useState<CommitteeActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(Boolean(schoolSlug));
  const navigate = onNavigate ?? (() => undefined);
  const upcomingEvents = committee.events.slice(0, 3);
  const openTasks = committee.tasks.filter((task) => task.status !== 'done').slice(0, 4);

  useEffect(() => {
    if (!schoolSlug) return;
    let cancelled = false;
    (async () => {
      try {
        const items = await fetchAdminCommitteeActivity(organizationId, schoolSlug, { committeeId: committee.id, limit: 8 });
        if (!cancelled) setActivity(items);
      } catch (error) {
        reportError('committees.activity.home_load', error, { entityType: 'committee', entityId: committee.id });
        if (!cancelled) setActivity([]);
      } finally {
        if (!cancelled) setLoadingActivity(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [committee.id, organizationId, reportError, schoolSlug]);

  const quickLinks = [
    { section: 'resources' as const, label: 'Resources', icon: 'document-text-outline' as const, count: committee.resources.length, sub: 'guides & links' },
    { section: 'calendar' as const, label: 'Calendar', icon: 'calendar-outline' as const, count: committee.events.length, sub: 'upcoming dates' },
    { section: 'messages' as const, label: 'Messages', icon: 'chatbubble-outline' as const, count: committee.messages.length, sub: 'recent posts' },
  ];

  return (
    <View style={styles.stack}>
      <View style={styles.quick}>
        {quickLinks.map((link) => (
          <GPressable
            key={link.section}
            accessibilityRole="link"
            accessibilityLabel={`${link.label}: ${link.count} ${link.sub}. Open`}
            onPress={() => navigate(link.section)}
            style={styles.quickTile}>
            <Ionicons name={link.icon} size={18} color={accent.clayDeep} />
            <Text style={styles.quickValue}>{link.count}</Text>
            <Text style={styles.quickLabel} numberOfLines={2}>
              {link.label}
            </Text>
          </GPressable>
        ))}
      </View>

      <GCard index={0} title="Upcoming dates" action={<GLink label="View all" onPress={() => navigate('calendar')} />}>
        {upcomingEvents.length === 0 ? (
          <Text style={styles.empty}>No upcoming dates.</Text>
        ) : (
          upcomingEvents.map((event, index) => (
            <View key={event.id} style={[styles.eventRow, index > 0 && styles.divider]}>
              <DateStamp date={event.date} />
              <View style={styles.eventCopy}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>
                  {event.type}
                  {event.time ? ` · ${event.time}` : ''}
                  {event.location ? ` · ${event.location}` : ''}
                </Text>
              </View>
            </View>
          ))
        )}
      </GCard>

      <GCard index={1} title="Action items" action={<GLink label="View tasks" onPress={() => navigate('tasks')} />}>
        {openTasks.length === 0 ? (
          <Text style={styles.empty}>No open tasks.</Text>
        ) : (
          openTasks.map((task, index) => (
            <AdminWorkRow
              key={task.id}
              divider={index > 0}
              icon="checkbox-outline"
              tint={Garden.butter}
              title={task.title}
              meta={`${task.assigneeName ?? 'Unassigned'}${
                task.dueDate ? ` · Due ${new Date(`${task.dueDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''
              }`}
              onPress={() => navigate('tasks')}
            />
          ))
        )}
      </GCard>

      <GCard index={2} title="Recent activity" action={<GLink label="View all" onPress={() => navigate('activity')} />}>
        <AdminCommitteeActivity items={activity} loading={loadingActivity} limit={6} />
      </GCard>
    </View>
  );
}

/** Admin workspace › Activity: the full committee activity log (`committees.activity.load`, limit 30). */
export function AdminCommitteeActivitySection({ committee, organizationId, schoolSlug }: ParentCommitteeSectionProps) {
  const { reportError } = useAdminAction(organizationId);
  const [items, setItems] = useState<CommitteeActivityItem[]>([]);
  const [loading, setLoading] = useState(Boolean(schoolSlug));

  useEffect(() => {
    if (!schoolSlug) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchAdminCommitteeActivity(organizationId, schoolSlug, { committeeId: committee.id, limit: 30 });
        if (!cancelled) setItems(rows);
      } catch (error) {
        reportError('committees.activity.load', error, { entityType: 'committee', entityId: committee.id });
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [committee.id, organizationId, reportError, schoolSlug]);

  return (
    <GCard title="Activity log">
      <AdminCommitteeActivity items={items} loading={loading} emptyMessage="No activity yet." />
    </GCard>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  quick: { flexDirection: 'row', gap: 10 },
  quickTile: {
    flex: 1,
    minHeight: 96,
    padding: 12,
    gap: 4,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
  },
  quickValue: { fontFamily: GardenFonts.display, fontSize: 24, color: Garden.ink, fontVariant: ['tabular-nums'] },
  quickLabel: { fontFamily: GardenFonts.bodyBold, fontSize: 12.5, color: Garden.soft },
  empty: { fontFamily: GardenFonts.bodySemi, fontSize: 14, color: Garden.soft },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  eventCopy: { flex: 1, minWidth: 0, gap: 2 },
  eventTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  eventMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
});
