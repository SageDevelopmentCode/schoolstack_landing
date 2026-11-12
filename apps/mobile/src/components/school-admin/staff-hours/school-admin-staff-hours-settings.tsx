import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { StoryCard } from '@/components/story/story-card';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { patchStaffHoursAdjustmentSettings } from '@/lib/school-admin/staff-hours/staff-hours-api';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type SchoolAdminStaffHoursSettingsProps = {
  organizationId: string;
  adjustmentsRequireApproval: boolean;
  onChange: (requireApproval: boolean) => void;
};

export function SchoolAdminStaffHoursSettings({
  organizationId,
  adjustmentsRequireApproval,
  onChange,
}: SchoolAdminStaffHoursSettingsProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    if (saving) return;
    const next = !adjustmentsRequireApproval;
    setSaving(true);
    onChange(next);
    try {
      await patchStaffHoursAdjustmentSettings({
        organizationId,
        adjustmentsRequireApproval: next,
      });
      Alert.alert(
        next
          ? 'Hour adjustments now wait for approval.'
          : 'Hour adjustments now save immediately.',
      );
    } catch (error) {
      onChange(!next);
      Alert.alert(
        'Could not save settings',
        error instanceof Error ? error.message : 'Could not save staff hours settings.',
      );
      void reportError('staff_hours.adjustment_settings', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <StoryCard style={styles.card} testID="staff-hours-settings-panel">
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.ink }]}>
            Require approval for hour adjustments
          </Text>
          <Text style={[styles.detail, { color: theme.muted }]}>
            When this is on, teacher changes stay pending until you approve them.
          </Text>
        </View>
        <Switch
          accessibilityLabel="Require approval for hour adjustments"
          value={adjustmentsRequireApproval}
          disabled={saving}
          onValueChange={() => void toggle()}
          trackColor={{ false: theme.line, true: theme.primary }}
          thumbColor={theme.white}
        />
      </View>
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  copy: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  detail: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});
