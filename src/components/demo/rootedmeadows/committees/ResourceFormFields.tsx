"use client";

import type { CommitteeDutyRole, CommitteeResource } from "./types";
import { inputClass } from "./CommitteeModalShell";
import DutyRoleAccessPicker from "./DutyRoleAccessPicker";

export type ResourceFormValue = {
  title: string;
  type: CommitteeResource["type"];
  description: string;
  url: string;
  selectedDutyRoleIds: string[];
};

export function dutyRolesToFormSelection(
  allowedDutyRoleIds: string[] | undefined,
  dutyRoles: CommitteeDutyRole[],
): string[] {
  const allIds = dutyRoles.map((r) => r.id);
  if (!allowedDutyRoleIds || allowedDutyRoleIds.length === 0) {
    return allIds;
  }
  const allSelected = allIds.every((id) => allowedDutyRoleIds.includes(id));
  return allSelected ? allIds : allowedDutyRoleIds;
}

export function normalizeAllowedDutyRoleIds(
  selected: string[],
  dutyRoles: CommitteeDutyRole[],
): string[] | undefined {
  const allIds = dutyRoles.map((r) => r.id);
  const allSelected = allIds.every((id) => selected.includes(id));
  return allSelected ? undefined : selected;
}

export default function ResourceFormFields({
  value,
  onChange,
  dutyRoles,
}: {
  value: ResourceFormValue;
  onChange: (patch: Partial<ResourceFormValue>) => void;
  dutyRoles: CommitteeDutyRole[];
}) {
  return (
    <>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Title
        </label>
        <input
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className={inputClass}
          placeholder="Resource name"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Type
        </label>
        <select
          value={value.type}
          onChange={(e) =>
            onChange({ type: e.target.value as CommitteeResource["type"] })
          }
          className={inputClass}
        >
          <option value="pdf">PDF</option>
          <option value="doc">Document</option>
          <option value="link">Link</option>
          <option value="checklist">Checklist</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Description
        </label>
        <input
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className={inputClass}
          placeholder="Optional description"
        />
      </div>
      {value.type === "link" && (
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            URL
          </label>
          <input
            value={value.url}
            onChange={(e) => onChange({ url: e.target.value })}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      )}
      <DutyRoleAccessPicker
        dutyRoles={dutyRoles}
        selectedIds={value.selectedDutyRoleIds}
        onChange={(selectedDutyRoleIds) => onChange({ selectedDutyRoleIds })}
      />
    </>
  );
}
