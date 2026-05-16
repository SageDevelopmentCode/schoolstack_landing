"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CrmStatus =
  | "not_contacted"
  | "contacted"
  | "demo_scheduled"
  | "proposal_sent"
  | "not_interested"
  | "won";

export type School = {
  id: string;
  school_id: string;
  name: string;
  state: string;
  location: string;
  website: string;
  school_model: string;
  grades: string;
  estimated_size: string;
  tuition_schedule: string;
  strengths: string[];
  pain_points: string[];
  software_fit_reason: string;
  priority_score: number;
  confidence: string;
  is_closing: boolean;
  source_file: string;
  // CRM
  crm_status: CrmStatus;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
  last_contacted_at: string | null;
  updated_at: string;
};

// ── Constants ──────────────────────────────────────────────────────────────────

const CRM_STATUS_CONFIG: Record<
  CrmStatus,
  { label: string; color: string; dot: string }
> = {
  not_contacted:  { label: "Not Contacted",  color: "bg-gray-100 text-gray-500 border-gray-200",         dot: "bg-gray-400" },
  contacted:      { label: "Contacted",      color: "bg-blue-100 text-blue-700 border-blue-200",          dot: "bg-blue-500" },
  demo_scheduled: { label: "Demo Scheduled", color: "bg-violet-100 text-violet-700 border-violet-200",    dot: "bg-violet-500" },
  proposal_sent:  { label: "Proposal Sent",  color: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
  not_interested: { label: "Not Interested", color: "bg-red-50 text-red-500 border-red-100",              dot: "bg-red-400" },
  won:            { label: "Won 🎉",         color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

const PRIORITY_LABELS: Record<number, string> = {
  5: "Hot Lead", 4: "Strong Fit", 3: "Moderate", 2: "Low", 1: "Closing",
};

const PRIORITY_COLORS: Record<number, string> = {
  5: "bg-emerald-100 text-emerald-700 border-emerald-200",
  4: "bg-blue-100 text-blue-700 border-blue-200",
  3: "bg-amber-100 text-amber-700 border-amber-200",
  2: "bg-gray-100 text-gray-500 border-gray-200",
  1: "bg-red-50 text-red-500 border-red-100",
};

const STATE_COLORS: Record<string, string> = {
  TX: "bg-[#F0F8FF] text-[#1a6fa0] border-[#b8dcf0]",
  CA: "bg-[#F5F0FF] text-[#6d35c9] border-[#d4c0f5]",
  MD: "bg-[#FFF5F0] text-[#c05a2a] border-[#f5c8aa]",
};

function getStateColor(state: string) {
  return STATE_COLORS[state] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

function extractHostname(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Pipeline stats ────────────────────────────────────────────────────────────

function PipelineBar({ schools }: { schools: School[] }) {
  const counts = useMemo(() => {
    const c: Record<CrmStatus, number> = {
      not_contacted: 0, contacted: 0, demo_scheduled: 0,
      proposal_sent: 0, not_interested: 0, won: 0,
    };
    schools.forEach((s) => { c[s.crm_status] = (c[s.crm_status] ?? 0) + 1; });
    return c;
  }, [schools]);

  const statuses: CrmStatus[] = ["not_contacted","contacted","demo_scheduled","proposal_sent","not_interested","won"];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
      {statuses.map((st) => {
        const cfg = CRM_STATUS_CONFIG[st];
        return (
          <div key={st} className="bg-surface rounded-xl border border-border px-3 py-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
              <span className="text-[20px] font-semibold text-text font-secondary">{counts[st]}</span>
            </div>
            <span className="text-[10px] text-text-faint font-secondary leading-tight">{cfg.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── School Card ───────────────────────────────────────────────────────────────

function SchoolCard({ school, onClick }: { school: School; onClick: () => void }) {
  const crmCfg = CRM_STATUS_CONFIG[school.crm_status];

  return (
    <div
      className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-border-strong transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      {/* Badges row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center text-[10px] font-semibold font-secondary px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[school.priority_score]}`}>
            P{school.priority_score} · {PRIORITY_LABELS[school.priority_score]}
          </span>
          <span className={`inline-flex items-center text-[10px] font-semibold font-secondary px-2 py-0.5 rounded-full border ${getStateColor(school.state)}`}>
            {school.state}
          </span>
          {school.is_closing && (
            <span className="inline-flex items-center text-[10px] font-semibold font-secondary px-2 py-0.5 rounded-full border bg-red-50 text-red-500 border-red-100">
              Closing
            </span>
          )}
        </div>
        <a
          href={school.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-text-faint hover:text-clay transition-colors shrink-0 mt-0.5"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 11L11 3M11 3H6M11 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* Name */}
      <div>
        <h3 className="font-display text-[15px] font-medium text-text leading-snug">{school.name}</h3>
        <p className="text-xs text-text-muted font-secondary mt-0.5">{school.location}</p>
      </div>

      {/* Model */}
      <p className="text-xs text-text-muted font-secondary leading-relaxed line-clamp-2">{school.school_model}</p>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {school.grades && (
          <span className="text-[11px] text-text-faint font-secondary">{school.grades}</span>
        )}
        {school.estimated_size && (
          <span className="text-[11px] text-text-faint font-secondary">· {school.estimated_size}</span>
        )}
      </div>

      {/* CRM status pill */}
      <div className="border-t border-border pt-3 flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold font-secondary px-2.5 py-1 rounded-full border ${crmCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${crmCfg.dot}`} />
          {crmCfg.label}
        </span>
        {school.contact_name && (
          <span className="text-[10px] text-text-faint font-secondary truncate">{school.contact_name}</span>
        )}
      </div>
      {school.last_contacted_at && (
        <p className="text-[10px] text-text-faint font-secondary -mt-2">
          Last contact: {formatDate(school.last_contacted_at)}
        </p>
      )}
      {school.notes && (
        <p className="text-xs text-text-muted font-secondary leading-relaxed line-clamp-2 bg-surface-soft rounded-lg px-3 py-2">
          {school.notes}
        </p>
      )}
    </div>
  );
}

// ── CRM Modal ─────────────────────────────────────────────────────────────────

function CrmModal({
  school,
  onClose,
  onSave,
}: {
  school: School;
  onClose: () => void;
  onSave: (updated: Partial<School>) => Promise<void>;
}) {
  const [status, setStatus] = useState<CrmStatus>(school.crm_status);
  const [contactName, setContactName] = useState(school.contact_name);
  const [contactEmail, setContactEmail] = useState(school.contact_email);
  const [contactPhone, setContactPhone] = useState(school.contact_phone);
  const [notes, setNotes] = useState(school.notes);
  const [lastContacted, setLastContacted] = useState(
    school.last_contacted_at ? school.last_contacted_at.split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"crm" | "research">("crm");

  async function handleSave() {
    setSaving(true);
    await onSave({
      crm_status: status,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      notes,
      last_contacted_at: lastContacted ? new Date(lastContacted).toISOString() : null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-text/30 backdrop-blur-sm" />
      <div
        className="relative bg-surface w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg border border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className={`inline-flex items-center text-[10px] font-semibold font-secondary px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[school.priority_score]}`}>
                  P{school.priority_score} · {PRIORITY_LABELS[school.priority_score]}
                </span>
                <span className={`inline-flex items-center text-[10px] font-semibold font-secondary px-2 py-0.5 rounded-full border ${getStateColor(school.state)}`}>
                  {school.state}
                </span>
                {school.is_closing && (
                  <span className="inline-flex items-center text-[10px] font-semibold font-secondary px-2 py-0.5 rounded-full border bg-red-50 text-red-500 border-red-100">Closing</span>
                )}
              </div>
              <h2 className="font-display text-[18px] font-medium text-text leading-tight">{school.name}</h2>
              <p className="text-sm text-text-muted font-secondary mt-0.5">{school.location}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-faint hover:text-text hover:border-border-strong transition-colors shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-surface-soft rounded-xl p-1 w-fit">
            {(["crm", "research"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-secondary transition-all capitalize ${
                  activeTab === tab
                    ? "bg-surface text-text shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {tab === "crm" ? "CRM / Pipeline" : "Research Data"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {activeTab === "crm" ? (
            <>
              {/* Status picker */}
              <div>
                <label className="block text-[11px] font-bold font-secondary text-text-faint uppercase tracking-wider mb-2">
                  Pipeline Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(CRM_STATUS_CONFIG) as CrmStatus[]).map((s) => {
                    const cfg = CRM_STATUS_CONFIG[s];
                    return (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold font-secondary px-3 py-1.5 rounded-full border transition-all ${
                          status === s ? cfg.color + " shadow-sm ring-2 ring-offset-1 ring-current/20" : "border-border bg-surface text-text-muted hover:border-border-strong"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact info */}
              <div>
                <label className="block text-[11px] font-bold font-secondary text-text-faint uppercase tracking-wider mb-2">
                  Contact Info
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Contact Name" value={contactName} onChange={setContactName} placeholder="e.g. Sarah Johnson" />
                  <FormField label="Email" value={contactEmail} onChange={setContactEmail} placeholder="sarah@school.org" type="email" />
                  <FormField label="Phone" value={contactPhone} onChange={setContactPhone} placeholder="+1 (555) 000-0000" type="tel" />
                  <FormField label="Last Contacted" value={lastContacted} onChange={setLastContacted} type="date" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold font-secondary text-text-faint uppercase tracking-wider mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add context, call notes, follow-up items…"
                  rows={5}
                  className="w-full px-3.5 py-3 rounded-xl border border-border bg-bg text-sm font-secondary text-text placeholder:text-text-faint focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-border resize-none transition-all"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-11 rounded-xl bg-clay text-white text-sm font-semibold font-secondary hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                      <path d="M7 2a5 5 0 015 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </>
          ) : (
            /* Research tab */
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoItem label="School Model" value={school.school_model} />
                <InfoItem label="Grades / Ages" value={school.grades} />
                <InfoItem label="Estimated Size" value={school.estimated_size} />
                <InfoItem label="Tuition / Schedule" value={school.tuition_schedule} />
                <InfoItem label="Confidence" value={school.confidence} />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold font-secondary text-text-faint uppercase tracking-wide">Website</span>
                  <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-sm font-secondary text-clay hover:underline flex items-center gap-1 truncate">
                    {extractHostname(school.website)}
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 9L9 2M9 2H5M9 2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </a>
                </div>
              </div>

              <ResearchSection title="What They Do Well" color="emerald" items={school.strengths} />
              <ResearchSection title="Possible Gaps / Pain Points" color="amber" items={school.pain_points} />

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-[11px] font-bold font-secondary uppercase tracking-wider mb-2 text-blue-700">Why SchoolStack Fits</p>
                <p className="text-sm font-secondary text-text-muted leading-relaxed">{school.software_fit_reason}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold font-secondary text-text-faint uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 px-3 rounded-xl border border-border bg-bg text-sm font-secondary text-text placeholder:text-text-faint focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-border transition-all"
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold font-secondary text-text-faint uppercase tracking-wide">{label}</span>
      <span className="text-sm font-secondary text-text-muted leading-relaxed">{value || "—"}</span>
    </div>
  );
}

function ResearchSection({
  title, color, items,
}: {
  title: string; color: "emerald" | "amber"; items: string[];
}) {
  const styles = {
    emerald: { border: "border-emerald-100", bg: "bg-emerald-50/60", label: "text-emerald-700" },
    amber:   { border: "border-amber-100",   bg: "bg-amber-50/60",   label: "text-amber-700" },
  }[color];

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} p-4`}>
      <p className={`text-[11px] font-bold font-secondary uppercase tracking-wider mb-3 ${styles.label}`}>{title}</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0" />
            <span className="text-sm font-secondary text-text-muted leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ResearchPage() {
  const supabase = createClient();

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<number | null>(null);
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CrmStatus | null>(null);
  const [showClosing, setShowClosing] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Fetch schools
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("priority_score", { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        setSchools(data as School[]);
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save CRM update
  const handleSave = useCallback(
    async (schoolId: string, updates: Partial<School>) => {
      const { error } = await supabase
        .from("schools")
        .update(updates)
        .eq("id", schoolId);

      if (error) {
        alert("Failed to save: " + error.message);
        return;
      }
      setSchools((prev) =>
        prev.map((s) => (s.id === schoolId ? { ...s, ...updates } : s))
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      if (!showClosing && s.is_closing) return false;
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.school_model.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        s.contact_name.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q);
      const matchesPriority = priorityFilter === null || s.priority_score === priorityFilter;
      const matchesState = stateFilter === null || s.state === stateFilter;
      const matchesStatus = statusFilter === null || s.crm_status === statusFilter;
      return matchesSearch && matchesPriority && matchesState && matchesStatus;
    });
  }, [schools, search, priorityFilter, stateFilter, statusFilter, showClosing]);

  const clearFilters = useCallback(() => {
    setSearch(""); setPriorityFilter(null); setStateFilter(null); setStatusFilter(null);
  }, []);

  const hasFilters = search || priorityFilter !== null || stateFilter !== null || statusFilter !== null;

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <div className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text font-secondary transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10 7H2M2 7L6 3M2 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to site
          </a>
          <span className="text-[11px] font-secondary font-semibold text-text-faint bg-surface-soft border border-border px-2.5 py-1 rounded-full uppercase tracking-wide">
            Internal — CRM
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-text mb-2">
            School Prospect Pipeline
          </h1>
          <p className="text-text-muted font-secondary text-base">
            Track outreach, demos, and deal status for {schools.length} microschool prospects.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin text-clay" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="text-text-muted font-secondary text-sm">Loading schools…</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-secondary text-red-600">
            <strong>Error loading schools:</strong> {error}
            <br />
            <span className="text-xs text-red-400 mt-1 block">Make sure you ran the seed script and the Supabase table exists.</span>
          </div>
        ) : (
          <>
            {/* Pipeline bar */}
            <PipelineBar schools={schools} />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search name, location, notes, contact…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 h-10 rounded-xl border border-border bg-surface text-sm font-secondary text-text placeholder:text-text-faint focus:outline-none focus:border-border-strong focus:ring-2 focus:ring-border transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Priority */}
                {[5, 4, 3].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(priorityFilter === p ? null : p)}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold font-secondary transition-all ${
                      priorityFilter === p ? PRIORITY_COLORS[p] + " shadow-sm" : "border-border bg-surface text-text-muted hover:border-border-strong"
                    }`}
                  >
                    P{p}
                  </button>
                ))}

                {/* State */}
                {["TX", "CA"].map((state) => (
                  <button
                    key={state}
                    onClick={() => setStateFilter(stateFilter === state ? null : state)}
                    className={`h-9 px-3 rounded-xl border text-xs font-semibold font-secondary transition-all ${
                      stateFilter === state ? getStateColor(state) + " shadow-sm" : "border-border bg-surface text-text-muted hover:border-border-strong"
                    }`}
                  >
                    {state}
                  </button>
                ))}

                {/* CRM status dropdown */}
                <select
                  value={statusFilter ?? ""}
                  onChange={(e) => setStatusFilter((e.target.value as CrmStatus) || null)}
                  className="h-9 px-3 rounded-xl border border-border bg-surface text-xs font-semibold font-secondary text-text-muted hover:border-border-strong focus:outline-none focus:border-border-strong transition-all appearance-none pr-7 cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23B8A898' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
                >
                  <option value="">All Statuses</option>
                  {(Object.keys(CRM_STATUS_CONFIG) as CrmStatus[]).map((s) => (
                    <option key={s} value={s}>{CRM_STATUS_CONFIG[s].label}</option>
                  ))}
                </select>

                {/* Show closing */}
                <button
                  onClick={() => setShowClosing(!showClosing)}
                  className={`h-9 px-3 rounded-xl border text-xs font-semibold font-secondary transition-all ${
                    showClosing ? "bg-red-50 text-red-500 border-red-200 shadow-sm" : "border-border bg-surface text-text-muted hover:border-border-strong"
                  }`}
                >
                  Closing
                </button>

                {hasFilters && (
                  <button onClick={clearFilters} className="h-9 px-3 rounded-xl border border-border bg-surface text-xs font-secondary text-text-muted hover:text-text transition-colors">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Count */}
            <p className="text-xs text-text-faint font-secondary mb-4">
              Showing {filtered.length} of {schools.length} schools
            </p>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-text-muted font-secondary text-base mb-1">No schools match your filters.</p>
                <button onClick={clearFilters} className="text-sm text-clay font-semibold font-secondary hover:underline mt-2">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((school) => (
                  <SchoolCard key={school.id} school={school} onClick={() => setSelectedSchool(school)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* CRM Modal */}
      {selectedSchool && (
        <CrmModal
          school={selectedSchool}
          onClose={() => setSelectedSchool(null)}
          onSave={async (updates) => {
            await handleSave(selectedSchool.id, updates);
            setSelectedSchool(null);
          }}
        />
      )}
    </div>
  );
}
