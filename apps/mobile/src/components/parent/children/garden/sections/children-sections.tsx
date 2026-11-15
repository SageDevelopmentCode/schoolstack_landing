import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts, useGardenAccent } from '@/components/parent/garden/tokens';
import {
  ChildThumb,
  GCard,
  GChip,
  GKicker,
  GLink,
  GPressable,
  GRing,
  gText,
} from '@/components/parent/garden/ui';
import { checklistItemStatusLabel } from '@/lib/admissions/enrollment-checklist';
import { nextChecklistSteps } from '@/lib/parent/parent-children-garden';
import {
  childFirstName,
  childLearnerSubtitleLine,
  familyChildrenSubtitle,
  formatChildrenPageDate,
  type ChildProfileData,
  type ParentChildRecordSection,
} from '@/lib/parent/parent-children-utils';
import type { FamilyChildOverview, ParentAssignedTeacher } from '@/lib/parent/parent-portal-api';

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

export function ChildrenHeader({
  learners,
  selectedChild,
}: {
  learners: FamilyChildOverview[];
  selectedChild: FamilyChildOverview | null;
}) {
  const accent = useGardenAccent();
  const firstName = selectedChild ? childFirstName(selectedChild.studentName) : null;
  return (
    <View style={styles.header} testID="parent-children-story-header">
      <GKicker>My children · {formatChildrenPageDate()}</GKicker>
      <Text accessibilityRole="header" style={styles.title}>
        {firstName ? (
          <>
            <Text style={{ color: accent.clay }}>{firstName}</Text>
            {"'s profile"}
          </>
        ) : (
          'My children'
        )}
      </Text>
      <Text style={styles.subtitle}>{familyChildrenSubtitle(learners)}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Learner strip (polaroids)                                           */
/* ------------------------------------------------------------------ */

export function ChildrenLearnerStrip({
  learners,
  selectedApplicationId,
  onSelect,
}: {
  learners: FamilyChildOverview[];
  selectedApplicationId: string;
  onSelect: (applicationId: string) => void;
}) {
  const accent = useGardenAccent();
  if (learners.length <= 1) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      testID="parent-children-learner-strip"
      accessibilityRole="tablist"
      accessibilityLabel="Select learner"
      style={styles.stripScroll}
      contentContainerStyle={styles.strip}>
      {learners.map((child, index) => {
        const active = child.applicationId === selectedApplicationId;
        return (
          <GPressable
            key={child.applicationId}
            testID={`parent-children-learner-${child.applicationId}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${child.studentName}, ${childLearnerSubtitleLine(child)}`}
            haptic="select"
            pressedScale={0.96}
            onPress={() => {
              if (!active) onSelect(child.applicationId);
            }}
            style={[
              styles.learner,
              active
                ? { borderColor: accent.clay, backgroundColor: accent.wash }
                : { borderColor: Garden.ink12, backgroundColor: Garden.white },
            ]}>
            <ChildThumb
              name={child.studentName}
              photoUrl={child.profilePhotoUrl}
              size={52}
              tilt={index % 2 === 0 ? -3 : 3}
              index={index}
            />
            <View style={styles.learnerCopy}>
              <Text style={[gText.itemTitle, active && { color: accent.clayDeep }]} numberOfLines={1}>
                {childFirstName(child.studentName)}
              </Text>
              <Text style={styles.learnerMeta} numberOfLines={1}>
                {childLearnerSubtitleLine(child)}
              </Text>
            </View>
          </GPressable>
        );
      })}
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/* Next steps (urgent strip + notebook)                                */
/* ------------------------------------------------------------------ */

export function ChildNextStepsCard({
  profile,
  onOpenItem,
  onOpenSection,
}: {
  profile: ChildProfileData | null;
  onOpenItem: (itemId: string) => void;
  onOpenSection: (section: ParentChildRecordSection) => void;
}) {
  const accent = useGardenAccent();
  const steps = nextChecklistSteps(profile?.checklist ?? null);

  if (steps.length === 0) {
    return (
      <GCard kicker="Needs your attention" title="Everything is in good shape" index={1} testID="parent-children-overview">
        <View style={styles.goodShape}>
          <Ionicons name="checkmark-circle" size={20} color={Garden.forest} />
          <Text style={[gText.body, styles.flex]}>
            No required enrollment items are waiting on you right now.
          </Text>
        </View>
      </GCard>
    );
  }

  const [first, ...rest] = steps;
  return (
    <GCard
      kicker="Needs your attention"
      title="Next steps"
      index={1}
      testID="parent-children-overview"
      action={<GChip label={`${steps.length} to do`} tone="warning" />}>
      <GPressable
        accessibilityLabel={`${first.label}. ${first.typeLabel}, ${checklistItemStatusLabel(first.status)}. Open`}
        haptic="press"
        onPress={() => onOpenItem(first.itemId)}
        style={[styles.urgent, { backgroundColor: accent.clay }]}>
        <View style={styles.flex}>
          <Text style={styles.urgentKicker}>Up next · {first.typeLabel}</Text>
          <Text style={styles.urgentTitle} numberOfLines={2}>
            {first.label}
          </Text>
        </View>
        <View style={styles.openPillWrap}>
          <View style={styles.openPillUnderlay} />
          <View style={styles.openPill}>
            <Text style={styles.openPillText}>Open</Text>
            <Ionicons name="arrow-forward" size={14} color={Garden.ink} />
          </View>
        </View>
      </GPressable>
      {rest.length > 0 ? (
        <View style={styles.notebook}>
          {rest.slice(0, 2).map((step, i) => (
            <GPressable
              key={step.itemId}
              accessibilityLabel={`${step.label}, ${checklistItemStatusLabel(step.status)}. Open`}
              pressedScale={0.99}
              onPress={() => onOpenItem(step.itemId)}
              style={[styles.noteRow, i > 0 && styles.noteRule]}>
              <GRing size={22} />
              <View style={styles.flex}>
                <Text style={gText.itemTitle} numberOfLines={1}>
                  {step.label}
                </Text>
                <Text style={gText.meta}>
                  {step.typeLabel} · {checklistItemStatusLabel(step.status)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Garden.ink60} />
            </GPressable>
          ))}
        </View>
      ) : null}
      <GLink label="Review checklist" onPress={() => onOpenSection('checklist')} style={styles.link} />
    </GCard>
  );
}

/* ------------------------------------------------------------------ */
/* Guides at school                                                    */
/* ------------------------------------------------------------------ */

export function TeacherRow({ teacher, index }: { teacher: ParentAssignedTeacher; index: number }) {
  return (
    <View
      style={styles.teacher}
      accessible
      accessibilityLabel={teacher.roleTitle ? `${teacher.name}, ${teacher.roleTitle}` : teacher.name}>
      <ChildThumb name={teacher.name} photoUrl={teacher.profilePhotoUrl} size={48} index={index + 1} />
      <View style={styles.flex}>
        <Text style={gText.itemTitle} numberOfLines={1}>
          {teacher.name}
        </Text>
        {teacher.roleTitle ? (
          <Text style={gText.meta} numberOfLines={1}>
            {teacher.roleTitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function ChildGuidesCard({
  firstName,
  teachers,
  onSeeAll,
}: {
  firstName: string;
  teachers: ParentAssignedTeacher[];
  onSeeAll: () => void;
}) {
  return (
    <GCard
      kicker="Guides at school"
      title={teachers.length === 0 ? 'Teachers coming soon' : `${firstName}'s team`}
      tone="paper"
      index={2}>
      {teachers.length === 0 ? (
        <Text style={gText.meta}>
          Assigned teachers will appear here once {firstName} is linked to a class group.
        </Text>
      ) : (
        <View style={styles.teachers}>
          {teachers.slice(0, 2).map((teacher, i) => (
            <TeacherRow key={teacher.id} teacher={teacher} index={i} />
          ))}
          <GLink label="See all teachers" onPress={onSeeAll} />
        </View>
      )}
    </GCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: 4 },
  title: {
    fontFamily: GardenFonts.display,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.6,
    color: Garden.ink,
  },
  subtitle: { fontFamily: GardenFonts.bodySemi, fontSize: 14, color: Garden.soft },
  stripScroll: { marginHorizontal: -16 },
  strip: { paddingHorizontal: 16, gap: 10, paddingVertical: 4 },
  learner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    borderRadius: 18,
    borderWidth: 2,
    minWidth: 168,
  },
  learnerCopy: { gap: 2, maxWidth: 140 },
  learnerMeta: { fontFamily: GardenFonts.bodySemi, fontSize: 12, color: Garden.soft },
  goodShape: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  urgent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 16,
  },
  urgentKicker: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
  },
  urgentTitle: { fontFamily: GardenFonts.bodyExtra, fontSize: 17, color: Garden.white, marginTop: 2 },
  openPillWrap: { paddingBottom: 3 },
  openPillUnderlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 3,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: Garden.ink,
  },
  openPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Garden.ink,
    backgroundColor: Garden.white,
  },
  openPillText: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  notebook: {
    marginTop: 12,
    backgroundColor: Garden.notebook,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    overflow: 'hidden',
  },
  noteRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  noteRule: { borderTopWidth: 1, borderTopColor: 'rgba(46,74,60,0.1)' },
  link: { marginTop: 12 },
  teachers: { gap: 12 },
  teacher: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
