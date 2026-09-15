"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Plus, Upload, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminTextLink from "@/components/school-admin/ui/story/AdminTextLink";
import type { Committee, CommitteeResourceType } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
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
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import CommitteeModalShell from "@/components/school-admin/committees/CommitteeModalShell";
import { committeeStoryInputStyle } from "@/components/school-admin/committees/committee-story-input-style";
import { staggerContainer, staggerItem } from "@/components/school-admin/committees/committee-motion";

function ResourceFileLink({
  organizationId,
  resource,
  supabase,
  theme,
}: {
  organizationId: string;
  resource: Committee["resources"][number];
  supabase: SupabaseClient;
  theme: ParentThemeTokens;
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
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.resources.open",
        error: "",
      }, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminTextLink theme={theme} className="mt-2" onClick={() => void handleOpen()}>
      {loading ? "Opening…" : "Open"} <ExternalLink className="w-3 h-3 inline" />
    </AdminTextLink>
  );
}

export default function CommitteeResourcesSection({
  committee,
  theme,
  supabase,
  organizationId,
  onCommitteeChange,
  readOnly = false,
}: {
  committee: Committee;
  theme: ParentThemeTokens;
  supabase: SupabaseClient;
  organizationId: string;
  onCommitteeChange: (committee: Committee) => void;
  readOnly?: boolean;
}) {
  const inputStyle = useMemo(() => committeeStoryInputStyle(theme), [theme]);
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
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.resources.add",
        error: "",
      }, err);
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
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "committees.resources.delete",
        error: "",
      }, err);
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
          <AdminButton theme={theme} variant="primary" size="compact" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add resource
          </AdminButton>
        )}
      </div>

      <motion.div
        key={committee.resources.map((resource) => resource.id).join("-")}
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
            <motion.div key={resource.id} variants={staggerItem(reducedMotion)}>
              <AdminCard theme={theme} padding="default">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                      {resource.title}
                    </p>
                    <p className="text-[10px] uppercase font-semibold mt-1" style={{ color: theme.muted }}>
                      {resource.type}
                    </p>
                    {resource.fileName && (
                      <p className="text-xs mt-1 truncate" style={{ color: theme.muted }}>
                        {resource.fileName}
                      </p>
                    )}
                    {resource.description && (
                      <p className="text-xs mt-1" style={{ color: theme.muted }}>
                        {resource.description}
                      </p>
                    )}
                    {accessLabel && (
                      <p className="text-[10px] mt-2 font-medium" style={{ color: theme.primary }}>
                        {accessLabel}
                      </p>
                    )}
                  </div>
                  {!readOnly && (
                    <AdminButton
                      theme={theme}
                      variant="danger"
                      size="compact"
                      onClick={() => void handleDelete(resource.id)}
                    >
                      Delete
                    </AdminButton>
                  )}
                </div>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs mt-2"
                    style={{ color: theme.primary }}
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {resource.storagePath && (
                  <ResourceFileLink
                    organizationId={organizationId}
                    resource={resource}
                    supabase={supabase}
                    theme={theme}
                  />
                )}
              </AdminCard>
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {showAdd && (
          <CommitteeModalShell
            theme={theme}
            title="Add resource"
            onClose={() => {
              resetForm();
              setShowAdd(false);
            }}
            footer={
              <div className="flex justify-end gap-2">
                <AdminButton
                  theme={theme}
                  variant="soft"
                  onClick={() => {
                    resetForm();
                    setShowAdd(false);
                  }}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  theme={theme}
                  variant="primary"
                  onClick={() => void handleAdd()}
                  disabled={saving || !canSave}
                >
                  {saving ? "Adding…" : "Add resource"}
                </AdminButton>
              </div>
            }
          >
            <div className="space-y-3">
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={inputStyle}
              />
              <select
                value={resourceType}
                onChange={(e) => handleTypeChange(e.target.value as CommitteeResourceType)}
                className="w-full px-3 py-2 text-sm rounded-lg border"
                style={inputStyle}
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
                  style={inputStyle}
                />
              )}

              {needsFile && (
                <div
                  className="rounded-lg border border-dashed p-4"
                  style={{ borderColor: "#DCE4DC" }}
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
                      <p className="text-sm truncate" style={{ color: theme.ink }}>
                        {selectedFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleFileSelect(null)}
                        className="p-1 rounded cursor-pointer"
                        style={{ color: theme.muted }}
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
                      <Upload className="w-5 h-5" style={{ color: theme.primary }} />
                      <span className="text-sm font-medium" style={{ color: theme.primary }}>
                        Choose file
                      </span>
                      <span className="text-xs" style={{ color: theme.muted }}>
                        {resourceType === "pdf" ? "PDF up to 10 MB" : "Word document up to 10 MB"}
                      </span>
                    </label>
                  )}
                  {fileError && (
                    <p className="text-xs mt-2" style={{ color: theme.alert }}>
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
                style={inputStyle}
              />
            </div>
          </CommitteeModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}
