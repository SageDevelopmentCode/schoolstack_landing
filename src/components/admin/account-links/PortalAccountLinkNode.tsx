import type { PortalRolePillars } from "@/lib/auth/organization-portal-account-links";

function PillarChip({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  if (!active) return null;

  return (
    <span className="inline-flex rounded-full border border-admin-border bg-admin-neutral-bg px-2 py-0.5 text-[10px] font-medium text-admin-muted">
      {label}
    </span>
  );
}

export type PortalAccountLinkNodeProps = {
  email: string;
  pillars: PortalRolePillars;
  isPrimary?: boolean;
  compact?: boolean;
};

export function PortalAccountLinkNode({
  email,
  pillars,
  isPrimary = false,
  compact = false,
}: PortalAccountLinkNodeProps) {
  return (
    <div
      className={[
        "min-w-0 rounded-admin-md border bg-admin-surface px-3 py-2",
        isPrimary
          ? "border-admin-accent/50 shadow-sm"
          : "border-admin-border",
        compact ? "max-w-[200px]" : "max-w-[240px]",
      ].join(" ")}
    >
      <p
        className={[
          "truncate font-mono text-admin-text",
          compact ? "text-[11px]" : "text-xs",
        ].join(" ")}
        title={email}
      >
        {email}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        <PillarChip label="School admin" active={pillars.schoolAdmin} />
        <PillarChip label="Staff" active={pillars.staffPortal} />
        <PillarChip label="Family" active={pillars.familyPortal} />
      </div>
    </div>
  );
}
