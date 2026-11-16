import { resolveTeacherHomeSubTabs } from '@/components/teacher/home/teacher-home-sub-tabs';

describe('resolveTeacherHomeSubTabs', () => {
  it('returns Overview and Help when attendance is disabled', () => {
    const tabs = resolveTeacherHomeSubTabs(false);
    expect(tabs.map((tab) => tab.id)).toEqual(['overview', 'help']);
  });

  it('includes Attendance between Overview and Help when attendance is enabled', () => {
    const tabs = resolveTeacherHomeSubTabs(true);
    expect(tabs.map((tab) => tab.id)).toEqual(['overview', 'attendance', 'help']);
  });
});

describe('resolveTeacherHomeSubTabs badge', () => {
  it('shows the not-marked count on Attendance only when above zero', () => {
    expect(resolveTeacherHomeSubTabs(true, 4)[1].badge).toBe(4);
    expect(resolveTeacherHomeSubTabs(true, 0)[1].badge).toBeUndefined();
  });
});
