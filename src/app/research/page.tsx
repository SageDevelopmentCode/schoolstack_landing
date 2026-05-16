"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

type CrmStatus =
  | "not_contacted"
  | "contacted"
  | "demo_scheduled"
  | "proposal_sent"
  | "not_interested"
  | "won";

type School = {
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
  crm_status: CrmStatus;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  notes: string;
  last_contacted_at: string | null;
  updated_at: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const CRM: Record<CrmStatus, { label: string; dot: string; pill: string }> = {
  not_contacted:  { label: "Not Contacted",  dot: "bg-gray-300",    pill: "bg-gray-100 text-gray-500 border-gray-200" },
  contacted:      { label: "Contacted",      dot: "bg-blue-400",    pill: "bg-blue-50 text-blue-700 border-blue-200" },
  demo_scheduled: { label: "Demo Scheduled", dot: "bg-violet-400",  pill: "bg-violet-50 text-violet-700 border-violet-200" },
  proposal_sent:  { label: "Proposal Sent",  dot: "bg-amber-400",   pill: "bg-amber-50 text-amber-700 border-amber-200" },
  not_interested: { label: "Not Interested", dot: "bg-red-400",     pill: "bg-red-50 text-red-600 border-red-200" },
  won:            { label: "Won 🎉",         dot: "bg-emerald-400", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const CRM_STATUSES = Object.keys(CRM) as CrmStatus[];

const P_PILL: Record<number, string> = {
  5: "bg-emerald-100 text-emerald-700",
  4: "bg-blue-100 text-blue-700",
  3: "bg-amber-100 text-amber-700",
  2: "bg-gray-100 text-gray-500",
  1: "bg-red-50 text-red-400",
};

const P_LABEL: Record<number, string> = {
  5: "Hot Lead", 4: "Strong Fit", 3: "Moderate", 2: "Low", 1: "Closing",
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function hostname(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Left Panel — School Row ───────────────────────────────────────────────────

function SchoolRow({ school, selected, onClick }: { school: School; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-all relative ${
        selected
          ? "bg-[#FDF5F2]"
          : "hover:bg-gray-50"
      }`}
    >
      {/* Selected accent bar */}
      <span
        className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all ${
          selected ? "bg-clay" : "bg-transparent"
        }`}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug truncate ${selected ? "text-clay" : "text-gray-800"}`}>
            {school.name}
          </p>
          <p className="text-[11px] text-gray-400 truncate mt-0.5">{school.location}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          <span className={`w-2 h-2 rounded-full ${CRM[school.crm_status].dot}`} />
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${P_PILL[school.priority_score]}`}>
            P{school.priority_score}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CRM[school.crm_status].pill}`}>
          {CRM[school.crm_status].label}
        </span>
        <span className="text-[10px] text-gray-400">{school.state}</span>
        {school.is_closing && (
          <span className="text-[10px] font-medium text-red-400">· Closing</span>
        )}
        {school.contact_name && (
          <span className="text-[10px] text-gray-400 truncate">· {school.contact_name}</span>
        )}
      </div>
    </button>
  );
}

// ── Right Panel — Field Inputs ────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-clay/40 focus:ring-2 focus:ring-clay/10 transition-all bg-white"
      />
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-gray-700 leading-relaxed">{value || "—"}</span>
    </div>
  );
}

function BulletSection({
  title, items, accent,
}: {
  title: string; items: string[]; accent: "emerald" | "amber" | "blue";
}) {
  const styles = {
    emerald: { wrap: "border-emerald-100 bg-emerald-50/60", label: "text-emerald-700", dot: "bg-emerald-400" },
    amber:   { wrap: "border-amber-100 bg-amber-50/60",     label: "text-amber-700",   dot: "bg-amber-400" },
    blue:    { wrap: "border-blue-100 bg-blue-50/60",       label: "text-blue-700",    dot: "bg-blue-400" },
  }[accent];

  return (
    <div className={`rounded-xl border p-5 ${styles.wrap}`}>
      <p className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${styles.label}`}>{title}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
            <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Right Panel — School Detail ───────────────────────────────────────────────

function SchoolDetail({
  school,
  onSave,
}: {
  school: School;
  onSave: (id: string, updates: Partial<School>) => Promise<void>;
}) {
  const [tab, setTab] = useState<"crm" | "research">("crm");
  const [status, setStatus] = useState<CrmStatus>(school.crm_status);
  const [contactName, setContactName] = useState(school.contact_name);
  const [contactEmail, setContactEmail] = useState(school.contact_email);
  const [contactPhone, setContactPhone] = useState(school.contact_phone);
  const [notes, setNotes] = useState(school.notes);
  const [lastContacted, setLastContacted] = useState(
    school.last_contacted_at ? school.last_contacted_at.split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Reset form when switching schools
  useEffect(() => {
    setTab("crm");
    setStatus(school.crm_status);
    setContactName(school.contact_name);
    setContactEmail(school.contact_email);
    setContactPhone(school.contact_phone);
    setNotes(school.notes);
    setLastContacted(school.last_contacted_at ? school.last_contacted_at.split("T")[0] : "");
    setSavedMsg(false);
  }, [school.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    setSaving(true);
    await onSave(school.id, {
      crm_status: status,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      notes,
      last_contacted_at: lastContacted ? new Date(lastContacted).toISOString() : null,
    });
    setSaving(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* School header */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-8 py-5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${P_PILL[school.priority_score]}`}>
                P{school.priority_score} · {P_LABEL[school.priority_score]}
              </span>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {school.state}
              </span>
              {school.is_closing && (
                <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  Closing
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${CRM[status].pill}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${CRM[status].dot}`} />
                {CRM[status].label}
              </span>
            </div>
            <h2 className="text-[22px] font-semibold text-gray-900 leading-tight">{school.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{school.location}</p>
          </div>
          <a
            href={school.website}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-clay hover:underline mt-1"
          >
            {hostname(school.website)}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 10L10 2M10 2H5M10 2v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-8 flex items-center">
        {(["crm", "research"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-3.5 mr-7 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === t
                ? "border-clay text-clay"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {t === "crm" ? "CRM & Pipeline" : "Research Data"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-gray-50/40">
        {tab === "crm" ? (
          <div className="px-8 py-7 max-w-2xl flex flex-col gap-7">
            {/* Status picker */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Pipeline Status</p>
              <div className="flex flex-wrap gap-2">
                {CRM_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`inline-flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-xl border transition-all ${
                      status === s
                        ? `${CRM[s].pill} shadow-sm ring-1 ring-inset ring-current/10`
                        : "border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${CRM[s].dot}`} />
                    {CRM[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Last contacted */}
            {school.last_contacted_at && (
              <p className="text-xs text-gray-400 -mt-4">
                Last saved contact: <span className="text-gray-600 font-medium">{fmtDate(school.last_contacted_at)}</span>
              </p>
            )}

            {/* Contact info */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Info</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name" value={contactName} onChange={setContactName} placeholder="Sarah Johnson" />
                <Field label="Email" value={contactEmail} onChange={setContactEmail} placeholder="sarah@school.org" type="email" />
                <Field label="Phone" value={contactPhone} onChange={setContactPhone} placeholder="+1 (555) 000-0000" type="tel" />
                <Field label="Last Contacted" value={lastContacted} onChange={setLastContacted} type="date" />
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={7}
                placeholder="Add call notes, follow-up items, context about this prospect…"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-clay/40 focus:ring-2 focus:ring-clay/10 resize-none transition-all bg-white"
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`h-11 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                savedMsg
                  ? "bg-emerald-600 text-white"
                  : "bg-clay text-white hover:opacity-90 disabled:opacity-50"
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                    <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Saving…
                </>
              ) : savedMsg ? (
                <>✓ Saved</>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        ) : (
          /* Research tab */
          <div className="px-8 py-7 max-w-2xl flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 p-5 bg-white rounded-xl border border-gray-200">
              <div className="col-span-2">
                <InfoBlock label="School Model" value={school.school_model} />
              </div>
              <InfoBlock label="Grades / Ages" value={school.grades} />
              <InfoBlock label="Estimated Size" value={school.estimated_size} />
              <div className="col-span-2">
                <InfoBlock label="Tuition / Schedule" value={school.tuition_schedule} />
              </div>
              <InfoBlock label="Confidence" value={school.confidence} />
              <InfoBlock label="Source" value={school.source_file === "texas" ? "TX Microschool Research" : "Expanded Prospects"} />
            </div>

            <BulletSection title="What They Do Well" items={school.strengths} accent="emerald" />
            <BulletSection title="Possible Gaps / Pain Points" items={school.pain_points} accent="amber" />
            <BulletSection title="Why SchoolStack Fits" items={[school.software_fit_reason]} accent="blue" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 bg-gray-50/40">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="#9CA3AF" strokeWidth="1.5" />
          <path d="M3 9h18M9 21V9" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-base font-semibold text-gray-400">Select a school</p>
      <p className="text-sm text-gray-300 mt-1">Choose from the list on the left to view and edit details.</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ResearchPage() {
  const supabase = createClient();

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CrmStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<number | 0>(0);
  const [stateFilter, setStateFilter] = useState<"" | "TX" | "CA">("");
  const [showClosing, setShowClosing] = useState(false);

  // Load schools
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("priority_score", { ascending: false });
      if (error) setError(error.message);
      else { setSchools(data as School[]); if (data?.length) setSelectedId(data[0].id); }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save handler
  const handleSave = useCallback(async (schoolId: string, updates: Partial<School>) => {
    const { error } = await supabase.from("schools").update(updates).eq("id", schoolId);
    if (error) { alert("Save failed: " + error.message); return; }
    setSchools((prev) => prev.map((s) => s.id === schoolId ? { ...s, ...updates } : s));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return schools.filter((s) => {
      if (!showClosing && s.is_closing) return false;
      if (statusFilter && s.crm_status !== statusFilter) return false;
      if (priorityFilter && s.priority_score !== priorityFilter) return false;
      if (stateFilter && s.state !== stateFilter) return false;
      if (q && !(
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.contact_name.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [schools, search, statusFilter, priorityFilter, stateFilter, showClosing]);

  const selectedSchool = useMemo(
    () => schools.find((s) => s.id === selectedId) ?? null,
    [schools, selectedId]
  );

  // Pipeline counts
  const pipelineCounts = useMemo(() => {
    const c = {} as Record<CrmStatus, number>;
    CRM_STATUSES.forEach((s) => (c[s] = 0));
    schools.forEach((s) => { c[s.crm_status] = (c[s.crm_status] ?? 0) + 1; });
    return c;
  }, [schools]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="h-12 shrink-0 border-b border-gray-200 bg-white flex items-center px-5 gap-4 z-20">
        <a href="/" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10 7H2M2 7L6 3M2 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-medium">Back</span>
        </a>
        <span className="text-gray-200">|</span>
        <span className="text-sm font-semibold text-gray-800">School Prospect CRM</span>

        {/* Pipeline summary pills */}
        {!loading && (
          <div className="flex items-center gap-2 ml-2">
            {CRM_STATUSES.filter((s) => pipelineCounts[s] > 0).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                  statusFilter === s ? CRM[s].pill + " shadow-sm" : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${CRM[s].dot}`} />
                {pipelineCounts[s]}
              </button>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          {!loading && (
            <span className="text-xs text-gray-400">{schools.length} schools</span>
          )}
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
            Internal
          </span>
        </div>
      </header>

      {/* ── Main layout ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-72 xl:w-80 shrink-0 border-r border-gray-200 flex flex-col overflow-hidden bg-white">

          {/* Search + filters */}
          <div className="shrink-0 p-3 border-b border-gray-100 flex flex-col gap-2">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search schools, contacts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-gray-200 text-xs text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-clay/40 focus:ring-1 focus:ring-clay/10 bg-white transition-all"
              />
            </div>

            {/* Filter row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Priority */}
              {[5, 4, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(priorityFilter === p ? 0 : p)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all ${
                    priorityFilter === p ? P_PILL[p] : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  P{p}
                </button>
              ))}
              {/* State */}
              {(["TX", "CA"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStateFilter(stateFilter === st ? "" : st)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all ${
                    stateFilter === st
                      ? st === "TX" ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {st}
                </button>
              ))}
              {/* Closing */}
              <button
                onClick={() => setShowClosing(!showClosing)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all ${
                  showClosing ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
              >
                Closing
              </button>
              {(search || statusFilter || priorityFilter || stateFilter) && (
                <button
                  onClick={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(0); setStateFilter(""); }}
                  className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors ml-auto"
                >
                  Clear
                </button>
              )}
            </div>

            <p className="text-[10px] text-gray-300">{filtered.length} of {schools.length} schools</p>
          </div>

          {/* Status filter tabs */}
          <div className="shrink-0 flex overflow-x-auto border-b border-gray-100 px-3 gap-0 scrollbar-hide">
            <button
              onClick={() => setStatusFilter("")}
              className={`shrink-0 text-[11px] font-medium py-2 mr-4 border-b-2 transition-all ${
                statusFilter === "" ? "border-clay text-clay" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              All
            </button>
            {CRM_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`shrink-0 text-[11px] font-medium py-2 mr-4 border-b-2 transition-all flex items-center gap-1 ${
                  statusFilter === s ? "border-clay text-clay" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${CRM[s].dot}`} />
                {CRM[s].label.replace(" 🎉", "")}
              </button>
            ))}
          </div>

          {/* School list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <svg className="animate-spin text-gray-300 w-5 h-5" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                  <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            ) : error ? (
              <div className="p-4 text-xs text-red-500">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">No schools match your filters.</div>
            ) : (
              filtered.map((school) => (
                <SchoolRow
                  key={school.id}
                  school={school}
                  selected={school.id === selectedId}
                  onClick={() => setSelectedId(school.id)}
                />
              ))
            )}
          </div>
        </aside>

        {/* ── Right panel ──────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {selectedSchool ? (
            <SchoolDetail school={selectedSchool} onSave={handleSave} />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}
