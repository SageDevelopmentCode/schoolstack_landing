"use client";

import { useMemo } from "react";
import type { ProgramOption } from "@/lib/admissions/application-forms";
import SchoolAdminSelect from "@/components/school-admin/ui/SchoolAdminSelect";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ChecklistProgramDropdownProps = {
  C: AdminThemeTokens;
  programs: ProgramOption[];
  programId: string | null;
  readOnly?: boolean;
  onChange: (programId: string | null) => void;
};

export default function ChecklistProgramDropdown({
  C,
  programs,
  programId,
  readOnly = false,
  onChange,
}: ChecklistProgramDropdownProps) {
  const options = useMemo(
    () => programs.map((program) => ({ value: program.id, label: program.name })),
    [programs],
  );

  return (
    <SchoolAdminSelect
      C={C}
      value={programId ?? ""}
      onChange={(value) => onChange(value || null)}
      options={options}
      placeholder="Program"
      disabled={readOnly}
      ariaLabel="Program"
      className="max-w-xs"
      triggerClassName="text-xs font-semibold"
    />
  );
}
