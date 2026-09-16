"use client";

import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  SIGNATURE_STATUS_LABELS,
  type TeacherFormSignatureRow,
  type TeacherFormSignatureStatus,
} from "@/lib/school-teacher/forms-documents/types";

type TeacherFormSignatureTableProps = {
  theme: ParentThemeTokens;
  rows: TeacherFormSignatureRow[];
};

function statusChipVariant(
  status: TeacherFormSignatureStatus,
): "success" | "warning" | "alert" {
  switch (status) {
    case "signed":
      return "success";
    case "overdue":
      return "alert";
    default:
      return "warning";
  }
}

function formatSignedDate(signedAt: string | null): string {
  if (!signedAt) return "—";
  const date = new Date(`${signedAt}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TeacherFormSignatureTable({
  theme,
  rows,
}: TeacherFormSignatureTableProps) {
  if (rows.length === 0) {
    return (
      <AdminCard theme={theme} padding="canvas">
        <p className="text-center text-sm" style={{ color: theme.muted }}>
          No families assigned yet. Signatures will appear here once the form is sent.
        </p>
      </AdminCard>
    );
  }

  return (
    <AdminCard theme={theme} padding="none">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr
              className="border-b text-[11px] font-semibold uppercase tracking-wide"
              style={{ borderColor: theme.line, color: theme.muted }}
            >
              <th className="px-4 py-3">Family</th>
              <th className="px-4 py-3">Student(s)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Signed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b last:border-b-0"
                style={{ borderColor: theme.line }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: theme.ink }}>
                  {row.familyName}
                </td>
                <td className="px-4 py-3" style={{ color: theme.muted }}>
                  {row.studentNames.join(", ")}
                </td>
                <td className="px-4 py-3">
                  <ParentChip theme={theme} tone={statusChipVariant(row.status)}>
                    {SIGNATURE_STATUS_LABELS[row.status]}
                  </ParentChip>
                </td>
                <td className="px-4 py-3" style={{ color: theme.muted }}>
                  {formatSignedDate(row.signedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 p-4 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border p-3"
            style={{ borderColor: theme.line, backgroundColor: theme.cream }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm" style={{ color: theme.ink }}>
                {row.familyName}
              </p>
              <ParentChip theme={theme} tone={statusChipVariant(row.status)}>
                {SIGNATURE_STATUS_LABELS[row.status]}
              </ParentChip>
            </div>
            <p className="mt-1 text-xs" style={{ color: theme.muted }}>
              {row.studentNames.join(", ")}
            </p>
            <p className="mt-2 text-xs" style={{ color: theme.muted }}>
              Signed: {formatSignedDate(row.signedAt)}
            </p>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
