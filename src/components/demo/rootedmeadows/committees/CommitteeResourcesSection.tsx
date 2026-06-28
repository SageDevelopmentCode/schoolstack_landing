"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ExternalLink, FileText, Link2, ListChecks, Plus } from "lucide-react";
import {
  canAccessCommitteeResource,
  formatResourceAccessLabel,
} from "@/data/school-demos/rooted-meadows-committees";
import type { Committee, CommitteeResource } from "./types";
import AddResourceModal from "./AddResourceModal";
import ResourceDetailModal from "./ResourceDetailModal";

function ResourceIcon({ type }: { type: CommitteeResource["type"] }) {
  switch (type) {
    case "link":
      return <Link2 className="w-5 h-5 text-[#827096]" />;
    case "checklist":
      return <ListChecks className="w-5 h-5 text-[#b3b462]" />;
    default:
      return <FileText className="w-5 h-5 text-[#827096]" />;
  }
}

export default function CommitteeResourcesSection({
  committee,
  isAdminView = false,
  onCommitteeUpdate,
  currentUserId,
}: {
  committee: Committee;
  isAdminView?: boolean;
  onCommitteeUpdate?: (updated: Committee) => void;
  currentUserId?: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const canManage = Boolean(isAdminView && committee.status === "active" && onCommitteeUpdate);

  const visibleResources = useMemo(
    () =>
      committee.resources.filter((resource) =>
        canAccessCommitteeResource(resource, currentUserId, committee, isAdminView),
      ),
    [committee, currentUserId, isAdminView],
  );

  const selectedResource =
    selectedResourceId != null
      ? committee.resources.find((r) => r.id === selectedResourceId) ?? null
      : null;

  const handleAdd = (resource: CommitteeResource) => {
    onCommitteeUpdate?.({ ...committee, resources: [...committee.resources, resource] });
  };

  const handleUpdate = (updated: CommitteeResource) => {
    onCommitteeUpdate?.({
      ...committee,
      resources: committee.resources.map((r) =>
        r.id === updated.id ? updated : r,
      ),
    });
  };

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#827096] hover:bg-[#5A4D68] rounded-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add resource
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleResources.map((r) => {
          const accessLabel = formatResourceAccessLabel(
            r.allowedDutyRoleIds,
            committee.dutyRoles,
          );
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedResourceId(r.id)}
              className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-[#827096]/20 transition-colors cursor-pointer text-left w-full"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                <ResourceIcon type={r.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{r.title}</p>
                {r.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {r.type}
                  </span>
                  {isAdminView && accessLabel && (
                    <span className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#827096]/10 text-[#827096]">
                      {accessLabel}
                    </span>
                  )}
                </div>
              </div>
              {r.type === "link" && (
                <ExternalLink className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
              )}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {showAdd && (
          <AddResourceModal
            committee={committee}
            onClose={() => setShowAdd(false)}
            onSave={handleAdd}
          />
        )}
      </AnimatePresence>
      <ResourceDetailModal
        resource={selectedResource}
        committee={committee}
        isAdminView={isAdminView}
        canManage={canManage}
        onClose={() => setSelectedResourceId(null)}
        onSave={canManage ? handleUpdate : undefined}
      />
    </div>
  );
}
