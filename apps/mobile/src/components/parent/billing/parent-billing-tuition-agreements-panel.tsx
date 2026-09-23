import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { ParentFormListItem } from '@/lib/parent/parent-forms-documents-types';
import {
  formatFormDueDate,
  formatFormSignedDate,
} from '@/lib/parent/parent-forms-documents-utils';

type ParentBillingTuitionAgreementsPanelProps = {
  agreements: ParentFormListItem[];
  onOpenAgreement: (formId: string) => void;
};

export function ParentBillingTuitionAgreementsPanel({
  agreements,
  onOpenAgreement,
}: ParentBillingTuitionAgreementsPanelProps) {
  const theme = useParentTheme();
  const [showSigned, setShowSigned] = useState(false);

  const pendingAgreements = useMemo(
    () => agreements.filter((item) => item.listStatus === 'needs_action'),
    [agreements],
  );
  const signedAgreements = useMemo(
    () => agreements.filter((item) => item.listStatus === 'signed'),
    [agreements],
  );

  if (agreements.length === 0) {
    return (
      <StoryCard style={styles.card}>
        <Text style={[styles.emptyCopy, { color: theme.muted }]}>
          No tuition agreements assigned to your family right now.
        </Text>
      </StoryCard>
    );
  }

  return (
    <StoryCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="document-text-outline" size={20} color={theme.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: theme.ink }]}>Tuition agreements</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            Review and sign agreements assigned to your family.
          </Text>
        </View>
      </View>

      {pendingAgreements.length > 0 ? (
        <View style={styles.pendingList}>
          {pendingAgreements.map((item) => (
            <View
              key={item.form.id}
              style={[styles.pendingRow, { borderColor: theme.line, backgroundColor: theme.cream }]}>
              <View style={styles.pendingCopy}>
                <Text style={[styles.pendingTitle, { color: theme.ink }]}>{item.form.title}</Text>
                <Text style={[styles.pendingMeta, { color: theme.muted }]}>
                  {item.form.dueDate
                    ? `Due ${formatFormDueDate(item.form.dueDate)}`
                    : 'No due date'}
                </Text>
              </View>
              <View style={styles.pendingActions}>
                <StoryChip tone="warning" label="Needs signature" />
                <StoryButton
                  label="Review & sign"
                  previewSafe
                  onPress={() => onOpenAgreement(item.form.id)}
                  style={styles.signButton}
                />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {signedAgreements.length > 0 ? (
        <View style={styles.signedSection}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowSigned((current) => !current)}
            style={({ pressed }) => [styles.signedToggle, pressed && styles.pressed]}>
            <Ionicons
              name={showSigned ? 'chevron-down' : 'chevron-forward'}
              size={16}
              color={theme.ink}
            />
            <Text style={[styles.signedToggleLabel, { color: theme.ink }]}>
              Signed agreements ({signedAgreements.length})
            </Text>
          </Pressable>
          {showSigned ? (
            <View style={styles.signedList}>
              {signedAgreements.map((item) => (
                <Pressable
                  key={item.form.id}
                  accessibilityRole="button"
                  onPress={() => onOpenAgreement(item.form.id)}
                  style={({ pressed }) => [
                    styles.signedRow,
                    { borderColor: theme.line },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.signedTitle, { color: theme.ink }]}>{item.form.title}</Text>
                  <Text style={[styles.signedMeta, { color: theme.muted }]}>
                    {item.response.signedAt
                      ? `Signed ${formatFormSignedDate(item.response.signedAt)}`
                      : 'Signed'}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </StoryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.three,
  },
  emptyCopy: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  pendingList: {
    gap: Spacing.two,
  },
  pendingRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pendingCopy: {
    gap: Spacing.one,
  },
  pendingTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  pendingMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  pendingActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  signButton: {
    minWidth: 132,
  },
  signedSection: {
    gap: Spacing.two,
  },
  signedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  signedToggleLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
  },
  signedList: {
    gap: Spacing.two,
  },
  signedRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  signedTitle: {
    flex: 1,
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
  },
  signedMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.92,
  },
});
