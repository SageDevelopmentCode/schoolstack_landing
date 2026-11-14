import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { GBadge, GKicker, GPressable } from '@/components/parent/garden/ui';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import type { HomeLabCtx } from '@/components/parent/home-lab/types';

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Bulletin, notifications bell and avatar (same actions + labels as the current header). */
export function HomeLabToolbar({ ctx }: { ctx: HomeLabCtx }) {
  const accent = useGardenAccent();
  const { props, model } = ctx;
  const unread = props.notificationUnreadCount;
  const postCount = model.bulletinPosts.length;
  const name = props.data.userProfile.displayName;

  return (
    <View style={styles.toolbar}>
      {model.bulletinEnabled ? (
        <GPressable
          accessibilityLabel={`School bulletin${postCount ? `, ${postCount} posts` : ''}`}
          onPress={() => model.setBulletinOpen(true)}
          style={styles.iconButton}>
          <Ionicons name="megaphone-outline" size={19} color={Garden.ink} />
          {postCount > 0 ? <View style={[styles.dot, { backgroundColor: accent.clay }]} /> : null}
        </GPressable>
      ) : null}
      <GPressable
        accessibilityLabel={unread > 0 ? `Open notifications, ${unread} unread` : 'Open notifications'}
        onPress={() => model.setNotificationsOpen(true)}
        style={styles.iconButton}>
        <Ionicons name="notifications-outline" size={19} color={Garden.ink} />
        <GBadge count={unread} />
      </GPressable>
      <GPressable
        accessibilityLabel={`Account for ${name}`}
        onPress={() => model.setAccountSheetOpen(true)}
        style={[styles.avatar, { backgroundColor: accent.peach }]}>
        {model.heroProfilePhotoUrl ? (
          <Image source={{ uri: model.heroProfilePhotoUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarText, { color: accent.clayDeep }]}>{initials(name)}</Text>
        )}
      </GPressable>
    </View>
  );
}

/** Garden page header: kicker, greeting h1 (name in the school colour), date subtitle. */
export function HomeLabHeader({
  ctx,
  compact = false,
  subtitle,
}: {
  ctx: HomeLabCtx;
  compact?: boolean;
  subtitle?: string;
}) {
  const accent = useGardenAccent();
  const { greeting } = ctx.model;
  const { programPortalLabel, coopModeEnabled } = ctx.props;
  const kicker =
    coopModeEnabled && programPortalLabel
      ? `${greeting.familyLabel} · Co-op mode · ${programPortalLabel}`
      : greeting.familyLabel;

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <GKicker style={styles.headerKicker}>{kicker}</GKicker>
        <HomeLabToolbar ctx={ctx} />
      </View>
      <Text
        accessibilityRole="header"
        style={[styles.title, compact && styles.titleCompact]}
        numberOfLines={2}>
        {greeting.prefix}
        {greeting.firstName ? ', ' : ''}
        <Text style={{ color: accent.clay }}>{greeting.firstName}</Text>. {greeting.emoji}
      </Text>
      <Text style={styles.subtitle}>
        {subtitle ?? `Here's what your family needs for ${greeting.todayLabel}.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
  },
  headerKicker: {
    flex: 1,
  },
  title: {
    fontFamily: GardenFonts.display,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -1,
    color: Garden.ink,
  },
  titleCompact: {
    fontSize: 26,
    lineHeight: 29,
  },
  subtitle: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 15,
    lineHeight: 21,
    color: Garden.soft,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
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
  dot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Garden.white,
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
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 14,
  },
});
