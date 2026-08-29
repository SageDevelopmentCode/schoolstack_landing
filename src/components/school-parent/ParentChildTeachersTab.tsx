"use client";

import StudentPhoto from "@/components/students/StudentPhoto";
import type { ParentAssignedTeacher } from "@/lib/admissions/parent-portal-access";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ParentChildTeachersTabProps = {
  teachers: ParentAssignedTeacher[];
  C: AdminThemeTokens;
};

export default function ParentChildTeachersTab({
  teachers,
  C,
}: ParentChildTeachersTabProps) {
  if (teachers.length === 0) {
    return (
      <div
        className="rounded-2xl border bg-white px-5 py-8 text-center"
        style={{ borderColor: C.border, boxShadow: C.shadowCard }}
      >
        <p className="text-sm" style={{ color: C.textTertiary }}>
          No teachers assigned yet.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {teachers.map((teacher) => (
        <li
          key={teacher.id}
          className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3.5"
          style={{ borderColor: C.border, boxShadow: C.shadowCard }}
        >
          <StudentPhoto
            name={teacher.name}
            photoUrl={teacher.profilePhotoUrl}
            size="lg"
            shape="circle"
            theme={C}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold" style={{ color: C.textPrimary }}>
              {teacher.name}
            </p>
            {teacher.roleTitle ? (
              <p className="mt-0.5 truncate text-xs" style={{ color: C.textTertiary }}>
                {teacher.roleTitle}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
