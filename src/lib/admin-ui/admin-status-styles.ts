export type DemoRequestStatus = "scheduled" | "cancelled" | "completed";

export type AdminStatusVariant =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "neutral"
  | "success"
  | "warning"
  | "error";

const STATUS_STYLES: Record<AdminStatusVariant, string> = {
  scheduled:
    "bg-admin-accent-soft text-admin-accent border-admin-accent/20",
  completed:
    "bg-admin-success-bg text-admin-success border-admin-success-border",
  cancelled:
    "bg-admin-neutral-bg text-admin-neutral border-admin-neutral-border",
  neutral:
    "bg-admin-neutral-bg text-admin-neutral border-admin-neutral-border",
  success:
    "bg-admin-success-bg text-admin-success border-admin-success-border",
  warning:
    "bg-admin-warning-bg text-admin-warning border-admin-warning-border",
  error: "bg-admin-error-bg text-admin-error border-admin-error-border",
};

export function adminStatusBadgeClassName(variant: AdminStatusVariant) {
  return STATUS_STYLES[variant];
}

export const DEMO_REQUEST_STATUS: Record<
  DemoRequestStatus,
  { label: string; variant: AdminStatusVariant }
> = {
  scheduled: { label: "Scheduled", variant: "scheduled" },
  completed: { label: "Completed", variant: "completed" },
  cancelled: { label: "Cancelled", variant: "cancelled" },
};

export type TicketStatus = "open" | "in_progress" | "completed" | "cancelled";

export const TICKET_STATUS: Record<
  TicketStatus,
  { label: string; variant: AdminStatusVariant }
> = {
  open: { label: "Open", variant: "scheduled" },
  in_progress: { label: "In progress", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "cancelled" },
};
