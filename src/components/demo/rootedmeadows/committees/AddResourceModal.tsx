"use client";

import { useState } from "react";
import { createCommitteeEntityId } from "@/data/school-demos/rooted-meadows-committees";
import type { CommitteeResource } from "./types";
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

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: createCommitteeEntityId("r"),
      title: title.trim(),
      type,
      description: description.trim() || undefined,
      url: type === "link" ? url.trim() || "#" : undefined,
      addedBy: "Admin",
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
    </CommitteeModalShell>
  );
}
