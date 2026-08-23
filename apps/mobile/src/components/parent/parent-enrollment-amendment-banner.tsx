import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Radius, Spacing } from '@/constants/theme';
import type { EnrollmentAgreementAmendmentBannerItem } from '@/lib/parent/parent-portal-api';
import { adminCardShadow } from '@/lib/organization-settings/build-admin-theme';

type ParentEnrollmentAmendmentBannerProps = {
  items: EnrollmentAgreementAmendmentBannerItem[];
  onPressItem: (item: EnrollmentAgreementAmendmentBannerItem) => void;
};

export function ParentEnrollmentAmendmentBanner({
  items,
  onPressItem,
}: ParentEnrollmentAmendmentBannerProps) {
  const theme = useAdminTheme();

  if (items.length === 0) return null;

  return (
    <View style={styles.stack}>
      {items.map((item) => (
        <View
          key={`${item.applicationId}:${item.checklistItemLabel}`}
          style={[
            styles.card,
            {
              backgroundColor: `${theme.accent}12`,
              borderColor: `${theme.accent}40`,
              ...adminCardShadow(theme),
            },
          ]}>
          <View style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: `${theme.accent}22` }]}>
              <Ionicons name="warning-outline" size={18} color={theme.accent} />
            </View>
            <View style={styles.copy}>
              <ThemedText type="smallBold" style={{ color: theme.textPrimary }}>
                Enrollment agreement update for {item.studentName}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 4 }}>
                {item.amendmentNotice}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textTertiary, marginTop: 4 }}>
                {item.checklistItemLabel}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => onPressItem(item)}
                style={({ pressed }) => [pressed && { opacity: 0.7 }, styles.link]}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  Review and re-sign
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.three,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  copy: {
    flex: 1,
  },
  link: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
  },
});
