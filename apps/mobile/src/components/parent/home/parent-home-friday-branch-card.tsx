import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ParentFridayBranchClassSheet } from '@/components/parent/friday-branch/parent-friday-branch-class-sheet';
import { ParentFridayBranchFlyerSheet } from '@/components/parent/friday-branch/parent-friday-branch-flyer-sheet';
import { StoryButton } from '@/components/story/story-button';
import { StoryCard } from '@/components/story/story-card';
import { StoryChip } from '@/components/story/story-chip';
import { StorySectionKicker } from '@/components/story/story-section-kicker';
import { useParentFridayBranch } from '@/contexts/parent-friday-branch-context';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { formatFeeAmount } from '@/lib/admissions/application-form-schema';
import type {
  ParentFridayBranchClassDetailBundle,
  ParentFridayBranchClassSummary,
  ParentFridayBranchFlyerTarget,
  ParentFridayBranchPageBundle,
} from '@/lib/parent/parent-friday-branch-types';
import {
  formatBlockTabDateRange,
  getBlockDisplayLabel,
  getFridayBranchSpotsBadge,
  selectDisplayBlock,
  studentNameById,
} from '@/lib/parent/parent-friday-branch-utils';
import { parentFridayBranchRoute } from '@/lib/parent/parent-nav';
import { StoryCardPadding, StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';

const MAX_ROWS = 3;

type ParentHomeFridayBranchCardProps = {
  slug: string;
  organizationId: string;
  initialBundle: ParentFridayBranchPageBundle;
};

function enrolledClasses(
  block: ParentFridayBranchPageBundle['blocks'][number],
): ParentFridayBranchClassSummary[] {
  return block.classes
    .filter((classSummary) => classSummary.familyEnrollments.length > 0)
    .slice(0, MAX_ROWS);
}

function openClasses(
  block: ParentFridayBranchPageBundle['blocks'][number],
  enrolled: ParentFridayBranchClassSummary[],
): ParentFridayBranchClassSummary[] {
  const enrolledIds = new Set(enrolled.map((classSummary) => classSummary.classId));
  const candidates = block.classes.filter((classSummary) => {
    if (enrolledIds.has(classSummary.classId)) return false;
    if (classSummary.capacity == null) return true;
    return (classSummary.spotsRemaining ?? 0) > 0;
  });

  if (candidates.length > 0) {
    return candidates.slice(0, MAX_ROWS);
  }

  return block.classes
    .filter((classSummary) => !enrolledIds.has(classSummary.classId))
    .slice(0, MAX_ROWS);
}

function findActiveClassContext(activeClassId: string, bundle: ParentFridayBranchPageBundle) {
  for (let index = 0; index < bundle.blocks.length; index += 1) {
    const entry = bundle.blocks[index];
    const match = entry.classes.find((classSummary) => classSummary.classId === activeClassId);
    if (match) {
      return {
        summary: match,
        blockLabel: getBlockDisplayLabel(entry.block, index),
        blockDateRange: formatBlockTabDateRange(
          entry.block.startDate,
          entry.block.endDate,
        ),
      };
    }
  }
  return null;
}

function ClassRow({
  classSummary,
  studentOptions,
  onOpenClass,
}: {
  classSummary: ParentFridayBranchClassSummary;
  studentOptions: ParentFridayBranchPageBundle['studentOptions'];
  onOpenClass: (classId: string) => void;
}) {
  const theme = useParentTheme();
  const spotsBadge = getFridayBranchSpotsBadge(classSummary);
  const hasEnrollment = classSummary.familyEnrollments.length > 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpenClass(classSummary.classId)}
      style={styles.classRow}>
      <View style={[styles.timePill, { backgroundColor: theme.primarySoft }]}>
        <Text style={[styles.timePillText, { color: theme.primary }]}>
          {classSummary.slotTime || '—'}
        </Text>
      </View>
      <View style={styles.classCopy}>
        <View style={styles.classTitleRow}>
          <Text style={[styles.className, { color: theme.ink }]}>{classSummary.name}</Text>
          {!hasEnrollment ? (
            <StoryChip tone={spotsBadge.tone} label={spotsBadge.label} uppercase={false} />
          ) : null}
        </View>
        {hasEnrollment ? (
          <View style={styles.enrollmentRow}>
            {classSummary.familyEnrollments.map((enrollment) => (
              <StoryChip
                key={enrollment.enrollmentId}
                tone={enrollment.status === 'waitlisted' ? 'warning' : 'success'}
                label={`${studentNameById(studentOptions, enrollment.studentId)}${
                  enrollment.status === 'waitlisted' ? ' · Waitlist' : ''
                }`}
                uppercase={false}
              />
            ))}
          </View>
        ) : (
          <Text style={[styles.classMeta, { color: theme.muted }]}>
            {[
              classSummary.location,
              classSummary.ageGroup,
              classSummary.priceCents != null
                ? formatFeeAmount(classSummary.priceCents)
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export function ParentHomeFridayBranchCard({
  slug,
  organizationId,
  initialBundle,
}: ParentHomeFridayBranchCardProps) {
  const theme = useParentTheme();
  const router = useRouter();
  const { bundle: contextBundle, applyClassDetailUpdate, hasLoaded } = useParentFridayBranch();
  const [localBundle, setLocalBundle] = useState(initialBundle);
  const bundle = hasLoaded && contextBundle ? contextBundle : localBundle;
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [flyerTarget, setFlyerTarget] = useState<ParentFridayBranchFlyerTarget | null>(null);

  const displayBlock = useMemo(() => selectDisplayBlock(bundle), [bundle]);
  const blockIndex = useMemo(() => {
    if (!displayBlock) return 0;
    return bundle.blocks.findIndex((entry) => entry.block.id === displayBlock.block.id);
  }, [bundle.blocks, displayBlock]);

  const blockMeta = useMemo(() => {
    if (!displayBlock) return null;
    return {
      label: getBlockDisplayLabel(displayBlock.block, blockIndex),
      dateRange: formatBlockTabDateRange(
        displayBlock.block.startDate,
        displayBlock.block.endDate,
      ),
    };
  }, [blockIndex, displayBlock]);

  const enrolled = useMemo(
    () => (displayBlock ? enrolledClasses(displayBlock) : []),
    [displayBlock],
  );
  const open = useMemo(
    () => (displayBlock ? openClasses(displayBlock, enrolled) : []),
    [displayBlock, enrolled],
  );

  const activeClassContext = useMemo(
    () => (activeClassId ? findActiveClassContext(activeClassId, bundle) : null),
    [activeClassId, bundle],
  );

  const openClass = useCallback((classId: string) => {
    setActiveClassId(classId);
  }, []);

  const closeClass = useCallback(() => {
    setActiveClassId(null);
  }, []);

  const handleEnrollmentChange = useCallback(
    (classId: string, detail: ParentFridayBranchClassDetailBundle) => {
      if (!hasLoaded || !contextBundle) {
        setLocalBundle((current) => {
          const nextBundle = {
            ...current,
            blocks: current.blocks.map((entry) => ({
              ...entry,
              classes: entry.classes.map((classSummary) => {
                if (classSummary.classId !== classId) return classSummary;

                const familyEnrollments = detail.studentStates
                  .filter((student) => student.status && student.enrollmentId)
                  .map((student) => ({
                    enrollmentId: student.enrollmentId!,
                    studentId: student.studentId,
                    status: student.status!,
                  }));

                return {
                  ...classSummary,
                  confirmedCount: detail.confirmedCount,
                  spotsRemaining:
                    detail.capacity == null
                      ? null
                      : Math.max(0, detail.capacity - detail.confirmedCount),
                  familyEnrollments,
                };
              }),
            })),
          };
          return nextBundle;
        });
      }
      applyClassDetailUpdate(classId, detail);
    },
    [applyClassDetailUpdate, contextBundle, hasLoaded],
  );

  if (!displayBlock || !blockMeta) {
    return null;
  }

  const showOpenClasses = open.length > 0;

  return (
    <>
      <StoryCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <StorySectionKicker>Friday Branch</StorySectionKicker>
            <Text style={[styles.blockTitle, { color: theme.ink }]}>{blockMeta.label}</Text>
            <Text style={[styles.blockDate, { color: theme.muted }]}>{blockMeta.dateRange}</Text>
          </View>
          <StoryButton
            label="View schedule"
            previewSafe
            variant="soft"
            onPress={() => router.push(parentFridayBranchRoute(slug))}
          />
        </View>

        {enrolled.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.muted }]}>Your sign-ups</Text>
            {enrolled.map((classSummary) => (
              <ClassRow
                key={classSummary.classId}
                classSummary={classSummary}
                studentOptions={bundle.studentOptions}
                onOpenClass={openClass}
              />
            ))}
          </View>
        ) : null}

        {showOpenClasses ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.muted }]}>Open classes</Text>
            {open.map((classSummary) => (
              <ClassRow
                key={classSummary.classId}
                classSummary={classSummary}
                studentOptions={bundle.studentOptions}
                onOpenClass={openClass}
              />
            ))}
          </View>
        ) : null}
      </StoryCard>

      <ParentFridayBranchClassSheet
        visible={Boolean(activeClassId)}
        organizationId={organizationId}
        classId={activeClassId}
        fallbackSummary={activeClassContext?.summary ?? null}
        blockLabel={activeClassContext?.blockLabel ?? blockMeta.label}
        blockDateRange={activeClassContext?.blockDateRange ?? blockMeta.dateRange}
        studentOptions={bundle.studentOptions}
        onClose={closeClass}
        onEnrollmentChange={handleEnrollmentChange}
        onViewFlyer={setFlyerTarget}
      />

      <ParentFridayBranchFlyerSheet
        visible={Boolean(flyerTarget)}
        organizationId={organizationId}
        target={flyerTarget}
        onClose={() => setFlyerTarget(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: StoryCardPadding,
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  blockTitle: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  blockDate: {
    fontFamily: StoryFonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  timePill: {
    borderRadius: 9,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  timePillText: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 11,
    fontWeight: '700',
  },
  classCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },
  classTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  className: {
    fontFamily: StoryFonts.bodySemiBold,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  classMeta: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  enrollmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
