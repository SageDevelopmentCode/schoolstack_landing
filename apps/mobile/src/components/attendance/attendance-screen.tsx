import { AttendanceRosterPanel } from '@/components/attendance/attendance-roster-panel';

type AttendanceScreenProps = {
  title: string;
};

export function AttendanceScreen({ title }: AttendanceScreenProps) {
  return <AttendanceRosterPanel title={title} active />;
}
