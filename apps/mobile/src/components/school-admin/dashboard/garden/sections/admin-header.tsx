import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import { GBadge, GPressable } from '@/components/parent/garden/ui';
import { todayLabel } from '@/lib/parent/parent-home-utils';
import { greetingParts } from '@/lib/school-admin/greeting';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** "just now" / "4 min ago" / "2 h ago", re-rendered every 30s. */
export function useUpdatedLabel(timestamp: number | null): string | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  if (timestamp == null) return null;
  const minutes = Math.floor(Math.max(0, now - timestamp) / 60_000);
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} min ago`;
  return `Updated ${Math.floor(minutes / 60)} h ago`;
}

type AdminHeaderProps = {
  firstName?: string | null;
  displayName?: string | null;
  profilePhotoUrl?: string | null;
  unreadCount: number;
  statusLine: string;
  lastUpdatedAt: number | null;
  onPressBulletin: () => void;
  onPressNotifications: () => void;
  onPressProfile: () => void;
};

/**
 * Admin Dashboard header: toolbar (bulletin, bell, avatar; same labels as before),
 * greeting with the admin's name in the school colour, a status line built only
 * from data, and the date + "Updated N min ago". No eyebrow.
 */
export function AdminHeader({
  firstName,
  displayName,
  profilePhotoUrl,
  unreadCount,
  statusLine,
  lastUpdatedAt,
  onPressBulletin,
  onPressNotifications,
  onPressProfile,
}: AdminHeaderProps) {
  const accent = useGardenAccent();
  const name = firstName?.trim() || 'there';
  const profileLabel = displayName?.trim() || name;
  const { prefix, emoji } = greetingParts();
  const updated = useUpdatedLabel(lastUpdatedAt);

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <Text style={styles.date} numberOfLines={1}>
          {todayLabel()}
        </Text>
        <View style={styles.toolbar}>
          <GPressable
            accessibilityLabel="School bulletin"
            onPress={onPressBulletin}
            style={styles.iconButton}>
            <Ionicons name="megaphone-outline" size={19} color={Garden.ink} />
          </GPressable>
          <GPressable
            accessibilityLabel={
              unreadCount > 0 ? `Open notifications, ${unreadCount} unread` : 'Open notifications'
            }
            onPress={onPressNotifications}
            style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={19} color={Garden.ink} />
            <GBadge count={unreadCount} />
          </GPressable>
          <GPressable
            accessibilityLabel={`Account for ${profileLabel}`}
            onPress={onPressProfile}
            style={[styles.avatar, { backgroundColor: accent.peach }]}>
            {profilePhotoUrl ? (
              <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: accent.clayDeep }]}>{initials(profileLabel)}</Text>
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
      <Text style={styles.status} testID="dashboard-status-line">
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
