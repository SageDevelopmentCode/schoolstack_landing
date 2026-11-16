import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, type GChipTone } from '@/components/parent/garden/tokens';
import {
  DateStamp,
  GCard,
  GChip,
  GDashedRule,
  GHand,
  GLink,
  GPressable,
  GRing,
  GSkeleton,
  gText,
} from '@/components/parent/garden/ui';
import type { CommitteePortalApiNamespace } from '@/lib/committees/notify-committee-task-assignment';
import { EVENT_TYPE_LABELS } from '@/lib/parent/parent-committees-garden';
import { fetchParentCommitteeActivity } from '@/lib/parent/parent-portal-api';
import type {
  Committee,
  CommitteeActivityItem,
  CommitteeWorkspaceSection,
} from '@/lib/parent/parent-committees-types';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';
import { fetchTeacherCommitteeActivity } from '@/lib/teacher/teacher-portal-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

const CATEGORY_TONES: Record<string, GChipTone> = {
  Members: 'success',
  Tasks: 'info',
  Resources: 'info',
  Calendar: 'warning',
  Messages: 'info',
  Roles: 'alert',
};

function shortDate(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Widget({
  kicker,
  icon,
  tint,
  value,
  caption,
  accessibilityLabel,
  onPress,
}: {
  kicker: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  value: string;
  caption: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <GPressable
      accessibilityLabel={accessibilityLabel}
      pressedScale={0.96}
      onPress={onPress}
      style={[styles.widget, { backgroundColor: tint }]}>
      <View style={styles.widgetTop}>
        <Text style={styles.widgetKicker}>{kicker}</Text>
        <View style={styles.widgetIcon}>
          <Ionicons name={icon} size={15} color={Garden.ink} />
        </View>
      </View>
      <Text style={styles.widgetValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.widgetCaption} numberOfLines={2}>
        {caption}
      </Text>
    </GPressable>
  );
}

/** Committee home: welcome (the one dark card), a 2×2 widget grid, dates, action items, activity. */
export function WorkspaceHomeSection({
  committee,
  organizationId,
  portalApiNamespace = 'parent-portal',
  messagesUnread,
  onNavigate,
}: {
  committee: Committee;
  organizationId: string;
  portalApiNamespace?: CommitteePortalApiNamespace;
  messagesUnread: number;
  onNavigate: (section: CommitteeWorkspaceSection) => void;
}) {
  const { reportError } = useMobileErrorReporter(organizationId);
  const [activity, setActivity] = useState<CommitteeActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingActivity(true);
      try {
        const items =
          portalApiNamespace === 'teacher-portal'
            ? await fetchTeacherCommitteeActivity(organizationId, committee.id, { limit: 8 })
            : await fetchParentCommitteeActivity(organizationId, committee.id, { limit: 8 });
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
  }, [committee.id, organizationId, portalApiNamespace, reportError]);

  const upcoming = committee.events.slice(0, 3);
  const openTasks = committee.tasks.filter((task) => task.status !== 'done');
  const leaders = committee.members.filter((member) => member.role === 'lead');
  const next = upcoming[0] ?? null;

  return (
    <View style={styles.container}>
      <GCard tone="dark" title={`Welcome to ${committee.name}`} index={0}>
        {committee.termLabel ? <Text style={styles.darkMeta}>{committee.termLabel}</Text> : null}
        {committee.description ? <Text style={styles.darkCopy}>{committee.description}</Text> : null}
        {leaders.length > 0 ? (
          <Text style={styles.darkMeta}>Led by {leaders.map((leader) => leader.name).join(', ')}</Text>
        ) : null}
      </GCard>

      <View style={styles.grid}>
        <Widget
          kicker="Tasks"
          icon="checkbox-outline"
          tint={Garden.mint}
          value={String(openTasks.length)}
          caption={openTasks.length === 1 ? 'open task' : 'open tasks'}
          accessibilityLabel={`Tasks, ${openTasks.length} open. Open tasks`}
          onPress={() => onNavigate('tasks')}
        />
        <Widget
          kicker="Next date"
          icon="calendar-outline"
          tint={Garden.butter}
          value={next ? shortDate(next.date) : '—'}
          caption={next ? next.title : 'No upcoming dates.'}
          accessibilityLabel={next ? `Next date, ${next.title} on ${shortDate(next.date)}. Open calendar` : 'No upcoming dates. Open calendar'}
          onPress={() => onNavigate('calendar')}
        />
        <Widget
          kicker="Resources"
          icon="document-text-outline"
          tint={Garden.sky}
          value={String(committee.resources.length)}
          caption="guides & links"
          accessibilityLabel={`Resources, ${committee.resources.length} guides and links. Open resources`}
          onPress={() => onNavigate('resources')}
        />
        <Widget
          kicker="Messages"
          icon="chatbubble-outline"
          tint={Garden.lav}
          value={messagesUnread > 0 ? String(messagesUnread) : String(committee.messages.length)}
          caption={messagesUnread > 0 ? 'unread messages' : 'recent posts'}
          accessibilityLabel={`Messages, ${messagesUnread > 0 ? `${messagesUnread} unread` : `${committee.messages.length} recent posts`}. Open messages`}
          onPress={() => onNavigate('messages')}
        />
      </View>

      <GCard
        title="Upcoming dates"
        index={2}
        action={<GLink label="View all" onPress={() => onNavigate('calendar')} />}>
        {upcoming.length === 0 ? (
          <Text style={gText.meta}>No upcoming dates.</Text>
        ) : (
          <View style={styles.tickets}>
            {upcoming.map((event) => (
              <GPressable
                key={event.id}
                accessibilityLabel={`${event.title}, ${shortDate(event.date)}. Open calendar`}
                pressedScale={0.99}
                onPress={() => onNavigate('calendar')}
                style={styles.ticket}>
                <DateStamp date={event.date} />
                <GDashedRule vertical color={Garden.ink25} style={{ maxHeight: 64 }} />
                <View style={styles.flex}>
                  <Text style={gText.itemTitle} numberOfLines={2}>
                    {event.title}
                  </Text>
                  <Text style={gText.meta}>
                    {[EVENT_TYPE_LABELS[event.type] ?? event.type, event.time, event.location].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </GPressable>
            ))}
          </View>
        )}
      </GCard>

      <GCard
        title="Action items"
        index={3}
        action={<GLink label="View tasks" onPress={() => onNavigate('tasks')} />}>
        {openTasks.length === 0 ? (
          <Text style={gText.meta}>No open tasks.</Text>
        ) : (
          <View style={styles.notebook}>
            {openTasks.slice(0, 4).map((task, i) => (
              <GPressable
                key={task.id}
                accessibilityLabel={`${task.title}, ${task.assigneeName ?? 'Unassigned'}. Open tasks`}
                pressedScale={0.99}
                onPress={() => onNavigate('tasks')}
                style={[styles.noteRow, i > 0 && styles.noteRule]}>
                <GRing size={22} />
                <View style={styles.flex}>
                  <Text style={gText.itemTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text style={gText.meta}>
                    {task.assigneeName ?? 'Unassigned'}
                    {task.dueDate ? ` · Due ${shortDate(task.dueDate)}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Garden.ink60} />
              </GPressable>
            ))}
          </View>
        )}
      </GCard>

      <GCard title="Recent activity" tone="paper" index={4}>
        {loadingActivity ? (
          <View style={styles.activity}>
            {[0, 1, 2].map((i) => (
              <GSkeleton key={i} style={{ height: 40, borderRadius: 12 }} />
            ))}
          </View>
        ) : activity.length === 0 ? (
          <View style={styles.activity}>
            <Text style={gText.meta}>No activity yet.</Text>
            <GHand>Things will pick up soon.</GHand>
          </View>
        ) : (
          <View style={styles.activity}>
            {activity.slice(0, 6).map((item) => (
              <View
                key={item.id}
                style={styles.activityRow}
                accessible
                accessibilityLabel={`${item.category}: ${item.summary}${item.actorName ? `, ${item.actorName}` : ''}`}>
                <GChip label={item.category.toLowerCase()} tone={CATEGORY_TONES[item.category] ?? 'info'} />
                <View style={styles.flex}>
                  <Text style={gText.body} numberOfLines={2}>
                    {item.summary}
                  </Text>
                  <Text style={gText.meta}>
                    {[item.actorName, formatRelativeTime(item.createdAt)].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </GCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  flex: { flex: 1, gap: 2 },
  darkCopy: { fontFamily: GardenFonts.bodySemi, fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.88)' },
  darkMeta: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  widget: {
    flexBasis: '45%',
    flexGrow: 1,
    minHeight: 140,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    padding: 14,
    justifyContent: 'space-between',
  },
  widgetTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  widgetKicker: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Garden.ink,
  },
  widgetIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Garden.white,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetValue: { fontFamily: GardenFonts.display, fontSize: 36, lineHeight: 40, color: Garden.ink, marginTop: 10 },
  widgetCaption: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.ink65 },
  tickets: { gap: 10 },
  ticket: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: Garden.paper,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  notebook: {
    backgroundColor: Garden.notebook,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    overflow: 'hidden',
  },
  noteRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  noteRule: { borderTopWidth: 1, borderTopColor: 'rgba(46,74,60,0.1)' },
  activity: { gap: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
});
