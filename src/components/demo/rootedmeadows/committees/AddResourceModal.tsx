"use client";

import { useState } from "react";
import { createCommitteeEntityId } from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeResource } from "./types";
import CommitteeModalShell from "./CommitteeModalShell";
import ResourceFormFields, {
  normalizeAllowedDutyRoleIds,
  type ResourceFormValue,
} from "./ResourceFormFields";

function emptyForm(committee: Committee): ResourceFormValue {
  const allIds = committee.dutyRoles.map((r) => r.id);
  return {
    title: "",
    type: "pdf",
    description: "",
    url: "",
    selectedDutyRoleIds: allIds,
  };
}

export default function AddResourceModal({
  committee,
  onClose,
  onSave,
}: {
  committee: Committee;
  onClose: () => void;
  onSave: (resource: CommitteeResource) => void;
}) {
  const [form, setForm] = useState<ResourceFormValue>(() => emptyForm(committee));

  const handleSave = () => {
    if (!form.title.trim() || form.selectedDutyRoleIds.length === 0) return;
    onSave({
      id: createCommitteeEntityId("r"),
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim() || undefined,
      url: form.type === "link" ? form.url.trim() || "#" : undefined,
      addedBy: "Admin",
      allowedDutyRoleIds: normalizeAllowedDutyRoleIds(
        form.selectedDutyRoleIds,
        committee.dutyRoles,
      ),
    });
    onClose();
  };

  return (
    <CommitteeModalShell
      title="Add resource"
      onClose={onClose}
      onSave={handleSave}
      saveLabel="Add resource"
    >
      <ResourceFormFields
        value={form}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        dutyRoles={committee.dutyRoles}
      />
    </CommitteeModalShell>
  );
}
