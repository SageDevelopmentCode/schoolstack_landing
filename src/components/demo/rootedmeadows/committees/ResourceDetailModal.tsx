"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import {
  formatResourceAccessLabel,
  hasFullDutyRoleAccess,
  simplifyDutyRoleTitle,
} from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeResource } from "./types";
import ResourceFormFields, {
  dutyRolesToFormSelection,
  normalizeAllowedDutyRoleIds,
  type ResourceFormValue,
} from "./ResourceFormFields";

function resourceToForm(
  resource: CommitteeResource,
  committee: Committee,
): ResourceFormValue {
  return {
    title: resource.title,
    type: resource.type,
    description: resource.description ?? "",
    url: resource.url ?? "",
    selectedDutyRoleIds: dutyRolesToFormSelection(
      resource.allowedDutyRoleIds,
      committee.dutyRoles,
    ),
  };
}

export default function ResourceDetailModal({
  resource,
  committee,
  isAdminView = false,
  canManage = false,
  onClose,
  onSave,
}: {
  resource: CommitteeResource | null;
  committee: Committee;
  isAdminView?: boolean;
  canManage?: boolean;
  onClose: () => void;
  onSave?: (updated: CommitteeResource) => void;
}) {
  const isEditMode = Boolean(isAdminView && canManage && onSave);
  const [form, setForm] = useState<ResourceFormValue | null>(
    resource ? resourceToForm(resource, committee) : null,
  );

  useEffect(() => {
    if (resource) setForm(resourceToForm(resource, committee));
  }, [resource, committee]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && resource) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [resource, onClose]);

  const handleSave = () => {
    if (
      !resource ||
      !form ||
      !form.title.trim() ||
      form.selectedDutyRoleIds.length === 0
    ) {
      return;
    }
    onSave?.({
      ...resource,
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim() || undefined,
      url: form.type === "link" ? form.url.trim() || "#" : undefined,
      allowedDutyRoleIds: normalizeAllowedDutyRoleIds(
        form.selectedDutyRoleIds,
        committee.dutyRoles,
      ),
    });
    onClose();
  };

  const accessLabel = resource
    ? formatResourceAccessLabel(resource.allowedDutyRoleIds, committee.dutyRoles)
    : null;
  const unrestricted = resource
    ? hasFullDutyRoleAccess(resource.allowedDutyRoleIds, committee.dutyRoles)
    : true;

  const restrictedDutyRoles =
    resource?.allowedDutyRoleIds
      ?.map((id) => committee.dutyRoles.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => r != null) ?? [];

  return (
    <AnimatePresence>
      {resource && form && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 leading-snug">
                {isEditMode ? "Edit resource" : resource.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {isEditMode ? (
                <ResourceFormFields
                  value={form}
                  onChange={(patch) =>
                    setForm((prev) => (prev ? { ...prev, ...patch } : prev))
                  }
                  dutyRoles={committee.dutyRoles}
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      {resource.type}
                    </span>
                    {resource.addedBy && (
                      <span className="text-[10px] text-gray-400">
                        Added by {resource.addedBy}
                      </span>
                    )}
                  </div>

                  {resource.description && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                        Description
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>
                  )}

                  {resource.type === "link" && resource.url && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                        Link
                      </p>
                      <p className="text-sm text-[#827096] flex items-center gap-2 break-all">
                        <ExternalLink className="w-4 h-4 shrink-0" />
                        {resource.url}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Who can access
                    </p>
                    {unrestricted ? (
                      <p className="text-sm text-gray-700">All committee members</p>
                    ) : (
                      <div className="space-y-2">
                        {accessLabel && (
                          <p className="text-sm text-gray-600">{accessLabel}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {restrictedDutyRoles.map((role) => (
                            <span
                              key={role.id}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#827096]/10 text-[#827096]"
                            >
                              {simplifyDutyRoleTitle(role.title)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              {isEditMode ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#827096] hover:bg-[#5A4D68] rounded-md cursor-pointer"
                  >
                    Save changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
