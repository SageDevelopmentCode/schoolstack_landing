"use client";

import { Check } from "lucide-react";
import { simplifyDutyRoleTitle } from "@/data/school-demos/rooted-meadows-committees";
import type { CommitteeDutyRole } from "./types";

export default function DutyRoleAccessPicker({
  dutyRoles,
  selectedIds,
  onChange,
}: {
  dutyRoles: CommitteeDutyRole[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const allIds = dutyRoles.map((r) => r.id);
  const everyoneSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  const toggleRole = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((r) => r !== id)
        : [...selectedIds, id],
    );
  };

  const toggleEveryone = () => {
    onChange(everyoneSelected ? [] : [...allIds]);
  };

  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Who can access
      </label>
      <p className="text-xs text-gray-400 mt-1 mb-3">
        Tap roles that should see this resource. All selected = everyone.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={toggleEveryone}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer col-span-2 ${
            everyoneSelected
              ? "border-[#827096] bg-[#827096]/8 text-[#5A4D68]"
              : "border-gray-200 text-gray-600 hover:border-[#827096]/30 hover:bg-gray-50"
          }`}
        >
          {everyoneSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
          Everyone
        </button>
        {dutyRoles.map((role) => {
          const selected = selectedIds.includes(role.id);
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => toggleRole(role.id)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer min-h-[44px] ${
                selected
                  ? "border-[#827096] bg-[#827096]/8 text-[#5A4D68]"
                  : "border-gray-200 text-gray-600 hover:border-[#827096]/30 hover:bg-gray-50"
              }`}
            >
              {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
              <span className="leading-tight text-center">
                {simplifyDutyRoleTitle(role.title)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
