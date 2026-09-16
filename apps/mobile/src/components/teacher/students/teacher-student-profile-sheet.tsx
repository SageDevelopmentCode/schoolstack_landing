import { StoryBottomSheet } from '@/components/story/story-bottom-sheet';
import { TeacherStudentDetailWorkspace } from '@/components/teacher/students/teacher-student-detail-workspace';
import type { TeacherStudentDetailScope } from '@/lib/teacher/teacher-nav';

type TeacherStudentProfileSheetProps = {
  visible: boolean;
  onClose: () => void;
  studentId: string | null;
  detailAccess: TeacherStudentDetailScope;
};

export function TeacherStudentProfileSheet({
  visible,
  onClose,
  studentId,
  detailAccess,
}: TeacherStudentProfileSheetProps) {
  const sheetOpen = visible && studentId != null;

  return (
    <StoryBottomSheet visible={sheetOpen} onClose={onClose} accessibilityLabel="Close student profile">
      {studentId ? (
        <TeacherStudentDetailWorkspace
          key={studentId}
          studentId={studentId}
          detailAccess={detailAccess}
          variant="sheet"
          onClose={onClose}
        />
      ) : null}
    </StoryBottomSheet>
  );
}
