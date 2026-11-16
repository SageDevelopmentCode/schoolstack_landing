import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { confirmDestructive } from '@/components/parent/garden/feedback';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { GSheet } from '@/components/parent/garden/sheet';
import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  ChildThumb,
  GChip,
  GLink,
  GPressable,
  GProgress,
  GToyButton,
} from '@/components/parent/garden/ui';
import {
  CONSENT_ICONS,
  CONSENT_TINTS,
  joinNames,
} from '@/components/parent/photos/garden/photo-permissions-ui';
import type {
  PhotoPermissionChange,
  PhotoPermissionSaveResult,
} from '@/components/parent/photos/garden/use-parent-photos-controller';
import { haptic } from '@/lib/haptics';
import type { ParentPhotoMediaConsentLearner } from '@/lib/parent/parent-photo-media-consent-api';
import {
  childFirstName,
  PHOTO_MEDIA_CONSENT_OPTIONS,
  photoMediaConsentLabel,
  type PhotoMediaConsent,
} from '@/lib/students/photo-media-consent';

type Drafts = Record<string, PhotoMediaConsent | null>;

function draftsFromLearners(learners: ParentPhotoMediaConsentLearner[]): Drafts {
  return Object.fromEntries(learners.map((learner) => [learner.studentId, learner.consent]));
}

/**
 * Garden sheet where a parent picks a photo permission per child. Nothing is
 * sent until Save; only changed children are saved, and children that saved
 * stay saved even if another one fails. Status shows inside the sheet because
 * toasts render behind native modals.
 */
export function PhotoPermissionsSheet({
  visible,
  learners,
  onClose,
  onSave,
  onSaved,
}: {
  visible: boolean;
  learners: ParentPhotoMediaConsentLearner[];
  onClose: () => void;
  onSave: (changes: PhotoPermissionChange[]) => Promise<PhotoPermissionSaveResult>;
  /** Every change saved: the screen closes the sheet and toasts `summary`. */
  onSaved: (summary: string) => void;
}) {
  const [drafts, setDrafts] = useState<Drafts>({});
  const [saving, setSaving] = useState(false);
  const [failures, setFailures] = useState<PhotoPermissionSaveResult['failures']>([]);
  const [partialSummary, setPartialSummary] = useState<string | null>(null);
  const confirmingRef = useRef(false);

  // Fresh drafts each time the sheet opens (saved rows update `learners` while it stays open).
  useEffect(() => {
    if (!visible) return;
    setDrafts(draftsFromLearners(learners));
    setFailures([]);
    setPartialSummary(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const savedById = useMemo(
    () => new Map(learners.map((learner) => [learner.studentId, learner.consent])),
    [learners],
  );
  const missing = learners.filter((learner) => drafts[learner.studentId] == null);
  const chosenCount = learners.length - missing.length;
  const changes = useMemo<PhotoPermissionChange[]>(
    () =>
      learners.flatMap((learner) => {
        const draft = drafts[learner.studentId];
        const saved = savedById.get(learner.studentId) ?? null;
        return draft && draft !== saved ? [{ studentId: learner.studentId, consent: draft }] : [];
      }),
    [drafts, learners, savedById],
  );
  const dirty = changes.length > 0;
  const canSave = missing.length === 0 && dirty && !saving;

  const requestClose = useCallback(() => {
    if (saving || confirmingRef.current) return;
    if (!dirty) {
      onClose();
      return;
    }
    confirmingRef.current = true;
    const names = joinNames(
      changes.map((change) => {
        const learner = learners.find((entry) => entry.studentId === change.studentId);
        return learner ? childFirstName(learner.studentName) : 'your child';
      }),
    );
    void confirmDestructive({
      title: 'Discard your changes?',
      message:
        changes.length === 1
          ? `Your new choice for ${names} hasn't been saved yet.`
          : `Your new choices for ${names} haven't been saved yet.`,
      confirmLabel: 'Discard changes',
      cancelLabel: 'Keep editing',
    }).then((discard) => {
      confirmingRef.current = false;
      if (discard) onClose();
    });
  }, [changes, dirty, learners, onClose, saving]);

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    setFailures([]);
    setPartialSummary(null);
    try {
      const result = await onSave(changes);
      const savedSummary = changes
        .filter((change) => result.savedIds.includes(change.studentId))
        .map((change) => {
          const learner = learners.find((entry) => entry.studentId === change.studentId);
          const name = learner ? childFirstName(learner.studentName) : 'Your child';
          return `${name}: ${photoMediaConsentLabel(change.consent)}`;
        })
        .join(' · ');

      if (result.failures.length === 0) {
        onSaved(savedSummary);
        return;
      }
      haptic.error();
      setFailures(result.failures);
      setPartialSummary(savedSummary || null);
    } finally {
      setSaving(false);
    }
  }, [canSave, changes, learners, onSave, onSaved]);

  const setDraft = (studentId: string, consent: PhotoMediaConsent) => {
    if (saving) return;
    setDrafts((prev) => ({ ...prev, [studentId]: consent }));
    setFailures((prev) => prev.filter((failure) => failure.studentId !== studentId));
  };

  const firstChoice = learners.map((learner) => drafts[learner.studentId]).find(Boolean) ?? null;
  const canApplyAll =
    learners.length > 1 &&
    firstChoice != null &&
    learners.some((learner) => drafts[learner.studentId] !== firstChoice);
  const applyToAll = () => {
    if (!firstChoice || saving) return;
    setDrafts(Object.fromEntries(learners.map((learner) => [learner.studentId, firstChoice])));
    setFailures([]);
  };

  const statusText = saving
    ? 'Saving your choices…'
    : missing.length > 0
      ? `Choose a level for ${joinNames(missing.map((learner) => childFirstName(learner.studentName)))} to save.`
      : dirty
        ? `${changes.length} ${changes.length === 1 ? 'change' : 'changes'} ready to save.`
        : 'No changes yet. Pick a different level to update it.';

  const allChosen = missing.length === 0;

  return (
    <GSheet
      visible={visible}
      onClose={requestClose}
      enableDragToDismiss={!dirty && !saving}
      title="Photo permissions"
      subtitle="Choose how the school may use photos and video of each child. Nothing changes until you save."
      accessibilityLabel="Close photo permissions"
      headerAside={
        learners.length > 1 ? (
          <GChip
            tone={allChosen ? 'success' : 'info'}
            icon={allChosen ? 'checkmark' : undefined}
            label={`${chosenCount} of ${learners.length}`}
          />
        ) : null
      }
      footer={
        <View style={styles.footer}>
          <Text accessibilityLiveRegion="polite" style={styles.status}>
            {statusText}
          </Text>
          <GToyButton
            testID="parent-photo-permissions-save"
            label={saving ? 'Saving…' : 'Save permissions'}
            icon="checkmark"
            size="md"
            fullWidth
            loading={saving}
            disabled={!canSave}
            accessibilityHint={canSave ? undefined : statusText}
            onPress={() => void handleSave()}
          />
        </View>
      }>
      <View style={styles.content} testID="parent-photo-permissions-sheet">
        {learners.length > 1 ? (
          <View style={styles.progressRow}>
            <GProgress
              value={learners.length ? chosenCount / learners.length : 0}
              done={allChosen}
              label={`Children with a choice: ${chosenCount} of ${learners.length}`}
              style={styles.progress}
            />
            {canApplyAll && firstChoice ? (
              <GLink
                label={`Use ${photoMediaConsentLabel(firstChoice)} for everyone`}
                icon="copy-outline"
                accessibilityHint="Sets every child to the same level. You still need to save."
                onPress={applyToAll}
              />
            ) : null}
          </View>
        ) : null}

        {failures.length > 0 ? (
          <GInlineBanner
            tone="error"
            title={`We couldn't save for ${joinNames(failures.map((failure) => failure.name))}.`}
            description={
              partialSummary
                ? `Saved ${partialSummary}. ${failures[0].message} The other choice is still selected, so you can tap Save again.`
                : `${failures[0].message} Your choices are still selected, so you can tap Save again.`
            }
          />
        ) : null}

        {learners.map((learner, index) => {
          const draft = drafts[learner.studentId] ?? null;
          const saved = savedById.get(learner.studentId) ?? null;
          const changed = draft != null && draft !== saved;
          const failed = failures.some((failure) => failure.studentId === learner.studentId);
          return (
            <ChildChoiceBlock
              key={learner.studentId}
              learner={learner}
              index={index}
              draft={draft}
              saved={saved}
              changed={changed}
              failed={failed}
              disabled={saving}
              onChoose={(consent) => setDraft(learner.studentId, consent)}
            />
          );
        })}
      </View>
    </GSheet>
  );
}

function ChildChoiceBlock({
  learner,
  index,
  draft,
  saved,
  changed,
  failed,
  disabled,
  onChoose,
}: {
  learner: ParentPhotoMediaConsentLearner;
  index: number;
  draft: PhotoMediaConsent | null;
  saved: PhotoMediaConsent | null;
  changed: boolean;
  failed: boolean;
  disabled: boolean;
  onChoose: (consent: PhotoMediaConsent) => void;
}) {
  const firstName = childFirstName(learner.studentName);
  return (
    <View
      style={styles.child}
      accessibilityRole="radiogroup"
      accessibilityLabel={`Photo permission for ${learner.studentName}`}>
      <View style={styles.childHead}>
        <ChildThumb name={learner.studentName} photoUrl={null} size={44} index={index} />
        <View style={styles.childCopy}>
          <Text style={styles.childName} numberOfLines={1}>
            {learner.studentName}
          </Text>
          <Text style={styles.childMeta} numberOfLines={1}>
            {saved ? `Saved: ${photoMediaConsentLabel(saved)}` : 'Not set yet'}
          </Text>
        </View>
        {failed ? (
          <GChip tone="alert" icon="alert-circle" label="Not saved" />
        ) : changed ? (
          <GChip tone="info" icon="create-outline" label="Changed" />
        ) : !draft ? (
          <GChip tone="warning" label="Needs a choice" />
        ) : null}
      </View>

      <View style={styles.options}>
        {PHOTO_MEDIA_CONSENT_OPTIONS.map((option) => (
          <ConsentOptionCard
            key={option.value}
            value={option.value}
            label={option.label}
            description={option.description}
            selected={draft === option.value}
            disabled={disabled}
            childName={firstName}
            onPress={() => onChoose(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

function ConsentOptionCard({
  value,
  label,
  description,
  selected,
  disabled,
  childName,
  onPress,
}: {
  value: PhotoMediaConsent;
  label: string;
  description: string;
  selected: boolean;
  disabled: boolean;
  childName: string;
  onPress: () => void;
}) {
  const accent = useGardenAccent();
  return (
    <GPressable
      testID={`parent-photo-permission-${value}`}
      accessibilityRole="radio"
      accessibilityLabel={`${label} for ${childName}. ${description}`}
      accessibilityState={{ selected, checked: selected, disabled }}
      haptic="select"
      pressedScale={0.98}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.option,
        selected
          ? { borderColor: accent.clay, borderWidth: 2, backgroundColor: accent.wash }
          : { borderColor: Garden.ink12, backgroundColor: Garden.white },
      ]}>
      <View style={[styles.optionIcon, { backgroundColor: CONSENT_TINTS[value] }]}>
        <Ionicons name={CONSENT_ICONS[value]} size={18} color={Garden.ink} />
      </View>
      <View style={styles.optionCopy}>
        <Text style={styles.optionLabel}>{label}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View
        style={[
          styles.radio,
          selected
            ? { borderColor: accent.clay, backgroundColor: accent.clay }
            : { borderColor: Garden.ink25, backgroundColor: Garden.white },
        ]}>
        {selected ? <Ionicons name="checkmark" size={14} color={Garden.white} /> : null}
      </View>
    </GPressable>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, paddingBottom: 8 },
  progressRow: { gap: 10 },
  progress: { alignSelf: 'stretch' },
  child: {
    gap: 10,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Garden.ink10,
    backgroundColor: Garden.paper,
  },
  childHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  childCopy: { flex: 1, minWidth: 0, gap: 1 },
  childName: {
    fontFamily: GardenFonts.display,
    fontSize: 19,
    lineHeight: 23,
    color: Garden.ink,
    letterSpacing: -0.4,
  },
  childMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  options: { gap: 8 },
  option: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Garden.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCopy: { flex: 1, minWidth: 0, gap: 3 },
  optionLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  optionDescription: {
    fontFamily: GardenFonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: Garden.soft,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  footer: { gap: 10, paddingBottom: 4 },
  status: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: Garden.soft, textAlign: 'center' },
});
