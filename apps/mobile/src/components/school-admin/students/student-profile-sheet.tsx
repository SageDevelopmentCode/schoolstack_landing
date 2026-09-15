import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { StudentDetailWorkspace } from '@/components/school-admin/students/student-detail-workspace';

type StudentProfileSheetProps = {
  visible: boolean;
  onClose: () => void;
  organizationId: string;
  slug: string;
  studentId: string | null;
};

export function StudentProfileSheet({
  visible,
  onClose,
  organizationId,
  slug,
  studentId,
}: StudentProfileSheetProps) {
  const sheetOpen = visible && studentId != null;

  return (
    <StoryBottomSheet visible={sheetOpen} onClose={onClose}>
      {studentId ? (
        <StudentDetailWorkspace
          key={studentId}
          organizationId={organizationId}
          studentId={studentId}
          slug={slug}
          variant="sheet"
          onClose={onClose}
        />
      ) : null}
    </StoryBottomSheet>
  );
}
