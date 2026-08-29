"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ListFilter, Send } from "lucide-react";
import {
  MOBILE_DEMO_LEADS,
  type MobileDemoLead,
  type MobileDemoLeadFlow,
  type MobileDemoLeadStatus,
} from "../mobileDemoData";

type Props = {
  accentColor: string;
  schoolName?: string;
};

const FLOW_FILTERS: { id: "all" | MobileDemoLeadFlow; label: string }[] = [
  { id: "all", label: "All" },
  { id: "school-year", label: "School Year" },
  { id: "summer", label: "Summer" },
];

const STATUS_FILTERS: { id: "all" | MobileDemoLeadStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "emailed", label: "Emailed" },
];

const STATUS_STYLES: Record<
  MobileDemoLeadStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  new: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", label: "New" },
  contacted: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", label: "Contacted" },
  emailed: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", label: "Emailed" },
};

function StatusBadge({ status }: { status: MobileDemoLeadStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {style.label}
    </span>
  );
}

function LeadCard({
  lead,
  accentColor,
  highlighted,
  onSelect,
}: {
  lead: MobileDemoLead;
  accentColor: string;
  highlighted?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-3 text-left transition-colors cursor-pointer ${
        highlighted
          ? "border-2 shadow-sm"
          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
      }`}
      style={highlighted ? { borderColor: accentColor } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800 truncate">{lead.name}</p>
            <StatusBadge status={lead.status} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {lead.childName} · {lead.childGrade}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-gray-400">{lead.date}</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        </div>
      </div>
      {lead.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {lead.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[9px] font-medium text-gray-600 bg-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {lead.message && (
        <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {lead.message}
        </p>
      )}
    </button>
  );
}

function LeadDetailSheet({
  lead,
  accentColor,
  onClose,
}: {
  lead: MobileDemoLead;
  accentColor: string;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
          aria-label="Back to submissions"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate">{lead.name}</p>
          <p className="text-[11px] text-gray-400">{lead.email}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="rounded-xl bg-gray-50 p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Child</span>
            <span className="font-medium text-gray-800">
              {lead.childName} · {lead.childGrade}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Submitted</span>
            <span className="font-medium text-gray-800">{lead.date}</span>
          </div>
        </div>

        {lead.message && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
              Message
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{lead.message}</p>
          </div>
        )}

        {lead.tags.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {lead.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 px-4 py-4 shrink-0 space-y-2">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          <Send className="h-4 w-4" />
          Send application link
        </button>
        <button
          type="button"
          className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50"
        >
          Mark as contacted
        </button>
      </div>
    </div>
  );
}

export default function AdminAdmissionsSubmissionsSlide({
  accentColor,
  schoolName,
}: Props) {
  const [flowFilter, setFlowFilter] = useState<"all" | MobileDemoLeadFlow>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MobileDemoLeadStatus>("all");
  const [selectedLead, setSelectedLead] = useState<MobileDemoLead | null>(null);

  const filtered = useMemo(() => {
    return MOBILE_DEMO_LEADS.filter((lead) => {
      const flowMatch = flowFilter === "all" || lead.flow === flowFilter;
      const statusMatch = statusFilter === "all" || lead.status === statusFilter;
      return flowMatch && statusMatch;
    });
  }, [flowFilter, statusFilter]);

  const newCount = MOBILE_DEMO_LEADS.filter((l) => l.status === "new").length;

  return (
    <div className="relative flex h-full flex-col bg-white">
      <div className="border-b border-gray-100 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-gray-800">Admissions</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Submissions{schoolName ? ` · ${schoolName}` : ""}
            </p>
          </div>
          {newCount > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: accentColor }}
            >
              {newCount} new
            </span>
          )}
        </div>
      </div>

      <div className="border-b border-gray-100 px-4 py-2.5 shrink-0 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {FLOW_FILTERS.map((f) => {
            const active = flowFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFlowFilter(f.id)}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                  active ? "text-white" : "bg-gray-100 text-gray-600"
                }`}
                style={active ? { backgroundColor: accentColor } : undefined}
              >
                {f.label}
              </button>
            );
          })}
          <button
            type="button"
            className="ml-auto shrink-0 flex items-center justify-center rounded-lg p-1.5 text-gray-400 border border-gray-200 cursor-pointer"
            aria-label="Filter submissions"
          >
            <ListFilter className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                  active
                    ? "text-white"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
                style={active ? { backgroundColor: accentColor } : undefined}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No submissions match filters</p>
        ) : (
          filtered.map((lead, i) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              accentColor={accentColor}
              highlighted={lead.status === "new" && i === 0}
              onSelect={() => setSelectedLead(lead)}
            />
          ))
        )}
      </div>

      {selectedLead && (
        <LeadDetailSheet
          lead={selectedLead}
          accentColor={accentColor}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
