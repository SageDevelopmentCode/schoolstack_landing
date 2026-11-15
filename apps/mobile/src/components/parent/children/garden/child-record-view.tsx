import { useEffect } from 'react';
import { View } from 'react-native';

import { ChecklistItemSheet } from '@/components/parent/children/garden/checklist/checklist-item-sheet';
import { ChildRecordCard } from '@/components/parent/children/garden/sections/child-record-card';
import {
  ChildGuidesCard,
  ChildNextStepsCard,
} from '@/components/parent/children/garden/sections/children-sections';
import { ApplicationStepSheet } from '@/components/parent/children/garden/sheets/application-step-sheet';
import { useChildRecord, type ChildRecordInput } from '@/components/parent/children/garden/use-child-record';
import type { ChildProfileData, ParentChildRecordSection } from '@/lib/parent/parent-children-utils';

/**
 * One child's record: (optionally) next steps + guides, then the school
 * record card, plus the sheets it owns. Mount with `key={applicationId}` so
 * switching child resets sheet state.
 */
export function ChildRecordView({
  profile,
  showOverview,
  onRecordLayout,
  onCelebrate,
  onOpenSection,
  ...input
}: Omit<ChildRecordInput, 'application' | 'checklist'> & {
  profile: ChildProfileData;
  showOverview: boolean;
  /** Overview links ("Review checklist", "See all teachers"); defaults to switching the tab. */
  onOpenSection?: (section: ParentChildRecordSection) => void;
  onRecordLayout?: (y: number) => void;
  /** The checklist just reached 100%: the screen mounts `GCelebrate` at its root. */
  onCelebrate: (celebrationKey: string) => void;
}) {
  const record = useChildRecord({
    ...input,
    application: profile.application,
    checklist: profile.checklist,
  });

  useEffect(() => {
    if (record.celebrate) onCelebrate(record.celebrationKey);
  }, [onCelebrate, record.celebrate, record.celebrationKey]);

  const openSection = onOpenSection ?? input.onSectionChange;
  const viewChecklist = record.checklist ? { ...profile, checklist: record.checklist } : profile;

  return (
    <>
      {showOverview ? (
        <>
          <ChildNextStepsCard
            profile={viewChecklist}
            onOpenItem={(itemId) => {
              record.onSectionChange('checklist');
              record.openEnrollmentItem(itemId);
            }}
            onOpenSection={openSection}
          />
          <ChildGuidesCard
            firstName={record.snapshot.firstName}
            teachers={profile.assignedTeachers}
            onSeeAll={() => openSection('teachers')}
          />
        </>
      ) : null}

      <View onLayout={(event) => onRecordLayout?.(event.nativeEvent.layout.y)}>
        <ChildRecordCard
          record={record}
          organizationId={input.organizationId}
          teachers={profile.assignedTeachers}
          checklistProgress={input.childOverview.checklistProgress}
        />
      </View>

      <ApplicationStepSheet
        step={record.applicationStep}
        detail={profile.application}
        onClose={record.closeApplicationStep}
      />
      <ChecklistItemSheet
        item={record.enrollmentItem}
        checklist={record.checklist}
        organizationId={input.organizationId}
        initialSectionId={record.enrollmentSectionId ?? undefined}
        onChecklistUpdated={record.updateChecklist}
        onCompleted={record.onEnrollmentItemCompleted}
        onClose={record.closeEnrollmentItem}
      />
    </>
  );
}
