import { StyleSheet, View } from 'react-native';

import { SkeletonPulse } from '@/components/parent/messages/skeleton-pulse';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';

function CardSkeleton({ backgroundColor }: { backgroundColor: string }) {
  const theme = useAdminTheme();

  return (
    <View
      style={[
        styles.card,
        adminCardShadow(theme),
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}>
      <SkeletonPulse style={styles.titleBar} backgroundColor={backgroundColor} />
      <SkeletonPulse style={styles.line} backgroundColor={backgroundColor} />
      <SkeletonPulse style={styles.lineShort} backgroundColor={backgroundColor} />
    </View>
  );
}

export function ParentNotificationSettingsSkeleton() {
  const theme = useAdminTheme();
  const blockColor = theme.border;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.intro}>
        <SkeletonPulse style={styles.introTitle} backgroundColor={blockColor} />
        <SkeletonPulse style={styles.introLine} backgroundColor={blockColor} />
        <SkeletonPulse style={styles.introLineShort} backgroundColor={blockColor} />
      </View>
      <CardSkeleton backgroundColor={blockColor} />
      <CardSkeleton backgroundColor={blockColor} />
      <CardSkeleton backgroundColor={blockColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  intro: {
    gap: Spacing.two,
  },
  introTitle: {
    height: 24,
    width: '70%',
    borderRadius: Radius.sm,
  },
  introLine: {
    height: 14,
    width: '100%',
    borderRadius: Radius.sm,
  },
  introLineShort: {
    height: 14,
    width: '85%',
    borderRadius: Radius.sm,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  titleBar: {
    height: 16,
    width: '45%',
    borderRadius: Radius.sm,
  },
  line: {
    height: 14,
    width: '90%',
    borderRadius: Radius.sm,
  },
  lineShort: {
    height: 14,
    width: '60%',
    borderRadius: Radius.sm,
  },
});
