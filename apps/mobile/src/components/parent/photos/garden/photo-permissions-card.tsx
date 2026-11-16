import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GAccentStrip } from '@/components/parent/garden/accent-strip';
import { GInlineBanner } from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import {
  ChildThumb,
  GCard,
  GChip,
  GLink,
  GOutlineButton,
  GSegmentDots,
  GSkeleton,
} from '@/components/parent/garden/ui';
import {
  consentChipTone,
  consentIcon,
  formatConsentUpdated,
  joinNames,
} from '@/components/parent/photos/garden/photo-permissions-ui';
import type { ConsentsStatus } from '@/components/parent/photos/garden/use-parent-photos-controller';
import type { ParentPhotoMediaConsentLearner } from '@/lib/parent/parent-photo-media-consent-api';
import { childFirstName, photoMediaConsentLabel } from '@/lib/students/photo-media-consent';

const TEST_ID = 'parent-photo-permissions-banner';

/**
 * Each child's photo permission. When a child still needs a choice this is the
 * screen's one primary action (accent strip); once every child is set it is a
 * calm summary card with an outline "Edit permissions" button.
 */
export function PhotoPermissionsCard({
  status,
  learners,
  unsetLearners,
  setCount,
  recentlyUpdatedIds,
  onEdit,
  onRetry,
  index,
}: {
  status: ConsentsStatus;
  learners: ParentPhotoMediaConsentLearner[];
  unsetLearners: ParentPhotoMediaConsentLearner[];
  setCount: number;
  recentlyUpdatedIds: string[];
  onEdit: () => void;
  onRetry: () => void;
  index: number;
}) {
  if (status === 'loading') {
    return (
      <GCard index={index} title="Photo permissions" testID={TEST_ID}>
        <View style={styles.rows} accessible accessibilityLabel="Loading photo permissions">
          {[0, 1].map((row) => (
            <View key={row} style={styles.skeletonRow}>
              <GSkeleton style={styles.skeletonThumb} />
              <View style={styles.skeletonCopy}>
                <GSkeleton style={styles.skeletonLine} />
                <GSkeleton style={styles.skeletonLineShort} />
              </View>
            </View>
          ))}
        </View>
      </GCard>
    );
  }

  if (status === 'error') {
    return (
      <View testID={TEST_ID}>
        <GInlineBanner
          tone="warning"
          title="Couldn't load photo permissions"
          description="The gallery still works. Check your connection, then try again."
          action={<GLink label="Try again" icon="refresh" onPress={onRetry} style={styles.retry} />}
        />
      </View>
    );
  }

  // Children who aren't enrolled yet have nothing to set, same as before.
  if (learners.length === 0) return null;

  const total = learners.length;

  if (unsetLearners.length > 0) {
    const names = joinNames(unsetLearners.map((learner) => childFirstName(learner.studentName)));
    return (
      <View testID={TEST_ID} style={styles.stripWrap}>
        <GAccentStrip
          title="Set photo permissions"
          subtitle={`Choose how the school may use photos of ${names}.`}
          pillLabel={setCount > 0 ? 'Finish' : 'Start'}
          accessibilityHint="Opens a sheet with three levels to pick from for each child"
          onPress={onEdit}>
          {total > 1 ? (
            <View style={styles.stripProgress}>
              <GSegmentDots done={setCount} total={total} onDark />
              <Text style={styles.stripProgressText}>
                {setCount} of {total} set
              </Text>
            </View>
          ) : null}
        </GAccentStrip>
        {setCount > 0 ? (
          <LearnerRows learners={learners} recentlyUpdatedIds={recentlyUpdatedIds} compact />
        ) : null}
      </View>
    );
  }

  return (
    <GCard
      index={index}
      title="Photo permissions"
      action={<GChip tone="success" icon="checkmark" label={total > 1 ? 'All set' : 'Set'} />}
      testID={TEST_ID}>
      <LearnerRows learners={learners} recentlyUpdatedIds={recentlyUpdatedIds} />
      <View style={styles.footer}>
        <GOutlineButton
          label="Edit permissions"
          icon="create-outline"
          accessibilityHint="Opens a sheet to change how the school may use each child's photos"
          onPress={onEdit}
        />
        <Text style={styles.footnote}>You can change these at any time.</Text>
      </View>
    </GCard>
  );
}

function LearnerRows({
  learners,
  recentlyUpdatedIds,
  compact = false,
}: {
  learners: ParentPhotoMediaConsentLearner[];
  recentlyUpdatedIds: string[];
  compact?: boolean;
}) {
  return (
    <View style={[styles.rows, compact && styles.rowsCompact]}>
      {learners.map((learner, index) => {
        const justSaved = recentlyUpdatedIds.includes(learner.studentId);
        const updated = formatConsentUpdated(learner.updatedAt);
        const label = photoMediaConsentLabel(learner.consent);
        return (
          <View
            key={learner.studentId}
            accessible
            accessibilityLabel={`${learner.studentName}: ${label}${justSaved ? ', just saved' : ''}`}
            style={[styles.row, justSaved && styles.rowSaved]}>
            <ChildThumb name={learner.studentName} photoUrl={null} size={40} index={index} />
            <View style={styles.rowCopy}>
              <Text style={styles.rowName} numberOfLines={1}>
                {learner.studentName}
              </Text>
              {updated && !compact ? <Text style={styles.rowMeta}>{updated}</Text> : null}
            </View>
            {justSaved ? (
              <Animated.View entering={FadeIn.duration(220)}>
                <GChip tone="success" icon="checkmark-circle" label="Saved" />
              </Animated.View>
            ) : (
              <GChip
                tone={consentChipTone(learner.consent)}
                icon={consentIcon(learner.consent)}
                label={label}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stripWrap: { gap: 10 },
  stripProgress: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  stripProgressText: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  rows: { gap: 8 },
  rowsCompact: { paddingHorizontal: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: Garden.notebook,
    borderWidth: 1,
    borderColor: Garden.ink10,
  },
  rowSaved: { backgroundColor: Garden.mint, borderColor: 'transparent' },
  rowCopy: { flex: 1, minWidth: 0, gap: 1 },
  rowName: { fontFamily: GardenFonts.bodyExtra, fontSize: 15, color: Garden.ink },
  rowMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 12, color: Garden.soft },
  footer: { marginTop: 14, gap: 8 },
  footnote: { fontFamily: GardenFonts.bodySemi, fontSize: 12.5, color: Garden.soft },
  retry: { marginTop: 4 },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skeletonThumb: { width: 40, height: 40, borderRadius: 8 },
  skeletonCopy: { flex: 1, gap: 6 },
  skeletonLine: { height: 14, borderRadius: 7, width: '60%' },
  skeletonLineShort: { height: 12, borderRadius: 6, width: '35%' },
});
