import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StoryButton } from '@/components/story/story-button';
import { AdmissionsFilterPill } from '@/components/school-admin/admissions/admissions-filter-pill';
import { StoryTextField } from '@/components/story/story-text-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { buildFridayBranchClassSavePayload } from '@/lib/school-admin/friday-branch/friday-branch-class-save';
import { uploadFridayBranchClassFlyer } from '@/lib/school-admin/friday-branch/friday-branch-flyer-storage';
import type { FridayBranchClass, FridayBranchTimeSlot } from '@/lib/school-admin/friday-branch/friday-branch-types';
import { formatFridayBranchPriceInput } from '@/lib/school-admin/friday-branch/friday-branch-price-utils';
import { getSupabaseClient } from '@/lib/supabase';
import { StoryFonts } from '@/constants/story-theme';
import { SCREEN_HORIZONTAL_PADDING } from '@/constants/screen-layout';
import { Spacing } from '@/constants/theme';

type SchoolAdminFridayBranchClassEditSheetProps = {
  visible: boolean;
  organizationId: string;
  slots: FridayBranchTimeSlot[];
  classEntry: FridayBranchClass | null;
  slotId: string | null;
  isNew: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (slotId: string, classEntry: FridayBranchClass, previousSlotId?: string) => Promise<void>;
};

export function SchoolAdminFridayBranchClassEditSheet({
  visible,
  organizationId,
  slots,
  classEntry,
  slotId,
  isNew,
  saving = false,
  onClose,
  onSave,
}: SchoolAdminFridayBranchClassEditSheetProps) {
  const theme = useParentTheme();
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [draft, setDraft] = useState<FridayBranchClass | null>(classEntry);
  const [draftSlotId, setDraftSlotId] = useState(slotId ?? slots[0]?.id ?? '');
  const [priceInput, setPriceInput] = useState('');
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [flyerUploading, setFlyerUploading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDraft(classEntry ? { ...classEntry } : null);
    setDraftSlotId(slotId ?? slots[0]?.id ?? '');
    setPriceInput(formatFridayBranchPriceInput(classEntry?.priceCents));
    setPriceError(null);
  }, [classEntry, slotId, slots, visible]);

  if (!draft) return null;

  const isBusy = saving || isSaving || flyerUploading;
  const title = isNew ? 'Add a class' : `Edit ${classEntry?.name || 'class'}`;

  const handleSave = async () => {
    if (!draftSlotId || isBusy) return;

    const payload = buildFridayBranchClassSavePayload(draft, priceInput);
    if ('error' in payload) {
      setPriceError(payload.error);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(draftSlotId, payload, slotId ?? undefined);
      onClose();
    } catch {
      // Parent surfaces the error.
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickFlyer = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset) return;

    setFlyerUploading(true);
    try {
      const uploaded = await uploadFridayBranchClassFlyer(supabase, {
        organizationId,
        classId: draft.id,
      }, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
        size: asset.size,
      });

      setDraft({
        ...draft,
        flyerStoragePath: uploaded.storagePath,
        flyerFileName: uploaded.fileName,
        flyerFileSizeBytes: uploaded.fileSizeBytes,
      });
    } catch (error) {
      Alert.alert(
        'Upload failed',
        error instanceof Error ? error.message : 'Failed to upload flyer.',
      );
    } finally {
      setFlyerUploading(false);
    }
  };

  const handleRemoveFlyer = () => {
    if (!draft.flyerStoragePath) return;

    setDraft({
      ...draft,
      flyerStoragePath: null,
      flyerFileName: null,
      flyerFileSizeBytes: null,
    });
  };

  return (
    <StoryBottomSheet visible={visible} onClose={onClose} accessibilityLabel="Close class editor">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.ink }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Update the class details families and staff need.
        </Text>

        <StoryTextField
          label="Class name"
          value={draft.name}
          onChangeText={(name) => setDraft({ ...draft, name })}
        />

        <Text style={[styles.fieldLabel, { color: theme.ink }]}>Time slot</Text>
        <View style={styles.slotRow}>
          {slots.map((slot) => (
            <AdmissionsFilterPill
              key={slot.id}
              label={slot.time || 'Untitled'}
              active={draftSlotId === slot.id}
              onPress={() => setDraftSlotId(slot.id)}
            />
          ))}
        </View>

        <StoryTextField
          label="Age group"
          value={draft.ageGroup}
          onChangeText={(ageGroup) => setDraft({ ...draft, ageGroup })}
          placeholder="e.g. K–3, 9–12 yr"
        />
        <StoryTextField
          label="Location"
          value={draft.location}
          onChangeText={(location) => setDraft({ ...draft, location })}
          placeholder="e.g. La Casita, off-site"
        />
        <StoryTextField
          label="Class leader"
          value={draft.teacher ?? ''}
          onChangeText={(teacher) => setDraft({ ...draft, teacher })}
          placeholder="Staff member or volunteer"
        />
        <StoryTextField
          label="Price (optional)"
          value={priceInput}
          onChangeText={(value) => {
            setPriceInput(value);
            setPriceError(null);
          }}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
        {priceError ? <Text style={[styles.error, { color: theme.alert }]}>{priceError}</Text> : null}

        <StoryTextField
          label="Capacity (optional)"
          value={draft.capacity != null ? String(draft.capacity) : ''}
          onChangeText={(raw) => {
            const trimmed = raw.trim();
            if (!trimmed) {
              setDraft({ ...draft, capacity: null });
              return;
            }
            const parsed = Number.parseInt(trimmed, 10);
            setDraft({
              ...draft,
              capacity: Number.isFinite(parsed) && parsed > 0 ? parsed : null,
            });
          }}
          placeholder="Leave blank for unlimited"
          keyboardType="number-pad"
        />

        <View style={styles.flyerSection}>
          <Text style={[styles.fieldLabel, { color: theme.ink }]}>Class flyer (PDF)</Text>
          {draft.flyerFileName ? (
            <Text style={[styles.flyerName, { color: theme.muted }]}>{draft.flyerFileName}</Text>
          ) : (
            <Text style={[styles.flyerName, { color: theme.muted }]}>No flyer uploaded</Text>
          )}
          <View style={styles.flyerActions}>
            <StoryButton
              label={flyerUploading ? 'Uploading…' : 'Upload PDF'}
              variant="outline"
              previewSafe
              disabled={isBusy}
              onPress={() => void handlePickFlyer()}
            />
            {draft.flyerStoragePath ? (
              <StoryButton
                label="Remove"
                variant="outline"
                previewSafe
                disabled={isBusy}
                onPress={() => void handleRemoveFlyer()}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.visibilityRow}>
          <View style={styles.visibilityCopy}>
            <Text style={[styles.fieldLabel, { color: theme.ink }]}>Visible to families</Text>
            <Text style={[styles.visibilityHint, { color: theme.muted }]}>
              Hide draft classes until details are ready.
            </Text>
          </View>
          <Switch
            value={draft.familyVisible ?? true}
            onValueChange={(familyVisible) => setDraft({ ...draft, familyVisible })}
          />
        </View>

        <View style={styles.actions}>
          <StoryButton label="Cancel" variant="outline" previewSafe onPress={onClose} />
          <StoryButton
            label={isBusy ? 'Saving…' : 'Save class'}
            previewSafe
            disabled={isBusy}
            onPress={() => void handleSave()}
          />
        </View>
      </ScrollView>
    </StoryBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  title: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -Spacing.two,
  },
  fieldLabel: {
    fontFamily: StoryFonts.bodyMedium,
    fontSize: 14,
    fontWeight: '500',
  },
  slotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: -Spacing.two,
  },
  error: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  flyerSection: {
    gap: Spacing.two,
  },
  flyerName: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  flyerActions: {
    gap: Spacing.two,
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  visibilityCopy: {
    flex: 1,
    gap: 2,
  },
  visibilityHint: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    gap: Spacing.three,
  },
});
