import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ParentBottomSheet } from '@/components/parent/parent-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';
import type { ParentPhotoMediaConsentLearner } from '@/lib/parent/parent-photo-media-consent-api';
import { patchParentPhotoMediaConsent } from '@/lib/parent/parent-photo-media-consent-api';
import {
  PHOTO_MEDIA_CONSENT_OPTIONS,
  photoMediaConsentLabel,
  type PhotoMediaConsent,
} from '@/lib/students/photo-media-consent';
import { StoryFonts } from '@/constants/story-theme';
import { Radius, Spacing } from '@/constants/theme';

type ParentPhotoPermissionsSheetProps = {
  visible: boolean;
  organizationId: string;
  learners: ParentPhotoMediaConsentLearner[];
  onClose: () => void;
  onSaved: (updates: ParentPhotoMediaConsentLearner[]) => void;
};

function draftsFromLearners(learners: ParentPhotoMediaConsentLearner[]): Record<string, PhotoMediaConsent | null> {
  return Object.fromEntries(learners.map((learner) => [learner.studentId, learner.consent]));
}

export function ParentPhotoPermissionsSheet({
  visible,
  organizationId,
  learners,
  onClose,
  onSaved,
}: ParentPhotoPermissionsSheetProps) {
  const theme = useParentTheme();
  const { reportError } = useMobileErrorReporter(organizationId);
  const [drafts, setDrafts] = useState<Record<string, PhotoMediaConsent | null>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDrafts(draftsFromLearners(learners));
      setError(null);
    }
  }, [visible, learners]);

  const allSelected = useMemo(
    () => learners.every((learner) => drafts[learner.studentId] != null),
    [drafts, learners],
  );

  const requestClose = useCallback(() => {
    if (saving) return;
    onClose();
  }, [onClose, saving]);

  const setDraftForStudent = (studentId: string, consent: PhotoMediaConsent) => {
    setDrafts((prev) => ({ ...prev, [studentId]: consent }));
  };

  const handleSave = async () => {
    if (!allSelected) {
      setError('Please select a permission level for each child.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const results = await Promise.all(
        learners.map(async (learner) => {
          const consent = drafts[learner.studentId];
          if (!consent) {
            throw new Error('Missing consent selection.');
          }
          const saved = await patchParentPhotoMediaConsent(organizationId, learner.studentId, consent);
          return {
            ...learner,
            consent: saved.consent,
            consentLabel: photoMediaConsentLabel(saved.consent),
            updatedAt: saved.updatedAt,
          };
        }),
      );
      onSaved(results);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save photo permissions.';
      setError(message);
      reportError('parent_photo_media_consent_update', err, { error: message });
      Alert.alert('Could not save', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ParentBottomSheet
      visible={visible}
      onClose={requestClose}
      title="Photo permissions"
      subtitle="Choose how the school may use photos and video of each child."
      accessibilityLabel="Close photo permissions">
      <View style={styles.content} testID="parent-photo-permissions-sheet">
        {learners.map((learner) => (
          <View key={learner.studentId} style={styles.childBlock}>
            <Text style={[styles.childName, { color: theme.ink }]}>{learner.studentName}</Text>
            {PHOTO_MEDIA_CONSENT_OPTIONS.map((option) => {
              const selected = drafts[learner.studentId] === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setDraftForStudent(learner.studentId, option.value)}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.optionRow,
                    {
                      borderColor: selected ? theme.primary : theme.line,
                      backgroundColor: selected ? theme.primarySoft : pressed ? theme.line : theme.white,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={selected ? theme.primary : theme.muted}
                  />
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: theme.ink }]}>{option.label}</Text>
                    <Text style={[styles.optionDescription, { color: theme.muted }]}>
                      {option.description}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}

        {error ? (
          <Text style={[styles.errorText, { color: theme.alert }]}>{error}</Text>
        ) : null}

        <View style={styles.actions}>
          <StoryButton label="Cancel" variant="outline" onPress={requestClose} disabled={saving} />
          <StoryButton
            label={saving ? 'Saving…' : 'Save'}
            onPress={() => void handleSave()}
            disabled={saving || !allSelected}
          />
        </View>
      </View>
    </ParentBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },
  childBlock: {
    gap: Spacing.two,
  },
  childName: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.three,
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
  },
  optionDescription: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
});
