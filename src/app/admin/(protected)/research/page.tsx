"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { listSchoolDemoOptions } from "@/data/school-demos";
import { SITE_NAME } from "@/lib/site";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";

// ── Types ─────────────────────────────────────────────────────────────────────

type CrmStatus =
  | "nurturing"
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
  demo_slug: string | null;
  updated_at: string;
};

const SCHOOL_DEMO_OPTIONS = listSchoolDemoOptions();

// ── Constants ─────────────────────────────────────────────────────────────────

const CRM: Record<CrmStatus, { label: string; dot: string; pill: string }> = {
  nurturing:      { label: "Nurturing ❤️",   dot: "bg-rose-400",    pill: "bg-rose-50 text-rose-700 border-rose-200" },
  not_contacted:  { label: "Not Contacted",  dot: "bg-admin-faint",    pill: "bg-admin-neutral-bg text-admin-muted border-admin-border" },
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
  2: "bg-admin-neutral-bg text-admin-muted",
  1: "bg-red-50 text-red-400",
};

const P_LABEL: Record<number, string> = {
  5: "Hot Lead", 4: "Strong Fit", 3: "Moderate", 2: "Low", 1: "Closing",
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function hostname(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function sourceLabel(sourceFile: string): { label: string; cardClass: string; labelClass: string; valueClass: string } {
  if (sourceFile === "texas") {
    return {
      label: "TX Research",
      cardClass: "bg-sky-50 border-sky-200",
      labelClass: "text-sky-500",
      valueClass: "text-sky-700",
    };
  }
  if (sourceFile === "manual") {
    return {
      label: "Manual",
      cardClass: "bg-orange-50 border-orange-200",
      labelClass: "text-orange-500",
      valueClass: "text-orange-700",
    };
  }
  return {
    label: "Expanded",
    cardClass: "bg-violet-50 border-violet-200",
    labelClass: "text-violet-500",
    valueClass: "text-violet-700",
  };
}

// ── Left Panel — School Row ───────────────────────────────────────────────────

function DemoMonitorIcon({ title = "Product demo" }: { title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-admin-md bg-admin-accent-soft text-admin-accent shrink-0"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1.5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4.5 10.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M6 8.5v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function SchoolRow({ school, selected, onClick }: { school: School; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-admin-border transition-all relative ${
        selected
          ? "bg-[#FDF5F2]"
          : "hover:bg-admin-bg"
      }`}
    >
      {/* Selected accent bar */}
      <span
        className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all ${
          selected ? "bg-admin-accent" : "bg-transparent"
        }`}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug truncate ${selected ? "text-admin-accent" : "text-admin-text"}`}>
            {school.name}
          </p>
          <p className="text-[11px] text-admin-faint truncate mt-0.5">{school.location}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          <span className={`w-2 h-2 rounded-admin-md ${CRM[school.crm_status].dot}`} />
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-admin-md ${P_PILL[school.priority_score]}`}>
            P{school.priority_score}
          </span>
          {school.demo_slug && <DemoMonitorIcon />}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-admin-md border ${CRM[school.crm_status].pill}`}>
          {CRM[school.crm_status].label}
        </span>
        <span className="text-[10px] text-admin-faint">{school.state}</span>
        {school.is_closing && (
          <span className="text-[10px] font-medium text-red-400">· Closing</span>
        )}
        {school.contact_name && (
          <span className="text-[10px] text-admin-faint truncate">· {school.contact_name}</span>
        )}
      </div>
    </button>
  );
}

// ── Right Panel — Field Inputs ────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, type = "text", required,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-admin-faint uppercase tracking-wider">
        {label}{required && <span className="text-admin-accent ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-9 px-3 rounded-admin-md border border-admin-border text-sm text-admin-text placeholder:text-admin-faint focus:outline-none focus:border-admin-accent/40 focus:ring-2 focus:ring-admin-accent/10 transition-all bg-admin-surface"
      />
    </div>
  );
}

function TextAreaField({
  label, value, onChange, placeholder, rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-admin-faint uppercase tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-admin-md border border-admin-border text-sm text-admin-text placeholder:text-admin-faint focus:outline-none focus:border-admin-accent/40 focus:ring-2 focus:ring-admin-accent/10 resize-none transition-all bg-admin-surface"
      />
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-admin-faint uppercase tracking-wider">{label}</span>
      <span className="text-sm text-admin-text leading-relaxed">{value || "—"}</span>
    </div>
  );
}


// ── Middle Panel — CRM Form ───────────────────────────────────────────────────

function CrmPanel({
  school,
  onSave,
}: {
  school: School;
  onSave: (id: string, updates: Partial<School>) => Promise<void>;
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
  const [savedMsg, setSavedMsg] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [priority, setPriority] = useState(school.priority_score);
  const [prioritySaving, setPrioritySaving] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const priorityRef = useRef<HTMLDivElement>(null);
  const [demoSlug, setDemoSlug] = useState(school.demo_slug ?? "");
  const [demoSlugSaving, setDemoSlugSaving] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setStatus(school.crm_status);
      setContactName(school.contact_name);
      setContactEmail(school.contact_email);
      setContactPhone(school.contact_phone);
      setNotes(school.notes);
      setLastContacted(school.last_contacted_at ? school.last_contacted_at.split("T")[0] : "");
      setPriority(school.priority_score);
      setDemoSlug(school.demo_slug ?? "");
      setPriorityOpen(false);
      setSavedMsg(false);
    });
  }, [school.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!priorityOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) {
        setPriorityOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setPriorityOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [priorityOpen]);

  async function handleStatusChange(s: CrmStatus) {
    setStatus(s);
    setStatusSaving(true);
    await onSave(school.id, { crm_status: s });
    setStatusSaving(false);
  }

  async function handlePriorityChange(score: number) {
    if (score === priority) {
      setPriorityOpen(false);
      return;
    }
    setPriority(score);
    setPrioritySaving(true);
    await onSave(school.id, { priority_score: score });
    setPrioritySaving(false);
    setPriorityOpen(false);
  }

  async function handleDemoSlugChange(value: string) {
    const nextSlug = value || null;
    if (nextSlug === (school.demo_slug ?? null)) return;
    setDemoSlug(value);
    setDemoSlugSaving(true);
    await onSave(school.id, { demo_slug: nextSlug });
    setDemoSlugSaving(false);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(school.id, {
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
      <div className="shrink-0 border-b border-admin-border bg-admin-surface px-7 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <div className="relative" ref={priorityRef}>
                <button
                  type="button"
                  onClick={() => setPriorityOpen(!priorityOpen)}
                  disabled={prioritySaving}
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-admin-md transition-all hover:opacity-80 disabled:opacity-60 ${P_PILL[priority]}`}
                >
                  P{priority} · {P_LABEL[priority]}
                  {prioritySaving ? (
                    <svg className="animate-spin w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                      <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 opacity-60">
                      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                {priorityOpen && (
                  <div className="absolute top-full left-0 mt-1 z-30 min-w-[168px] bg-admin-surface rounded-admin-md border border-admin-border shadow-lg py-1">
                    {[5, 4, 3, 2, 1].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePriorityChange(p)}
                        disabled={prioritySaving}
                        className={`w-full flex items-center gap-2 text-xs font-medium px-3 py-2 transition-colors text-left disabled:opacity-60 ${
                          priority === p ? "bg-admin-bg" : "hover:bg-admin-bg"
                        }`}
                      >
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-admin-md shrink-0 ${P_PILL[p]}`}>
                          P{p}
                        </span>
                        <span className="text-admin-text">{P_LABEL[p]}</span>
                        {priority === p && (
                          <svg className="ml-auto shrink-0" width="12" height="12" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-admin-muted bg-admin-neutral-bg px-2 py-0.5 rounded-admin-md">
                {school.state}
              </span>
              {school.is_closing && (
                <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-admin-md">
                  Closing
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-admin-md border ${CRM[status].pill}`}>
                <span className={`w-1.5 h-1.5 rounded-admin-md ${CRM[status].dot}`} />
                {CRM[status].label}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-admin-text leading-tight">{school.name}</h2>
            <p className="text-xs text-admin-faint mt-0.5">{school.location}</p>
          </div>
          <a
            href={school.website}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-admin-accent hover:underline mt-1"
          >
            {hostname(school.website)}
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2 9L9 2M9 2H5M9 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Product demo link */}
        <div className="mt-4 pt-4 border-t border-admin-border">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-bold text-admin-faint uppercase tracking-wider">Product Demo</p>
            {demoSlugSaving && (
              <svg className="animate-spin w-3 h-3 text-admin-faint" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <p className="text-xs text-admin-faint mb-2.5">
            Opens the branded product demo for this prospect.
          </p>
          <div className="flex items-center gap-2">
            <AdminSelect
              value={demoSlug}
              onChange={(e) => handleDemoSlugChange(e.target.value)}
              disabled={demoSlugSaving}
              className="flex-1 min-w-0"
              triggerClassName="h-9 px-3 text-admin-text focus:outline-none focus:border-admin-accent/40 focus:ring-2 focus:ring-admin-accent/10 bg-admin-surface disabled:opacity-60"
              aria-label="Demo slug"
            >
              <option value="">None</option>
              {SCHOOL_DEMO_OPTIONS.map((opt) => (
                <option key={opt.slug} value={opt.slug}>
                  {opt.label}
                </option>
              ))}
            </AdminSelect>
            <a
              href={demoSlug ? `/demo/${demoSlug}` : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!demoSlug}
              className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-admin-md text-xs font-semibold transition-all ${
                demoSlug
                  ? "bg-admin-accent text-white hover:opacity-90"
                  : "bg-admin-neutral-bg text-admin-faint pointer-events-none"
              }`}
            >
              Open demo
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2 9L9 2M9 2H5M9 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* CRM label */}
      <div className="shrink-0 border-b border-admin-border bg-admin-surface px-7 py-2.5">
        <p className="text-[11px] font-bold text-admin-faint uppercase tracking-wider">CRM & Pipeline</p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto bg-admin-bg/30">
        <div className="px-7 py-6 flex flex-col gap-6">
          {/* Status picker */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <p className="text-[11px] font-bold text-admin-faint uppercase tracking-wider">Status</p>
              {statusSaving && (
                <svg className="animate-spin w-3 h-3 text-admin-faint" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                  <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {CRM_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={statusSaving}
                  className={`w-full flex items-center gap-2.5 text-sm font-medium px-3.5 py-2.5 rounded-admin-md border transition-all text-left disabled:opacity-60 ${
                    status === s
                      ? `${CRM[s].pill} shadow-sm`
                      : "border-admin-border text-admin-muted bg-admin-surface hover:border-admin-border hover:bg-admin-bg"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-admin-md shrink-0 ${CRM[s].dot}`} />
                  {CRM[s].label}
                  {status === s && (
                    <svg className="ml-auto shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div>
            <p className="text-[11px] font-bold text-admin-faint uppercase tracking-wider mb-2.5">Contact Info</p>
            <div className="flex flex-col gap-2.5">
              <Field label="Name" value={contactName} onChange={setContactName} placeholder="Sarah Johnson" />
              <Field label="Email" value={contactEmail} onChange={setContactEmail} placeholder="sarah@school.org" type="email" />
              <Field label="Phone" value={contactPhone} onChange={setContactPhone} placeholder="+1 (555) 000-0000" type="tel" />
              <Field label="Last Contacted" value={lastContacted} onChange={setLastContacted} type="date" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-[11px] font-bold text-admin-faint uppercase tracking-wider mb-2.5">Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="Add call notes, follow-up items, context about this prospect…"
              className="w-full px-3.5 py-3 rounded-admin-md border border-admin-border text-sm text-admin-text placeholder:text-admin-faint focus:outline-none focus:border-admin-accent/40 focus:ring-2 focus:ring-admin-accent/10 resize-none transition-all bg-admin-surface"
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`h-10 rounded-admin-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              savedMsg
                ? "bg-emerald-500 text-white"
                : "bg-admin-accent text-white hover:opacity-90 disabled:opacity-50"
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
            ) : savedMsg ? "✓ Saved" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Right Panel — Research Data ───────────────────────────────────────────────

function ResearchPanel({ school }: { school: School }) {
  return (
    <div className="h-full flex flex-col overflow-hidden border-l border-admin-border">
      {/* Header */}
      <div className="shrink-0 border-b border-admin-border bg-admin-surface px-6 py-2.5">
        <p className="text-[11px] font-bold text-admin-faint uppercase tracking-wider">Research Data</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-admin-bg/40">
        <div className="px-5 py-5 flex flex-col gap-4">

          {/* School model card */}
          <div className="bg-admin-surface rounded-admin-md border border-admin-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-admin-sm bg-admin-neutral-bg flex items-center justify-center shrink-0">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="1" y="4" width="11" height="8" rx="1" stroke="#6B7280" strokeWidth="1.2" />
                  <path d="M4 12V8h5v4" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M1 4L6.5 1l5.5 3" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-admin-faint uppercase tracking-wider">School Model</span>
            </div>
            <p className="text-sm text-admin-text leading-relaxed">{school.school_model || "—"}</p>
          </div>

          {/* Quick-stat badges */}
          <div className="grid grid-cols-2 gap-2">
            <StatBadge icon="🎓" label="Grades" value={school.grades} />
            <StatBadge icon="👥" label="Size" value={school.estimated_size} />
          </div>

          {/* Tuition */}
          <div className="bg-admin-surface rounded-admin-md border border-admin-border p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base leading-none">💳</span>
              <span className="text-[10px] font-bold text-admin-faint uppercase tracking-wider">Tuition / Schedule</span>
            </div>
            <p className="text-sm text-admin-text leading-relaxed">{school.tuition_schedule || "—"}</p>
          </div>

          {/* Confidence + Source row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-admin-surface rounded-admin-md border border-admin-border px-3.5 py-3">
              <p className="text-[10px] font-bold text-admin-faint uppercase tracking-wider mb-1">Confidence</p>
              <p className="text-xs font-medium text-admin-text leading-snug">{school.confidence || "—"}</p>
            </div>
            <div className={`rounded-admin-md border px-3.5 py-3 ${sourceLabel(school.source_file).cardClass}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${sourceLabel(school.source_file).labelClass}`}>Source</p>
              <p className={`text-xs font-semibold ${sourceLabel(school.source_file).valueClass}`}>
                {sourceLabel(school.source_file).label}
              </p>
            </div>
          </div>

          {/* What they do well */}
          <div className="bg-emerald-50 rounded-admin-md border border-emerald-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-admin-sm bg-emerald-100 flex items-center justify-center shrink-0">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 5.5l2.5 2.5 4.5-5" stroke="#059669" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">What They Do Well</span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {school.strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-admin-md bg-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-900/80 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pain points */}
          <div className="bg-amber-50 rounded-admin-md border border-amber-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-admin-sm bg-amber-100 flex items-center justify-center shrink-0">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1L10 9.5H1L5.5 1z" stroke="#D97706" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M5.5 4.5v2" stroke="#D97706" strokeWidth="1.3" strokeLinecap="round" />
                  <circle cx="5.5" cy="7.5" r="0.4" fill="#D97706" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Gaps / Pain Points</span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {school.pain_points.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-admin-md bg-amber-400 shrink-0" />
                  <span className="text-xs text-amber-900/80 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Software fit */}
          <div className="bg-blue-50 rounded-admin-md border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-admin-sm bg-blue-100 flex items-center justify-center shrink-0">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1l1.2 2.5L9.5 4l-2 1.9.5 2.6L5.5 7.2 3 8.5l.5-2.6L1.5 4l2.8-.5L5.5 1z" stroke="#2563EB" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Why {SITE_NAME} Fits</span>
            </div>
            <p className="text-xs text-blue-900/80 leading-relaxed">{school.software_fit_reason}</p>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatBadge({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-admin-surface rounded-admin-md border border-admin-border px-3.5 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm leading-none">{icon}</span>
        <span className="text-[10px] font-bold text-admin-faint uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-medium text-admin-text leading-snug">{value || "—"}</p>
    </div>
  );
}

// ── Add School Sidebar ────────────────────────────────────────────────────────

type NewSchoolForm = {
  name: string;
  state: string;
  location: string;
  website: string;
  schoolModel: string;
  grades: string;
  estimatedSize: string;
  tuitionSchedule: string;
  strengths: string;
  painPoints: string;
  softwareFitReason: string;
  priorityScore: number;
  confidence: string;
  isClosing: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

const EMPTY_FORM: NewSchoolForm = {
  name: "",
  state: "",
  location: "",
  website: "",
  schoolModel: "",
  grades: "",
  estimatedSize: "",
  tuitionSchedule: "",
  strengths: "",
  painPoints: "",
  softwareFitReason: "",
  priorityScore: 4,
  confidence: "",
  isClosing: false,
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
};

function AddSchoolSidebar({
  open,
  onClose,
  onSave,
  existingSchoolIds,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (school: School) => void;
  existingSchoolIds: Set<string>;
}) {
  const supabase = createClient();
  const [form, setForm] = useState<NewSchoolForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setForm(EMPTY_FORM);
        setError(null);
      });
    }
  }, [open]);

  function setField<K extends keyof NewSchoolForm>(key: K, value: NewSchoolForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.state.trim() || !form.location.trim() || !form.website.trim() || !form.schoolModel.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError(null);

    let schoolId = slugify(form.name.trim());
    if (!schoolId) schoolId = `school-${Date.now()}`;
    if (existingSchoolIds.has(schoolId)) {
      schoolId = `${schoolId}-${Date.now()}`;
    }

    const row = {
      school_id: schoolId,
      name: form.name.trim(),
      state: form.state.trim().toUpperCase(),
      location: form.location.trim(),
      website: form.website.trim(),
      school_model: form.schoolModel.trim(),
      grades: form.grades.trim(),
      estimated_size: form.estimatedSize.trim(),
      tuition_schedule: form.tuitionSchedule.trim(),
      strengths: parseLines(form.strengths),
      pain_points: parseLines(form.painPoints),
      software_fit_reason: form.softwareFitReason.trim(),
      priority_score: form.priorityScore,
      confidence: form.confidence.trim(),
      is_closing: form.isClosing,
      source_file: "manual",
      crm_status: "not_contacted" as CrmStatus,
      contact_name: form.contactName.trim(),
      contact_email: form.contactEmail.trim(),
      contact_phone: form.contactPhone.trim(),
      notes: form.notes.trim(),
      last_contacted_at: null,
    };

    const { data, error: insertError } = await supabase
      .from("schools")
      .insert(row)
      .select("*")
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onSave(data as School);
    onClose();
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-admin-surface border-l border-admin-border shadow-2xl z-50 flex flex-col">
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-admin-border">
          <div>
            <h2 className="text-base font-semibold text-admin-text">Add School</h2>
            <p className="text-xs text-admin-faint mt-0.5">Manually add a prospect to the CRM</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-admin-md flex items-center justify-center text-admin-faint hover:text-admin-muted hover:bg-admin-neutral-bg transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 flex flex-col gap-6">
            <div>
              <p className="text-[11px] font-bold text-admin-faint uppercase tracking-wider mb-3">Basic Info</p>
              <div className="flex flex-col gap-2.5">
                <Field label="School Name" value={form.name} onChange={(v) => setField("name", v)} placeholder="Ascend Micro School" required />
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="State" value={form.state} onChange={(v) => setField("state", v)} placeholder="CO" required />
                  <Field label="Location" value={form.location} onChange={(v) => setField("location", v)} placeholder="Colorado Springs, CO" required />
                </div>
                <Field label="Website" value={form.website} onChange={(v) => setField("website", v)} placeholder="https://example.org" required />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-admin-faint uppercase tracking-wider mb-3">Research Data</p>
              <div className="flex flex-col gap-2.5">
                <Field label="School Model" value={form.schoolModel} onChange={(v) => setField("schoolModel", v)} placeholder="Private microschool / hybrid" required />
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="Grades" value={form.grades} onChange={(v) => setField("grades", v)} placeholder="K-8" />
                  <Field label="Estimated Size" value={form.estimatedSize} onChange={(v) => setField("estimatedSize", v)} placeholder="~30 students" />
                </div>
                <Field label="Tuition / Schedule" value={form.tuitionSchedule} onChange={(v) => setField("tuitionSchedule", v)} placeholder="$3,500/year; 2 days/week" />
                <TextAreaField label="Strengths" value={form.strengths} onChange={(v) => setField("strengths", v)} placeholder="One item per line" rows={3} />
                <TextAreaField label="Pain Points" value={form.painPoints} onChange={(v) => setField("painPoints", v)} placeholder="One item per line" rows={3} />
                <TextAreaField label={`Why ${SITE_NAME} Fits`} value={form.softwareFitReason} onChange={(v) => setField("softwareFitReason", v)} placeholder="Brief fit rationale…" rows={3} />
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-admin-faint uppercase tracking-wider">Priority</label>
                    <AdminSelect
                      value={String(form.priorityScore)}
                      onChange={(e) => setField("priorityScore", parseInt(e.target.value, 10))}
                      triggerClassName="h-9 px-3 text-admin-text focus:outline-none focus:border-admin-accent/40 focus:ring-2 focus:ring-admin-accent/10 bg-admin-surface"
                      aria-label="Priority"
                    >
                      {[5, 4, 3, 2, 1].map((p) => (
                        <option key={p} value={p}>P{p} · {P_LABEL[p]}</option>
                      ))}
                    </AdminSelect>
                  </div>
                  <Field label="Confidence" value={form.confidence} onChange={(v) => setField("confidence", v)} placeholder="High" />
                </div>
                <label className="flex items-center gap-2 text-sm text-admin-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isClosing}
                    onChange={(e) => setField("isClosing", e.target.checked)}
                    className="rounded border-admin-border text-admin-accent focus:ring-admin-accent/20"
                  />
                  Mark as closing / winding down
                </label>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-admin-faint uppercase tracking-wider mb-3">Contact (optional)</p>
              <div className="flex flex-col gap-2.5">
                <Field label="Contact Name" value={form.contactName} onChange={(v) => setField("contactName", v)} placeholder="Sarah Johnson" />
                <Field label="Email" value={form.contactEmail} onChange={(v) => setField("contactEmail", v)} placeholder="sarah@school.org" type="email" />
                <Field label="Phone" value={form.contactPhone} onChange={(v) => setField("contactPhone", v)} placeholder="+1 (555) 000-0000" type="tel" />
                <TextAreaField label="Notes" value={form.notes} onChange={(v) => setField("notes", v)} placeholder="Any initial context…" rows={3} />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-admin-md px-3 py-2">{error}</p>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-admin-border bg-admin-surface px-6 py-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-admin-md text-sm font-semibold border border-admin-border text-admin-muted hover:bg-admin-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-10 rounded-admin-md text-sm font-semibold bg-admin-accent text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                    <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Saving…
                </>
              ) : "Add School"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 bg-admin-bg/40">
      <div className="w-14 h-14 rounded-2xl bg-admin-neutral-bg flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="#9CA3AF" strokeWidth="1.5" />
          <path d="M3 9h18M9 21V9" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-base font-semibold text-admin-faint">Select a school</p>
      <p className="text-sm text-admin-faint mt-1">Choose from the list on the left to view and edit details.</p>
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
  const [demoFilter, setDemoFilter] = useState(false);
  const [showAddSidebar, setShowAddSidebar] = useState(false);

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
    setSchools((prev) => {
      const updated = prev.map((s) => s.id === schoolId ? { ...s, ...updates } : s);
      if ("priority_score" in updates) {
        return updated.sort((a, b) => b.priority_score - a.priority_score);
      }
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const existingSchoolIds = useMemo(
    () => new Set(schools.map((s) => s.school_id)),
    [schools]
  );

  const handleAddSchool = useCallback((school: School) => {
    setSchools((prev) =>
      [school, ...prev].sort((a, b) => b.priority_score - a.priority_score)
    );
    setSelectedId(school.id);
  }, []);

  // Filter list
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return schools.filter((s) => {
      if (s.is_closing) return false;
      if (statusFilter && s.crm_status !== statusFilter) return false;
      if (demoFilter && !s.demo_slug) return false;
      if (q && !(
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.contact_name.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [schools, search, statusFilter, demoFilter]);

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

  const demoCount = useMemo(
    () => schools.filter((s) => !s.is_closing && s.demo_slug).length,
    [schools]
  );

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col overflow-hidden bg-admin-surface" style={{ fontFamily: "var(--font-poppins), Poppins, sans-serif" }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <header className="h-10 shrink-0 border-b border-admin-border bg-admin-surface flex items-center px-4 gap-4 z-20">
        {/* Pipeline summary pills */}
        {!loading && (
          <div className="flex items-center gap-2 ml-2">
            {CRM_STATUSES.filter((s) => pipelineCounts[s] > 0).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-admin-md border transition-all ${
                  statusFilter === s ? CRM[s].pill + " shadow-sm" : "border-admin-border text-admin-muted hover:border-admin-border"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-admin-md ${CRM[s].dot}`} />
                {pipelineCounts[s]}
              </button>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setShowAddSidebar(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-admin-md bg-admin-accent text-white text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add School
          </button>
          {!loading && (
            <span className="text-xs text-admin-faint">{schools.length} schools</span>
          )}
        </div>
      </header>

      {/* ── Main layout ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-72 xl:w-80 shrink-0 border-r border-admin-border flex flex-col overflow-hidden bg-admin-surface">

          {/* Search + filters */}
          <div className="shrink-0 p-3 border-b border-admin-border flex flex-col gap-2">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-faint" width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search schools, contacts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-admin-md border border-admin-border text-xs text-admin-text placeholder:text-admin-faint focus:outline-none focus:border-admin-accent/40 focus:ring-1 focus:ring-admin-accent/10 bg-admin-surface transition-all"
              />
            </div>

            <p className="text-[10px] text-admin-faint">{filtered.length} of {schools.length} schools</p>
          </div>

          {/* Status filter tabs */}
          <div className="shrink-0 flex flex-wrap border-b border-admin-border px-3 py-1 gap-x-4 gap-y-1">
            <button
              onClick={() => setStatusFilter("")}
              className={`text-[11px] font-medium py-2 border-b-2 transition-all ${
                statusFilter === "" ? "border-admin-accent text-admin-accent" : "border-transparent text-admin-faint hover:text-admin-muted"
              }`}
            >
              All
            </button>
            {CRM_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`text-[11px] font-medium py-2 border-b-2 transition-all flex items-center gap-1 ${
                  statusFilter === s ? "border-admin-accent text-admin-accent" : "border-transparent text-admin-faint hover:text-admin-muted"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-admin-md ${CRM[s].dot}`} />
                {CRM[s].label.replace(" 🎉", "")}
              </button>
            ))}
            <button
              onClick={() => setDemoFilter((v) => !v)}
              className={`text-[11px] font-medium py-2 border-b-2 transition-all flex items-center gap-1 ${
                demoFilter ? "border-admin-accent text-admin-accent" : "border-transparent text-admin-faint hover:text-admin-muted"
              }`}
            >
              <DemoMonitorIcon title="Demos created" />
              Demos created{demoCount > 0 ? ` (${demoCount})` : ""}
            </button>
          </div>

          {/* School list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <svg className="animate-spin text-admin-faint w-5 h-5" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                  <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            ) : error ? (
              <div className="p-4 text-xs text-red-500">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-admin-faint">No schools match your filters.</div>
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

        {/* ── Middle panel — CRM ───────────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          {selectedSchool ? (
            <CrmPanel school={selectedSchool} onSave={handleSave} />
          ) : (
            <EmptyState />
          )}
        </main>

        {/* ── Right panel — Research ───────────────────────────────────────── */}
        {selectedSchool && (
          <aside className="w-96 xl:w-[28rem] shrink-0 overflow-hidden flex flex-col">
            <ResearchPanel school={selectedSchool} />
          </aside>
        )}
      </div>

      <AddSchoolSidebar
        open={showAddSidebar}
        onClose={() => setShowAddSidebar(false)}
        onSave={handleAddSchool}
        existingSchoolIds={existingSchoolIds}
      />
    </div>
  );
}
