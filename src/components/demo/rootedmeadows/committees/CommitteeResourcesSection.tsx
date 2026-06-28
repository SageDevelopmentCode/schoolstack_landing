"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ExternalLink, FileText, Link2, ListChecks, Plus } from "lucide-react";
import type { Committee, CommitteeResource } from "./types";
import AddResourceModal from "./AddResourceModal";

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
}: {
  committee: Committee;
  isAdminView?: boolean;
  onCommitteeUpdate?: (updated: Committee) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const canManage = Boolean(isAdminView && committee.status === "active" && onCommitteeUpdate);

  const handleAdd = (resource: CommitteeResource) => {
    onCommitteeUpdate?.({ ...committee, resources: [...committee.resources, resource] });
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
        {committee.resources.map((r) => (
          <div
            key={r.id}
            className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-[#827096]/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <ResourceIcon type={r.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{r.title}</p>
              {r.description && (
                <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>
              )}
              <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {r.type}
              </span>
            </div>
            {r.type === "link" && (
              <ExternalLink className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
            )}
          </div>
        ))}
      </div>
      <AnimatePresence>
        {showAdd && (
          <AddResourceModal onClose={() => setShowAdd(false)} onSave={handleAdd} />
        )}
      </AnimatePresence>
    </div>
  );
}
