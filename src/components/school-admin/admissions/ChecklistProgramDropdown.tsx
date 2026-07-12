"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ProgramOption } from "@/lib/admissions/application-forms";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
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
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === programId) ?? null,
    [programs, programId],
  );

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        disabled={readOnly}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex max-w-xs items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        style={getAdminButtonStyle(C, "secondary")}
      >
        <span className="truncate">{selectedProgram?.name ?? "Program"}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
      </button>

      {open && !readOnly ? (
        <div
          role="listbox"
          aria-label="Program"
          className="absolute right-0 top-full z-20 mt-1 min-w-[12rem] max-w-xs rounded-md border py-1 shadow-lg"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          {programs.length === 0 ? (
            <p className="px-3 py-2 text-xs" style={{ color: C.textTertiary }}>
              No programs available
            </p>
          ) : (
            programs.map((program) => {
              const isSelected = program.id === programId;

              return (
                <button
                  key={program.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(program.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center px-3 py-2 text-left text-xs transition-colors"
                  style={{
                    color: C.textPrimary,
                    backgroundColor: isSelected ? C.accentLight : "transparent",
                  }}
                >
                  <span className="truncate font-semibold">{program.name}</span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
