"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OutreachPlan } from "@/data/outreach/types";
import { crmStatusLabel, type CrmStatus } from "@/lib/admin-crm/crm-status";
import { completedOutreachSteps, type DemoOutreach } from "@/lib/admin-crm/demo-outreach-types";
import { letterMailedAt } from "@/lib/admin-crm/outreach-letter";
import {
  FUNNEL_MAIN_STAGES,
  FUNNEL_SIDE_STAGES,
  FUNNEL_STAGE_LABEL,
  funnelCounts,
  outreachJourney,
  type FunnelStage,
  type OutreachJourney,
} from "@/lib/admin-crm/outreach-journey";
import {
  compareSchools,
  EMPTY_OUTREACH_LOG,
  type NewSchoolInput,
  type ResearchSchool,
  type ResearchWorkspaceData,
  type SchoolOutreachLog,
  type SchoolPatch,
} from "@/lib/admin-crm/research-types";
import { adminToast } from "@/lib/school-admin/admin-toast";
import { SCHOOL_TRAITS, matchesTraits, parseTraitsParam, type SchoolTrait } from "./research-ui";

/** List scopes besides a single funnel lane. */
export type ListScope = "today" | "pipeline" | "all";
export type ListFilter = ListScope | FunnelStage;

const ALL_STAGES = new Set<string>([...FUNNEL_MAIN_STAGES, ...FUNNEL_SIDE_STAGES]);
const OUT_OF_PIPELINE = new Set<FunnelStage>(["not_started", "needs_demo"]);

export function isListFilter(value: string | null): value is ListFilter {
  return value === "today" || value === "pipeline" || value === "all" || (value !== null && ALL_STAGES.has(value));
}

export function listFilterLabel(filter: ListFilter): string {
  if (filter === "today") return "To do today";
  if (filter === "pipeline") return "In the pipeline";
  if (filter === "all") return "All schools";
  return FUNNEL_STAGE_LABEL[filter];
}

export type WorkspaceRow = {
  school: ResearchSchool;
  plan: OutreachPlan | null;
  log: SchoolOutreachLog;
  journey: OutreachJourney;
};

type ApiError = Error & { status?: number };

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok || !json) {
    const error = new Error(json?.error ?? `Request failed (${res.status})`) as ApiError;
    error.status = res.status;
    throw error;
  }
  return json;
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

/** Writes the "Has" filters to the URL (`?has=demo,letter`) without a navigation. */
function writeTraitsParam(traits: readonly SchoolTrait[]) {
  const url = new URL(window.location.href);
  if (traits.length > 0) url.searchParams.set("has", traits.join(","));
  else url.searchParams.delete("has");
  window.history.replaceState(window.history.state, "", url.toString());
}

/** Writes filter + selection to the URL without a navigation (no server re-render, no history entry). */
function writeParams(filter: ListFilter, schoolId: string | null) {
  const url = new URL(window.location.href);
  url.searchParams.delete("demo");
  if (filter === "pipeline") url.searchParams.delete("stage");
  else url.searchParams.set("stage", filter);
  if (schoolId) url.searchParams.set("id", schoolId);
  else url.searchParams.delete("id");
  window.history.replaceState(window.history.state, "", url.toString());
}

function buildRow(
  school: ResearchSchool,
  outreach: Record<string, SchoolOutreachLog>,
  plans: Record<string, OutreachPlan>,
  now: Date,
): WorkspaceRow {
  // Plans come from the server (they carry private snapshot tokens), never from the registry module.
  const plan = school.demo_slug ? (plans[school.demo_slug] ?? null) : null;
  const log = outreach[school.id] ?? EMPTY_OUTREACH_LOG;
  const journey = outreachJourney({
    plan,
    completed: completedOutreachSteps(log.emails),
    crmStatus: school.crm_status,
    hasDemo: Boolean(school.demo_slug),
    letterMailedAt: letterMailedAt(log.touches),
    letterReadyAt: school.letter_ready_at,
    now,
  });
  return { school, plan, log, journey };
}

/** Work you can do today first, then follow-ups coming soon, then priority. */
function compareRows(a: WorkspaceRow, b: WorkspaceRow): number {
  if (a.journey.actionable !== b.journey.actionable) return a.journey.actionable ? -1 : 1;
  if (a.journey.due !== b.journey.due) return a.journey.due ? -1 : 1;
  const aDue = a.journey.next?.dueAt ? Date.parse(a.journey.next.dueAt) : Infinity;
  const bDue = b.journey.next?.dueAt ? Date.parse(b.journey.next.dueAt) : Infinity;
  if (aDue !== bDue) return aDue - bDue;
  return compareSchools(a.school, b.school);
}

export function useResearchWorkspaceModel(initial: ResearchWorkspaceData, initialLoadError: string | null) {
  const [schools, setSchools] = useState<ResearchSchool[]>(initial.schools);
  const [outreach, setOutreach] = useState<Record<string, SchoolOutreachLog>>(initial.outreach);
  const [plans, setPlans] = useState<Record<string, OutreachPlan>>(initial.plans);
  const [loadError, setLoadError] = useState<string | null>(initialLoadError);
  const [filter, setFilterState] = useState<ListFilter>("pipeline");
  const [search, setSearch] = useState("");
  const [traits, setTraitsState] = useState<SchoolTrait[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);
  // Recomputed on refresh and after each change, so "due today" stays honest without a ticking clock.
  const [now, setNow] = useState(() => new Date());

  // Read filter + selection from the URL once (?stage=, ?id=, or ?demo=<slug> from the Discord alert).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stage = params.get("stage");
    const id = params.get("id");
    const demo = params.get("demo");
    const has = parseTraitsParam(params.get("has"));
    queueMicrotask(() => {
      if (isListFilter(stage)) setFilterState(stage);
      if (has.length > 0) setTraitsState(has);
      const byDemo = demo ? initial.schools.find((s) => s.demo_slug === demo) : undefined;
      const match = byDemo ?? (id ? initial.schools.find((s) => s.id === id) : undefined);
      if (match) {
        setSelectedId(match.id);
        if (byDemo) setFilterState("all");
      }
    });
  }, [initial.schools]);

  const rows = useMemo(() => schools.map((s) => buildRow(s, outreach, plans, now)), [schools, outreach, plans, now]);
  const counts = useMemo(() => funnelCounts(rows.map((r) => r.journey)), [rows]);
  const todayCount = useMemo(() => rows.filter((r) => r.journey.actionable).length, [rows]);
  const pipelineCount = useMemo(() => rows.filter((r) => !OUT_OF_PIPELINE.has(r.journey.stage)).length, [rows]);

  // Scope / lane + search, before the "Has" filters (so each chip can count what it would show).
  const scoped = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "today" && !r.journey.actionable) return false;
      if (filter === "pipeline" && OUT_OF_PIPELINE.has(r.journey.stage)) return false;
      if (filter !== "today" && filter !== "pipeline" && filter !== "all" && r.journey.stage !== filter) return false;
      if (!q) return true;
      const s = r.school;
      return [s.name, s.location, s.state, s.contact_name, s.notes, s.demo_slug ?? ""].some((v) => v.toLowerCase().includes(q));
    });
  }, [rows, filter, search]);

  const filtered = useMemo(() => scoped.filter((r) => matchesTraits(r, traits)).sort(compareRows), [scoped, traits]);

  /** For each "Has" chip: how many schools you'd see with it on (alongside the chips already on). */
  const traitCounts = useMemo(
    () =>
      Object.fromEntries(
        SCHOOL_TRAITS.map((t) => [t, scoped.filter((r) => matchesTraits(r, traits.includes(t) ? traits : [...traits, t])).length]),
      ) as Record<SchoolTrait, number>,
    [scoped, traits],
  );

  const toggleTrait = useCallback(
    (trait: SchoolTrait) => {
      const next = traits.includes(trait) ? traits.filter((t) => t !== trait) : SCHOOL_TRAITS.filter((t) => t === trait || traits.includes(t));
      setTraitsState(next);
      writeTraitsParam(next);
    },
    [traits],
  );

  const clearTraits = useCallback(() => {
    setTraitsState([]);
    writeTraitsParam([]);
  }, []);

  const selected = useMemo(() => {
    const explicit = selectedId ? rows.find((r) => r.school.id === selectedId) : undefined;
    return explicit ?? filtered[0] ?? null;
  }, [rows, filtered, selectedId]);

  const setFilter = useCallback(
    (next: ListFilter) => {
      setFilterState(next);
      writeParams(next, selectedId);
    },
    [selectedId],
  );

  const select = useCallback(
    (id: string) => {
      setSelectedId(id);
      writeParams(filter, id);
    },
    [filter],
  );

  const flash = useCallback((id: string) => {
    setFlashId(id);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(null), 1600);
  }, []);
  useEffect(() => () => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
  }, []);

  const replaceSchool = useCallback((school: ResearchSchool) => {
    setSchools((prev) => prev.map((s) => (s.id === school.id ? school : s)).sort(compareSchools));
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────

  const hasSchools = schools.length > 0;
  const refresh = useCallback(
    (opts: { quiet?: boolean } = {}): Promise<void> => {
      const attempt = async (quiet: boolean): Promise<void> => {
        setRefreshing(true);
        try {
          const data = await requestJson<ResearchWorkspaceData>("/api/admin/research", { method: "GET" });
          setSchools(data.schools);
          setOutreach(data.outreach);
          setPlans(data.plans);
          setLoadError(null);
          setNow(new Date());
          setLastUpdatedAt(Date.now());
          adminToast.dismiss("research-refresh-error");
          if (!quiet) adminToast.success("CRM refreshed.", { id: "research-refresh" });
        } catch (error) {
          if (!hasSchools) setLoadError(message(error));
          else if (!quiet) {
            adminToast.error("Couldn't refresh the CRM.", {
              id: "research-refresh-error",
              description: "You're still seeing the previous list.",
              action: { label: "Retry", onClick: () => void attempt(false) },
            });
          }
        } finally {
          setRefreshing(false);
        }
      };
      return attempt(opts.quiet ?? false);
    },
    [hasSchools],
  );

  // Silent refresh when the tab regains focus (another admin may have sent something).
  useEffect(() => {
    let last = Date.now();
    const onFocus = () => {
      if (Date.now() - last < 60_000) return;
      last = Date.now();
      void refresh({ quiet: true });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  // ── Saving ─────────────────────────────────────────────────────────────────

  const saveSchool = useCallback(
    (
      school: ResearchSchool,
      patch: SchoolPatch,
      copy: { key: string; success: string; description?: string; error: string },
    ): Promise<boolean> => {
      const errorId = `research-${copy.key}-error-${school.id}`;
      const attempt = async (): Promise<boolean> => {
        setPendingKey(`${copy.key}:${school.id}`);
        try {
          const { school: saved, plan } = await requestJson<{ school: ResearchSchool; plan: OutreachPlan | null }>(
            `/api/admin/research/schools/${encodeURIComponent(school.id)}`,
            { method: "PATCH", body: JSON.stringify(patch) },
          );
          if (plan && saved.demo_slug) setPlans((prev) => ({ ...prev, [saved.demo_slug as string]: plan }));
          replaceSchool(saved);
          setNow(new Date());
          flash(school.id);
          adminToast.dismiss(errorId);
          adminToast.success(copy.success, { id: `research-${copy.key}-${school.id}`, description: copy.description });
          return true;
        } catch (error) {
          adminToast.error(copy.error, {
            id: errorId,
            description: `${message(error)} Nothing was changed.`,
            action: { label: "Retry", onClick: () => void attempt() },
          });
          return false;
        } finally {
          setPendingKey(null);
        }
      };
      return attempt();
    },
    [flash, replaceSchool],
  );

  const setStatus = useCallback(
    (school: ResearchSchool, status: CrmStatus) => {
      if (status === school.crm_status) return Promise.resolve(true);
      return saveSchool(school, { crm_status: status }, {
        key: "status",
        success: `${school.name} moved to ${crmStatusLabel(status)}.`,
        description:
          status === "replied" || status === "demo_scheduled" || status === "proposal_sent"
            ? "The follow-up sequence stops here."
            : undefined,
        error: `Couldn't change ${school.name}'s status.`,
      });
    },
    [saveSchool],
  );

  /** Applies the outreach a send / social / touch API returned. */
  const applyOutreach = useCallback(
    (schoolId: string, next: DemoOutreach) => {
      setOutreach((prev) => ({ ...prev, [schoolId]: { emails: next.emails, touches: next.touches } }));
      setSchools((prev) =>
        prev.map((s) =>
          s.id === schoolId
            ? {
                ...s,
                crm_status: next.crmStatus,
                last_contacted_at: next.lastContactedAt,
                next_follow_up_at: next.nextFollowUpAt,
                contact_email: s.contact_email || next.contactEmail,
              }
            : s,
        ),
      );
      setNow(new Date());
      flash(schoolId);
    },
    [flash],
  );

  const addSchool = useCallback(
    async (input: NewSchoolInput): Promise<boolean> => {
      setPendingKey("add-school");
      try {
        const { school } = await requestJson<{ school: ResearchSchool }>("/api/admin/research/schools", {
          method: "POST",
          body: JSON.stringify(input),
        });
        setSchools((prev) => [school, ...prev].sort(compareSchools));
        setFilterState("all");
        setSelectedId(school.id);
        writeParams("all", school.id);
        flash(school.id);
        adminToast.dismiss("research-add-error");
        adminToast.success(`${school.name} added.`, { id: "research-add", description: "It's in All schools as Not started." });
        return true;
      } catch (error) {
        adminToast.error("Couldn't add the school.", {
          id: "research-add-error",
          description: `${message(error)} Nothing was saved.`,
        });
        return false;
      } finally {
        setPendingKey(null);
      }
    },
    [flash],
  );

  // ── Header status line (data only) ─────────────────────────────────────────

  const statusLine = useMemo(() => {
    const due = rows.filter((r) => r.journey.due).length;
    const ready = rows.filter((r) => r.journey.actionable && !r.journey.due).length;
    const waiting = rows.filter((r) => r.journey.next && !r.journey.actionable).length;
    const replied = counts.replied.total + counts.call_booked.total + counts.proposal.total;
    const parts = [
      due ? `${due} follow-up${due === 1 ? "" : "s"} due` : null,
      ready ? `${ready} ready to send` : null,
      waiting ? `${waiting} waiting` : null,
      replied ? `${replied} in conversation` : null,
      counts.needs_plan.total ? `${counts.needs_plan.total} need${counts.needs_plan.total === 1 ? "s" : ""} a plan` : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : `${schools.length} schools, nothing to send today`;
  }, [rows, counts, schools.length]);

  return {
    rows,
    filtered,
    selected,
    counts,
    todayCount,
    pipelineCount,
    filter,
    setFilter,
    search,
    setSearch,
    traits,
    traitCounts,
    toggleTrait,
    clearTraits,
    select,
    loadError,
    refreshing,
    lastUpdatedAt,
    refresh,
    pendingKey,
    flashId,
    saveSchool,
    setStatus,
    applyOutreach,
    addSchool,
    statusLine,
  };
}

export type ResearchWorkspaceModel = ReturnType<typeof useResearchWorkspaceModel>;
