import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import {
  photoMediaConsentChipTone,
  photoMediaConsentIconName,
  photoMediaConsentLabel,
  type PhotoMediaConsent,
} from '@/lib/students/photo-media-consent';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

type PhotoMediaConsentBadgeProps = {
  consent: PhotoMediaConsent | null;
  label?: string;
};

function iconColor(
  theme: ReturnType<typeof useParentTheme>,
  consent: PhotoMediaConsent | null,
): string {
  if (consent === 'full') return theme.success;
  if (consent === 'limited') return theme.warning;
  if (consent === 'none') return theme.alert;
  return theme.info;
}

export function PhotoMediaConsentBadge({ consent, label }: PhotoMediaConsentBadgeProps) {
  const theme = useParentTheme();
  const displayLabel = label ?? photoMediaConsentLabel(consent);
  const tone = photoMediaConsentChipTone(consent);
  const iconName = photoMediaConsentIconName(consent);

  return (
    <View style={styles.badgeRow}>
      <Ionicons name={iconName} size={16} color={iconColor(theme, consent)} />
      <StoryChip label={displayLabel} tone={tone} uppercase={false} />
    </View>
  );
}

type PhotoPermissionsDetailFieldProps = {
  consent: PhotoMediaConsent | null;
  label?: string;
};

export function PhotoPermissionsDetailField({
  consent,
  label,
}: PhotoPermissionsDetailFieldProps) {
  const theme = useParentTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.muted }]}>Photo permissions</Text>
      <PhotoMediaConsentBadge consent={consent} label={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
  },
  fieldLabel: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
  },
});
