import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GBadge, GPressable } from '@/components/parent/garden/ui';
import { useUpdatedLabel } from '@/components/school-admin/dashboard/garden/sections/admin-header';
import { firstName, greetingParts, todayLabel } from '@/lib/teacher/teacher-home-utils';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

type TeacherHeaderProps = {
  displayName: string;
  profilePhotoUrl: string | null;
  bulletinEnabled: boolean;
  bulletinPostCount: number;
  notificationUnreadCount: number;
  statusLine: string;
  lastUpdatedAt: number | null;
  onPressBulletin: () => void;
  onPressNotifications: () => void;
  onPressProfile: () => void;
};

/**
 * Teacher Home header: date + 42pt toolbar (bulletin when on, bell, avatar; the
 * same labels as the old Story toolbar), greeting with the teacher's first name
 * in the school colour, and a status line built only from today's data.
 */
export function TeacherHeader({
  displayName,
  profilePhotoUrl,
  bulletinEnabled,
  bulletinPostCount,
  notificationUnreadCount,
  statusLine,
  lastUpdatedAt,
  onPressBulletin,
  onPressNotifications,
  onPressProfile,
}: TeacherHeaderProps) {
  const accent = useGardenAccent();
  const name = firstName(displayName) || 'there';
  const { prefix, emoji } = greetingParts();
  const updated = useUpdatedLabel(lastUpdatedAt);

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <Text style={styles.date} numberOfLines={1}>
          {todayLabel()}
        </Text>
        <View style={styles.toolbar}>
          {bulletinEnabled ? (
            <GPressable
              accessibilityLabel={`School bulletin${bulletinPostCount ? `, ${bulletinPostCount} posts` : ''}`}
              onPress={onPressBulletin}
              style={styles.iconButton}>
              <Ionicons name="megaphone-outline" size={19} color={Garden.ink} />
            </GPressable>
          ) : null}
          <GPressable
            accessibilityLabel={
              notificationUnreadCount > 0
                ? `Open notifications, ${notificationUnreadCount} unread`
                : 'Open notifications'
            }
            onPress={onPressNotifications}
            style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={19} color={Garden.ink} />
            <GBadge count={notificationUnreadCount} />
          </GPressable>
          <GPressable
            accessibilityLabel={`Account for ${displayName}`}
            onPress={onPressProfile}
            style={[styles.avatar, { backgroundColor: accent.peach }]}>
            {profilePhotoUrl ? (
              <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: accent.clayDeep }]}>{initials(displayName)}</Text>
            )}
          </GPressable>
        </View>
      </View>
      <Text
        accessibilityRole="header"
        accessibilityLabel={`${prefix} ${name}. ${emoji}`}
        style={styles.title}
        numberOfLines={2}>
        {prefix}, <Text style={{ color: accent.clay }}>{name}</Text>. {emoji}
      </Text>
      <Text style={styles.status} testID="teacher-home-status-line">
        {statusLine}
      </Text>
      {updated ? <Text style={styles.updated}>{updated}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
  },
  date: { flex: 1, fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Garden.ink12,
    backgroundColor: Garden.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: Garden.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontFamily: GardenFonts.bodyExtra, fontSize: 14 },
  title: {
    fontFamily: GardenFonts.display,
    fontSize: 27,
    lineHeight: 30,
    letterSpacing: -0.9,
    color: Garden.ink,
  },
  status: { fontFamily: GardenFonts.bodyBold, fontSize: 14.5, lineHeight: 20, color: Garden.ink },
  updated: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft },
});
