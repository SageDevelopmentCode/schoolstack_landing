"use client";

import { useState } from "react";
import {
  COMMITTEE_RESOURCE_ROLES,
  createCommitteeEntityId,
} from "@/data/school-demos/rooted-meadows-committees";
import type { CommitteeResource, CommitteeRole } from "./types";
import CommitteeModalShell, { inputClass } from "./CommitteeModalShell";

export default function AddResourceModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (resource: CommitteeResource) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<CommitteeResource["type"]>("pdf");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<CommitteeRole[]>([
    ...COMMITTEE_RESOURCE_ROLES,
  ]);

  const toggleRole = (role: CommitteeRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSave = () => {
    if (!title.trim() || selectedRoles.length === 0) return;
    const allRolesSelected = COMMITTEE_RESOURCE_ROLES.every((role) =>
      selectedRoles.includes(role),
    );
    onSave({
      id: createCommitteeEntityId("r"),
      title: title.trim(),
      type,
      description: description.trim() || undefined,
      url: type === "link" ? url.trim() || "#" : undefined,
      addedBy: "Admin",
      allowedRoles: allRolesSelected ? undefined : selectedRoles,
    });
    onClose();
  };

  return (
    <CommitteeModalShell title="Add resource" onClose={onClose} onSave={handleSave} saveLabel="Add resource">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Resource name" />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value as CommitteeResource["type"])} className={inputClass}>
          <option value="pdf">PDF</option>
          <option value="doc">Document</option>
          <option value="link">Link</option>
          <option value="checklist">Checklist</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} placeholder="Optional description" />
      </div>
      {type === "link" && (
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">URL</label>
          <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
      )}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Who can access</label>
        <div className="mt-2 space-y-2">
          {COMMITTEE_RESOURCE_ROLES.map((role) => (
            <label
              key={role}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => toggleRole(role)}
                className="rounded border-gray-300 text-[#827096] focus:ring-[#827096]"
              />
              {role === "lead"
                ? "Lead"
                : role === "member"
                  ? "Member"
                  : "Faculty liaison"}
            </label>
          ))}
        </div>
      </div>
    </CommitteeModalShell>
  );
}
