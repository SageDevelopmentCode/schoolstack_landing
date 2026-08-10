"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { MessageStudentRef } from "@/lib/messages/types";

export default function MessageStudentSubtitle({
  students,
  subtitle,
  onStudentClick,
  C,
  truncate = false,
}: {
  students?: MessageStudentRef[];
  subtitle?: string;
  onStudentClick?: (studentId: string) => void;
  C: AdminThemeTokens;
  truncate?: boolean;
}) {
  const className = `text-xs ${truncate ? "truncate" : ""}`;

  if (!students?.length) {
    if (!subtitle) return null;
    return (
      <p className={className} style={{ color: C.textTertiary }}>
        {subtitle}
      </p>
    );
  }

  if (!onStudentClick) {
    return (
      <p className={className} style={{ color: C.textTertiary }}>
        {subtitle ?? students.map((student) => student.name).join(" · ")}
      </p>
    );
  }

  return (
    <p className={className} style={{ color: C.textTertiary }}>
      {students.map((student, index) => (
        <span key={student.id}>
          {index > 0 ? <span className="mx-0.5">·</span> : null}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onStudentClick(student.id);
            }}
            className="cursor-pointer underline-offset-2 hover:underline"
            style={{ color: C.accent }}
          >
            {student.name}
          </button>
        </span>
      ))}
    </p>
  );
}
