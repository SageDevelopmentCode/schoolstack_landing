"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Plus, Upload, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { Committee, CommitteeResourceType } from "@/lib/committees/types";
import { createResource, deleteResource } from "@/lib/committees/resources";
import { getCommittee } from "@/lib/committees/committees";
import { formatResourceAccessLabel } from "@/lib/committees/permissions";
import {
  acceptForResourceType,
  createCommitteeResourceSignedUrl,
  uploadCommitteeResourceFile,
  validateCommitteeResourceFile,
} from "@/lib/committees/resource-file-storage";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";
import { staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

function ResourceFileLink({
  resource,
  supabase,
  C,
}: {
  resource: Committee["resources"][number];
  supabase: SupabaseClient;
  C: AdminThemeTokens;
}) {
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    if (!resource.storagePath) return;
    setLoading(true);
    try {
      const url = await createCommitteeResourceSignedUrl(supabase, resource.storagePath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to open file."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleOpen()}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs mt-2 cursor-pointer disabled:opacity-50"
      style={{ color: C.accent }}
    >
      {loading ? "Opening…" : "Open"}
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}

export default function CommitteeResourcesSection({
  committee,
  C,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
}: {
  committee: Committee;
  C: AdminThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState<CommitteeResourceType>("link");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setResourceType("link");
    setSelectedFile(null);
    setFileError(null);
  };

  const refresh = async () => {
    const updated = await getCommittee(supabase, organizationId, committee.id);
    if (updated) onCommitteeChange(updated);
  };

  const needsFile = resourceType === "pdf" || resourceType === "doc";
  const canSave =
    title.trim().length > 0 &&
    (needsFile ? selectedFile !== null : resourceType !== "link" || url.trim().length > 0);

  const handleAdd = async () => {
    if (!title.trim()) return;
    if (needsFile && !selectedFile) {
      setFileError("Please choose a file to upload.");
      return;
    }

    setSaving(true);
    try {
      let storagePath: string | undefined;
      let fileName: string | undefined;

      if (needsFile && selectedFile) {
        const uploaded = await uploadCommitteeResourceFile(
          supabase,
          { organizationId, committeeId: committee.id },
          selectedFile,
          resourceType,
        );
        storagePath = uploaded.storagePath;
        fileName = uploaded.fileName;
      }

      await createResource(supabase, committee.id, {
        title: title.trim(),
        url: resourceType === "link" ? url.trim() || undefined : undefined,
        storagePath,
        fileName,
        description: description || undefined,
        type: resourceType,
      });
      resetForm();
      setShowAdd(false);
      await refresh();
      adminToast.success("Resource added");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to add resource."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    try {
      await deleteResource(supabase, resourceId);
      await refresh();
      adminToast.success("Resource deleted");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to delete resource."));
    }
  };

  const handleTypeChange = (next: CommitteeResourceType) => {
    setResourceType(next);
    setSelectedFile(null);
    setFileError(null);
    if (next !== "link") setUrl("");
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileError(null);
      return;
    }
    const error = validateCommitteeResourceFile(file, resourceType);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
      return;
    }
    setFileError(null);
    setSelectedFile(file);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex justify-end">
        {!readOnly && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg cursor-pointer"
            style={{ backgroundColor: C.accent }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add resource
          </button>
        )}
      </div>

      <motion.div
        key={committee.resources.map((r) => r.id).join("-")}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        variants={staggerContainer(reducedMotion)}
        initial="initial"
        animate="animate"
      >
        {committee.resources.map((resource) => {
          const accessLabel = formatResourceAccessLabel(
            resource.allowedDutyRoleIds,
            committee.dutyRoles,
          );
          return (
            <motion.div
              key={resource.id}
              variants={staggerItem(reducedMotion)}
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
                  {resource.fileName && (
                    <p className="text-xs mt-1 truncate" style={{ color: C.textSecondary }}>
                      {resource.fileName}
                    </p>
                  )}
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
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDelete(resource.id)}
                    className="text-xs cursor-pointer"
                    style={{ color: C.error }}
                  >
                    Delete
                  </button>
                )}
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
              {resource.storagePath && (
                <ResourceFileLink resource={resource} supabase={supabase} C={C} />
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
      {showAdd && (
        <CommitteeModalShell
          C={C}
          title="Add resource"
          onClose={() => {
            resetForm();
            setShowAdd(false);
          }}
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAdd(false);
                }}
                className="px-4 py-2 text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving || !canSave}
                className="px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: C.accent }}
              >
                {saving ? "Adding…" : "Add resource"}
              </button>
            </div>
          }
        >
            <div className="space-y-3">
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={{ borderColor: C.border }}
              />
              <select
                value={resourceType}
                onChange={(e) => handleTypeChange(e.target.value as CommitteeResourceType)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={{ borderColor: C.border }}
              >
                <option value="link">Link</option>
                <option value="pdf">PDF</option>
                <option value="doc">Document</option>
                <option value="checklist">Checklist</option>
              </select>

              {resourceType === "link" && (
                <input
                  placeholder="URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border"
                  style={{ borderColor: C.border }}
                />
              )}

              {needsFile && (
                <div
                  className="rounded-lg border border-dashed p-4"
                  style={{ borderColor: C.border }}
                >
                  <input
                    id="committee-resource-file"
                    type="file"
                    accept={acceptForResourceType(resourceType)}
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm truncate" style={{ color: C.textPrimary }}>
                        {selectedFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleFileSelect(null)}
                        className="p-1 rounded cursor-pointer"
                        style={{ color: C.textTertiary }}
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="committee-resource-file"
                      className="flex flex-col items-center gap-2 cursor-pointer py-2"
                    >
                      <Upload className="w-5 h-5" style={{ color: C.accent }} />
                      <span className="text-sm font-medium" style={{ color: C.accent }}>
                        Choose file
                      </span>
                      <span className="text-xs" style={{ color: C.textTertiary }}>
                        {resourceType === "pdf" ? "PDF up to 10 MB" : "Word document up to 10 MB"}
                      </span>
                    </label>
                  )}
                  {fileError && (
                    <p className="text-xs mt-2" style={{ color: C.error }}>
                      {fileError}
                    </p>
                  )}
                </div>
              )}

              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={{ borderColor: C.border }}
              />
            </div>
        </CommitteeModalShell>
      )}
      </AnimatePresence>
    </div>
  );
}
