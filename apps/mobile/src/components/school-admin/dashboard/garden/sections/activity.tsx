import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent, type GChipTone } from '@/components/parent/garden/tokens';
import { GCard, GChip, GLink, GPressable } from '@/components/parent/garden/ui';
import { ctaText } from '@/components/school-admin/garden/admin-feedback';
import { AdminIconChip } from '@/components/school-admin/garden/admin-ui';
import {
  activityCategoryChipTone,
  activityCategoryLabel,
  type ActivityCategoryTone,
} from '@/lib/school-admin/activity-category';
import type {
  ActivityNotificationCategory,
  SchoolAdminActivityNotification,
} from '@/lib/school-admin/dashboard-summary-types';
import { formatRelativeTime } from '@/lib/school-admin/format-relative-time';

type IoniconName = keyof typeof Ionicons.glyphMap;

const CATEGORY_ICONS: Record<ActivityNotificationCategory, IoniconName> = {
  applications: 'clipboard-outline',
  payments: 'card-outline',
  enrollment: 'school-outline',
  committees: 'people-outline',
  program_signups: 'create-outline',
  messages: 'chatbubble-outline',
  other: 'sparkles-outline',
};

const CATEGORY_TINTS: Record<ActivityCategoryTone, string> = {
  success: Garden.mint,
  warning: Garden.butter,
  info: Garden.sky,
  purple: Garden.lav,
};

const CHIP_TONE: Record<ActivityCategoryTone, GChipTone> = {
  success: 'success',
  warning: 'warning',
  info: 'info',
  purple: 'neutral',
};

/** One activity item: pastel category icon, category chip + time, title, detail, CTA. The whole row is the button. */
export function ActivityRow({
  item,
  onPress,
  divider = false,
  isNew = false,
}: {
  item: SchoolAdminActivityNotification;
  onPress: () => void;
  divider?: boolean;
  isNew?: boolean;
}) {
  const accent = useGardenAccent();
  const tone = activityCategoryChipTone(item.category);
  const label = activityCategoryLabel(item.category);
  const isPayment = item.category === 'payments';
  const when = formatRelativeTime(item.createdAt);
  const cta = ctaText(item.ctaLabel);

  return (
    <GPressable
      accessibilityLabel={`${label}. ${isPayment ? item.detail : `${item.title}. ${item.detail}`}. ${when}. ${cta}`}
      pressedScale={0.985}
      onPress={onPress}
      style={[styles.row, divider && styles.divider, isNew && { backgroundColor: accent.wash }]}>
      <AdminIconChip name={CATEGORY_ICONS[item.category] ?? 'sparkles-outline'} tint={CATEGORY_TINTS[tone]} />
      <View style={styles.copy}>
        <View style={styles.metaRow}>
          <GChip label={label} tone={CHIP_TONE[tone]} />
          {isNew ? <GChip label="New" tone="alert" /> : null}
          <Text style={styles.when}>{when}</Text>
        </View>
        {isPayment ? (
          <Text style={styles.title} numberOfLines={3}>
            {item.detail}
          </Text>
        ) : (
          <>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            {item.detail ? (
              <Text style={styles.detail} numberOfLines={2}>
                {item.detail}
              </Text>
            ) : null}
          </>
        )}
        <Text style={[styles.cta, { color: accent.clayDeep }]}>{cta} →</Text>
      </View>
    </GPressable>
  );
}

/** Top few items of recent school activity; "View all" opens the activity sheet. */
export function ActivityCard({
  items,
  onPressItem,
  onViewAll,
  index = 0,
}: {
  items: SchoolAdminActivityNotification[];
  onPressItem: (item: SchoolAdminActivityNotification) => void;
  onViewAll: () => void;
  index?: number;
}) {
  if (items.length === 0) return null;
  return (
    <GCard
      title="Recent school activity"
      index={index}
      testID="dashboard-recent-activity"
      action={<GLink label="View all" accessibilityLabel="View all school activity" onPress={onViewAll} />}>
      {items.slice(0, 3).map((item, i) => (
        <ActivityRow key={item.id} item={item} divider={i > 0} onPress={() => onPressItem(item)} />
      ))}
    </GCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderRadius: 14,
  },
  divider: { borderTopWidth: 1, borderTopColor: Garden.ink06, borderRadius: 0 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  when: { fontFamily: GardenFonts.bodySemi, fontSize: 12, color: Garden.soft },
  title: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, lineHeight: 20, color: Garden.ink },
  detail: { fontFamily: GardenFonts.bodySemi, fontSize: 13, lineHeight: 18, color: Garden.soft },
  cta: { fontFamily: GardenFonts.bodyExtra, fontSize: 13.5, marginTop: 2 },
});
