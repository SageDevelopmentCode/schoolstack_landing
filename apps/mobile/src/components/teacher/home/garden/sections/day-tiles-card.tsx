import { Garden } from '@/components/parent/garden/tokens';
import { GCard } from '@/components/parent/garden/ui';
import { AdminKpiTiles, type AdminKpiTile } from '@/components/school-admin/garden/admin-ui';

/**
 * Today at a glance: linked number tiles (every number opens what's behind it).
 * Each tile appears only when its feature is on; the card hides with no tiles.
 */
export function DayTilesCard({
  studentCount,
  messagesUnreadCount,
  notMarkedCount,
  showStudents,
  showMessages,
  showAttendance,
  onOpenStudents,
  onOpenMessages,
  onOpenAttendance,
  index = 0,
}: {
  studentCount: number;
  messagesUnreadCount: number;
  /** `null` until today's roster has loaded. */
  notMarkedCount: number | null;
  showStudents: boolean;
  showMessages: boolean;
  showAttendance: boolean;
  onOpenStudents: () => void;
  onOpenMessages: () => void;
  onOpenAttendance: () => void;
  index?: number;
}) {
  const tiles: AdminKpiTile[] = [];
  if (showAttendance && notMarkedCount != null) {
    tiles.push({
      id: 'not-marked',
      label: notMarkedCount === 1 ? 'Student not marked yet' : 'Students not marked yet',
      value: String(notMarkedCount),
      barColor: notMarkedCount > 0 ? Garden.butter : Garden.mint,
      onPress: onOpenAttendance,
      testID: 'teacher-home-tile-attendance',
    });
  }
  if (showMessages) {
    tiles.push({
      id: 'unread-messages',
      label: messagesUnreadCount === 1 ? 'Unread message' : 'Unread messages',
      value: String(messagesUnreadCount),
      barColor: Garden.lav,
      onPress: onOpenMessages,
      testID: 'teacher-home-tile-messages',
    });
  }
  if (showStudents) {
    tiles.push({
      id: 'students',
      label: 'Students in your care',
      value: String(studentCount),
      barColor: Garden.sky,
      onPress: onOpenStudents,
      testID: 'teacher-home-tile-students',
    });
  }

  if (tiles.length === 0) return null;

  return (
    <GCard title="Today at a glance" index={index} testID="teacher-home-day-tiles">
      <AdminKpiTiles tiles={tiles} />
    </GCard>
  );
}
