"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminDetailEmpty } from "@/components/admin/ui/AdminDetailEmpty";
import { AdminDetailHeader } from "@/components/admin/ui/AdminDetailHeader";
import { AdminDetailLayout } from "@/components/admin/ui/AdminDetailLayout";
import { AdminDetailSection } from "@/components/admin/ui/AdminDetailSection";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminFilterChip } from "@/components/admin/ui/AdminFilterChip";
import { AdminListItem } from "@/components/admin/ui/AdminListItem";
import { AdminListPanelHeader } from "@/components/admin/ui/AdminListPanelHeader";
import { AdminMasterDetail } from "@/components/admin/ui/AdminMasterDetail";
import { AdminPageState } from "@/components/admin/ui/AdminPageState";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import type { AdminStatusVariant } from "@/lib/admin-ui/admin-status-styles";
import { listSchoolDemos } from "@/data/school-demos";
import { demoRequestRoleLabel } from "@/lib/demo-request-roles";
import {
  FREE_TOOL_PLAN_NAMES,
  LEAD_MAGNET_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  isFreeToolPlanId,
  type LeadMagnet,
  type LeadStatus,
} from "@/lib/marketing/lead-magnets";
import { SITE_URL } from "@/lib/site";

type MarketingLead = {
  id: string;
  email: string;
  name: string | null;
  school_name: string | null;
  website_url: string | null;
  role: string | null;
  message: string | null;
  magnet: LeadMagnet;
  magnet_detail: string | null;
  source_path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  gclid: string | null;
  fbclid: string | null;
  first_landing_path: string | null;
  status: LeadStatus;
  demo_slug: string | null;
  admin_notes: string | null;
  created_at: string;
};

const STATUS_VARIANT: Record<LeadStatus, AdminStatusVariant> = {
  new: "scheduled",
  building: "warning",
  delivered: "success",
  booked: "completed",
  dead: "cancelled",
};

const MAGNET_FILTERS: LeadMagnet[] = ["custom_demo", "partial_booking", "tool_plan"];

/** A partial booking with no booking after an hour is worth a personal follow-up. */
const ABANDONED_AFTER_MS = 60 * 60 * 1000;

function isAbandoned(lead: MarketingLead) {
  return (
    lead.magnet === "partial_booking" &&
    lead.status === "new" &&
    Date.now() - Date.parse(lead.created_at) > ABANDONED_AFTER_MS
  );
}

function magnetDetailLabel(lead: MarketingLead) {
  if (lead.magnet === "tool_plan" && isFreeToolPlanId(lead.magnet_detail)) {
    return FREE_TOOL_PLAN_NAMES[lead.magnet_detail];
  }
  return lead.magnet_detail;
}

function previewEmailHref(lead: MarketingLead, demoUrl: string) {
  const first = lead.name?.split(/\s+/)[0] || "there";
  const school = lead.school_name || "your school";
  const subject = `Your MudKitchen preview for ${school} is ready`;
  const body = [
    `Hi ${first},`,
    "",
    `Your private MudKitchen preview for ${school} is ready:`,
    demoUrl,
    "",
    "Click through the website, the parent app and the admin portal. When you're ready to talk it through, you can book a time right from the preview.",
    "",
    "— The MudKitchen team",
  ].join("\n");
  return `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function CopyButton({ text, onCopied }: { text: string; onCopied: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <AdminButton
      variant="secondary"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => setCopied(true));
        onCopied();
      }}
    >
      {copied ? "Copied" : "Copy"}
    </AdminButton>
  );
}

/** Keyed by lead id, so switching leads starts from that lead's saved notes. */
function LeadNotes({ initial, onSave }: { initial: string; onSave: (notes: string) => void }) {
  const [draft, setDraft] = useState(initial);
  return (
    <textarea
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== initial) onSave(draft);
      }}
      rows={4}
      maxLength={5000}
      aria-label="Your notes"
      placeholder="Follow-ups, what they said, next step…"
      className="w-full rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text focus:border-admin-accent/40 focus:outline-none focus:ring-2 focus:ring-admin-accent/30"
    />
  );
}

export default function MarketingLeadsPage() {
  const supabase = useMemo(() => createClient(), []);
  const demos = useMemo(() => listSchoolDemos().sort((a, b) => a.schoolName.localeCompare(b.schoolName)), []);
  const [leads, setLeads] = useState<MarketingLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [magnetFilter, setMagnetFilter] = useState<LeadMagnet | "">("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("marketing_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) setError(error.message);
      else {
        setLeads((data ?? []) as MarketingLead[]);
        if (data?.length) setSelectedId(data[0].id);
      }
      setLoading(false);
    }
    void load();
  }, [supabase]);

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const update = useCallback(
    async (id: string, patch: Partial<Pick<MarketingLead, "status" | "demo_slug" | "admin_notes">>) => {
      const { error } = await supabase.from("marketing_leads").update(patch).eq("id", id);
      if (error) {
        alert("Update failed: " + error.message);
        return;
      }
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    },
    [supabase],
  );

  const filtered = leads.filter(
    (l) => (!magnetFilter || l.magnet === magnetFilter) && (!statusFilter || l.status === statusFilter),
  );

  const magnetCounts = leads.reduce(
    (acc, l) => {
      acc[l.magnet] = (acc[l.magnet] ?? 0) + 1;
      return acc;
    },
    {} as Record<LeadMagnet, number>,
  );
  const statusCounts = leads.reduce(
    (acc, l) => {
      acc[l.status] = (acc[l.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<LeadStatus, number>,
  );

  if (loading) return <AdminPageState variant="loading" />;
  if (error) return <AdminPageState variant="error" message={error} />;

  const selectedDemo = selected?.demo_slug ? demos.find((d) => d.slug === selected.demo_slug) : undefined;
  const selectedDemoUrl = selectedDemo ? `${SITE_URL}${selectedDemo.href}` : null;
  const buildPrompt = selected
    ? `Build a school demo for ${selected.school_name ?? "this school"} (${selected.website_url ?? "no website"}) using the school-demo-builder skill.`
    : "";

  const attributionRows = selected
    ? ([
        ["Source", selected.utm_source],
        ["Medium", selected.utm_medium],
        ["Campaign", selected.utm_campaign],
        ["Content", selected.utm_content],
        ["Term", selected.utm_term],
        ["Referrer", selected.referrer],
        ["Landing page", selected.first_landing_path],
        ["Google Ads click", selected.gclid ? "Yes" : null],
        ["Meta ad click", selected.fbclid ? "Yes" : null],
      ].filter(([, v]) => v) as [string, string][])
    : [];

  return (
    <AdminMasterDetail
      list={
        <>
          <AdminListPanelHeader>
            <div className="flex flex-wrap gap-1.5">
              {MAGNET_FILTERS.map((m) => (
                <AdminFilterChip
                  key={m}
                  label={LEAD_MAGNET_LABELS[m]}
                  count={magnetCounts[m]}
                  active={magnetFilter === m}
                  onClick={() => setMagnetFilter(magnetFilter === m ? "" : m)}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {LEAD_STATUSES.map((s) => (
                <AdminFilterChip
                  key={s}
                  label={LEAD_STATUS_LABELS[s]}
                  count={statusCounts[s]}
                  active={statusFilter === s}
                  onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                />
              ))}
            </div>
          </AdminListPanelHeader>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <AdminEmptyState message="No leads yet" />
            ) : (
              filtered.map((l) => (
                <AdminListItem
                  key={l.id}
                  selected={selectedId === l.id}
                  onClick={() => setSelectedId(l.id)}
                  title={l.name || l.email}
                  subtitle={`${LEAD_MAGNET_LABELS[l.magnet]}${l.school_name ? ` · ${l.school_name}` : ""}`}
                  badge={
                    isAbandoned(l) ? (
                      <AdminStatusBadge label="Follow up" variant="warning" />
                    ) : (
                      <AdminStatusBadge label={LEAD_STATUS_LABELS[l.status]} variant={STATUS_VARIANT[l.status]} />
                    )
                  }
                  footer={new Date(l.created_at).toLocaleString()}
                />
              ))
            )}
          </div>
        </>
      }
      detail={
        !selected ? (
          <AdminDetailEmpty message="Select a lead" />
        ) : (
          <AdminDetailLayout>
            <AdminDetailHeader
              title={selected.name || selected.email}
              subtitle={selected.school_name ?? LEAD_MAGNET_LABELS[selected.magnet]}
              actions={
                <AdminSelect
                  value={selected.status}
                  onChange={(e) => void update(selected.id, { status: e.target.value as LeadStatus })}
                  triggerClassName="bg-admin-surface text-admin-text focus:outline-none focus:border-admin-accent/40 focus:ring-2 focus:ring-admin-accent/30"
                  aria-label="Lead status"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {LEAD_STATUS_LABELS[s]}
                    </option>
                  ))}
                </AdminSelect>
              }
            />

            {isAbandoned(selected) ? (
              <p className="rounded-admin-md border border-admin-warning-border bg-admin-warning-bg px-3 py-2 text-sm text-admin-warning">
                Started booking a demo but never picked a time. Worth a personal email.
              </p>
            ) : null}

            <AdminDetailSection title="Contact">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-admin-muted">Email</dt>
                <dd>
                  <a href={`mailto:${selected.email}`} className="text-admin-accent hover:underline">
                    {selected.email}
                  </a>
                </dd>
                {selected.role ? (
                  <>
                    <dt className="text-admin-muted">Where today</dt>
                    <dd>{demoRequestRoleLabel(selected.role)}</dd>
                  </>
                ) : null}
                {selected.website_url ? (
                  <>
                    <dt className="text-admin-muted">Website</dt>
                    <dd className="truncate">
                      <a
                        href={selected.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-admin-accent hover:underline"
                      >
                        {selected.website_url}
                      </a>
                    </dd>
                  </>
                ) : null}
                <dt className="text-admin-muted">Lead type</dt>
                <dd>{LEAD_MAGNET_LABELS[selected.magnet]}</dd>
                {magnetDetailLabel(selected) ? (
                  <>
                    <dt className="text-admin-muted">{selected.magnet === "tool_plan" ? "Tool" : "Where"}</dt>
                    <dd>{magnetDetailLabel(selected)}</dd>
                  </>
                ) : null}
                {selected.source_path ? (
                  <>
                    <dt className="text-admin-muted">Page</dt>
                    <dd>{selected.source_path}</dd>
                  </>
                ) : null}
              </dl>
            </AdminDetailSection>

            {selected.message ? (
              <AdminDetailSection title={selected.magnet === "custom_demo" ? "Biggest headache" : "Notes from the form"}>
                <p className="whitespace-pre-wrap text-sm text-admin-text">{selected.message}</p>
              </AdminDetailSection>
            ) : null}

            {selected.magnet === "custom_demo" ? (
              <AdminDetailSection title="Custom preview">
                <div className="space-y-3 text-sm">
                  <p className="text-admin-muted">
                    Promised within 2 business days of {new Date(selected.created_at).toLocaleDateString()}.
                  </p>
                  <div>
                    <p className="mb-1 text-admin-muted">1. Build it (prompt for the agent)</p>
                    <div className="flex items-start gap-2">
                      <code className="flex-1 rounded-admin-md bg-admin-neutral-bg px-2 py-1.5 text-xs">{buildPrompt}</code>
                      <CopyButton
                        key={selected.id}
                        text={buildPrompt}
                        onCopied={() => {
                          if (selected.status === "new") void update(selected.id, { status: "building" });
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-admin-muted" htmlFor="lead-demo-slug">
                      2. Link the finished demo
                    </label>
                    <AdminSelect
                      id="lead-demo-slug"
                      value={selected.demo_slug ?? ""}
                      onChange={(e) => void update(selected.id, { demo_slug: e.target.value || null })}
                      triggerClassName="bg-admin-surface text-admin-text"
                      aria-label="Linked demo"
                    >
                      <option value="">Not built yet</option>
                      {demos.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {d.schoolName}
                        </option>
                      ))}
                    </AdminSelect>
                  </div>
                  {selectedDemoUrl ? (
                    <div>
                      <p className="mb-1 text-admin-muted">3. Send it</p>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={selectedDemo?.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 items-center rounded-admin-md border border-admin-border bg-admin-surface px-3 text-sm font-medium text-admin-text hover:bg-admin-neutral-bg"
                        >
                          Open demo
                        </a>
                        <a
                          href={previewEmailHref(selected, selectedDemoUrl)}
                          onClick={() => {
                            if (selected.status === "new" || selected.status === "building") {
                              void update(selected.id, { status: "delivered" });
                            }
                          }}
                          className="inline-flex h-9 items-center rounded-admin-md border border-admin-accent bg-admin-accent px-3 text-sm font-medium text-white hover:bg-admin-accent-hover"
                        >
                          Draft preview email
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>
              </AdminDetailSection>
            ) : null}

            {attributionRows.length ? (
              <AdminDetailSection title="First touch">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {attributionRows.map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-admin-muted">{label}</dt>
                      <dd className="truncate">{value}</dd>
                    </div>
                  ))}
                </dl>
              </AdminDetailSection>
            ) : null}

            <AdminDetailSection title="Your notes">
              <LeadNotes
                key={selected.id}
                initial={selected.admin_notes ?? ""}
                onSave={(notes) => void update(selected.id, { admin_notes: notes || null })}
              />
            </AdminDetailSection>

            <p className="text-xs text-admin-faint">Captured {new Date(selected.created_at).toLocaleString()}</p>
          </AdminDetailLayout>
        )
      }
    />
  );
}
