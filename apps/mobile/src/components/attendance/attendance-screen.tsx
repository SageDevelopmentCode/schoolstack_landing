import { AttendanceRosterPanel } from '@/components/attendance/attendance-roster-panel';

type AttendanceScreenProps = {
  title: string;
  /** `admin` = School admin More › Attendance header (see `AttendanceRosterPanel`). */
  headerVariant?: 'plain' | 'admin';
};

export function AttendanceScreen({ title, headerVariant = 'plain' }: AttendanceScreenProps) {
  return <AttendanceRosterPanel title={title} active headerVariant={headerVariant} />;
}
