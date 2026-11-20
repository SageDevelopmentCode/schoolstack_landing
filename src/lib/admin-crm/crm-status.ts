/**
 * CRM pipeline statuses for prospect schools (`public.schools.crm_status`).
 * Shared by the CRM page (/admin/research) and the demo outreach board (/admin/demos).
 * Keep in sync with the `schools_crm_status_check` constraint (20261169_add_crm_outreach_touches.sql).
 */

export type CrmStatus =
  | "not_contacted"
  | "contacted"
  | "followed_up"
  | "replied"
  | "nurturing"
  | "demo_scheduled"
  | "proposal_sent"
  | "not_interested"
  | "won";

export type CrmStatusStyle = { label: string; dot: string; pill: string };

/** Pipeline order: object key order drives filter chips and dropdowns. */
export const CRM: Record<CrmStatus, CrmStatusStyle> = {
  not_contacted:  { label: "Not Contacted",  dot: "bg-admin-faint",  pill: "bg-admin-neutral-bg text-admin-muted border-admin-border" },
  contacted:      { label: "Contacted",      dot: "bg-blue-400",     pill: "bg-blue-50 text-blue-700 border-blue-200" },
  followed_up:    { label: "Followed Up",    dot: "bg-sky-400",      pill: "bg-sky-50 text-sky-700 border-sky-200" },
  replied:        { label: "Replied",        dot: "bg-teal-400",     pill: "bg-teal-50 text-teal-700 border-teal-200" },
  nurturing:      { label: "Nurturing ❤️",   dot: "bg-rose-400",     pill: "bg-rose-50 text-rose-700 border-rose-200" },
  demo_scheduled: { label: "Call Booked",    dot: "bg-violet-400",   pill: "bg-violet-50 text-violet-700 border-violet-200" },
  proposal_sent:  { label: "Proposal Sent",  dot: "bg-amber-400",    pill: "bg-amber-50 text-amber-700 border-amber-200" },
  not_interested: { label: "Not Interested", dot: "bg-red-400",      pill: "bg-red-50 text-red-600 border-red-200" },
  won:            { label: "Won 🎉",         dot: "bg-emerald-400",  pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export const CRM_STATUSES = Object.keys(CRM) as CrmStatus[];

export function isCrmStatus(value: unknown): value is CrmStatus {
  return typeof value === "string" && value in CRM;
}

/** Label without the decorative emoji (for filters, toasts and selects). */
export function crmStatusLabel(status: CrmStatus) {
  return CRM[status].label.replace(" 🎉", "").replace(" ❤️", "");
}

/**
 * How far along the pipeline a status is, for "only move forward" automation.
 * Terminal / side states (nurturing, not_interested, won) rank high so automation never overrides them.
 */
export const CRM_STATUS_RANK: Record<CrmStatus, number> = {
  not_contacted: 0,
  contacted: 1,
  followed_up: 2,
  replied: 3,
  nurturing: 4,
  demo_scheduled: 5,
  proposal_sent: 6,
  not_interested: 7,
  won: 8,
};
