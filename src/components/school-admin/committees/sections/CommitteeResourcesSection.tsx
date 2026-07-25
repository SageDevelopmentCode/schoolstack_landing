"use client";

import { useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee, CommitteeResourceType } from "@/lib/committees/types";
import { createResource, deleteResource } from "@/lib/committees/resources";
import { getCommittee } from "@/lib/committees/committees";
import { formatResourceAccessLabel } from "@/lib/committees/permissions";

export default function CommitteeResourcesSection({
  committee,
  C,
  supabase,
  organizationId,
  onCommitteeChange,
}: {
  committee: Committee;
  C: AdminThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState<CommitteeResourceType>("link");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createResource(supabase, committee.id, {
        title: title.trim(),
        url: url || undefined,
        description: description || undefined,
        type: resourceType,
      });
      setTitle("");
      setUrl("");
      setDescription("");
      setShowAdd(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    await deleteResource(supabase, resourceId);
    await refresh();
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg cursor-pointer"
          style={{ backgroundColor: C.accent }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add resource
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {committee.resources.map((resource) => {
          const accessLabel = formatResourceAccessLabel(
            resource.allowedDutyRoleIds,
            committee.dutyRoles,
          );
          return (
            <div
              key={resource.id}
              className="p-4 rounded-xl border"
              style={{ backgroundColor: C.surface, borderColor: C.border }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                    {resource.title}
                  </p>
                  <p className="text-[10px] uppercase font-semibold mt-1" style={{ color: C.textTertiary }}>
                    {resource.type}
                  </p>
                  {resource.description && (
                    <p className="text-xs mt-1" style={{ color: C.textSecondary }}>
                      {resource.description}
                    </p>
                  )}
                  {accessLabel && (
                    <p className="text-[10px] mt-2 font-medium" style={{ color: C.accent }}>
                      {accessLabel}
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => handleDelete(resource.id)} className="text-xs cursor-pointer" style={{ color: C.error }}>
                  Delete
                </button>
              </div>
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs mt-2"
                  style={{ color: C.accent }}
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="rounded-2xl shadow-xl w-full max-w-md p-6" style={{ backgroundColor: C.surface }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: C.textPrimary }}>Add resource</h3>
            <div className="space-y-3">
              <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border" style={{ borderColor: C.border }} />
              <select value={resourceType} onChange={(e) => setResourceType(e.target.value as CommitteeResourceType)} className="w-full px-3 py-2 text-sm rounded-lg border" style={{ borderColor: C.border }}>
                <option value="link">Link</option>
                <option value="pdf">PDF</option>
                <option value="doc">Document</option>
                <option value="checklist">Checklist</option>
              </select>
              <input placeholder="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border" style={{ borderColor: C.border }} />
              <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-lg border" style={{ borderColor: C.border }} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm cursor-pointer">Cancel</button>
              <button type="button" onClick={handleAdd} disabled={saving || !title.trim()} className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:opacity-50" style={{ backgroundColor: C.accent }}>
                {saving ? "Adding…" : "Add resource"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
