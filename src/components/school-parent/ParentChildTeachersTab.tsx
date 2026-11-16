"use client";

import { TeacherAvatar } from "@/components/school-parent/children/garden/TeacherAvatar";
import type { ParentAssignedTeacher } from "@/lib/admissions/parent-portal-access";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentChildTeachersTabProps = {
  teachers: ParentAssignedTeacher[];
  /** Kept for API stability (Garden styling uses the frame's tokens). */
  C?: AdminThemeTokens;
};

/** Teachers tab of a child's school record: Garden person cards. Renders inside ParentGardenFrame. */
export default function ParentChildTeachersTab({ teachers }: ParentChildTeachersTabProps) {
  if (teachers.length === 0) {
    return (
      <p
        className="m-0 rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 px-5 py-8 text-center text-[14px] font-semibold text-[var(--sf-soft)]"
        data-testid="parent-child-teachers-empty"
      >
        No teachers assigned yet.
      </p>
    );
  }

  return (
    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2" data-testid="parent-child-teachers">
      {teachers.map((teacher, i) => (
        <li
          key={teacher.id}
          className="flex items-center gap-3.5 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-4 py-3.5"
        >
          <TeacherAvatar teacher={teacher} index={i} size="lg" />
          <div className="min-w-0">
            <h3 className="m-0 truncate text-[16px] font-extrabold text-[var(--sf-ink)]">{teacher.name}</h3>
            {teacher.roleTitle ? (
              <p className="m-0 mt-0.5 truncate text-[13px] font-semibold text-[var(--sf-soft)]">{teacher.roleTitle}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
