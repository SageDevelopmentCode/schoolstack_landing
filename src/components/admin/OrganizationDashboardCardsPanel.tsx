"use client";

import { useState } from "react";
import OrganizationFeatureAnnouncementsPanel from "@/components/admin/OrganizationFeatureAnnouncementsPanel";
import OrganizationParentFeatureAnnouncementsPanel from "@/components/admin/OrganizationParentFeatureAnnouncementsPanel";

type DashboardCardsAudience = "admin" | "parent";

type OrganizationDashboardCardsPanelProps = {
  organizationId: string;
  organizationName: string;
};

const AUDIENCE_TABS: { id: DashboardCardsAudience; label: string }[] = [
  { id: "admin", label: "Admin" },
  { id: "parent", label: "Parent" },
];

export default function OrganizationDashboardCardsPanel({
  organizationId,
  organizationName,
}: OrganizationDashboardCardsPanelProps) {
  const [audience, setAudience] = useState<DashboardCardsAudience>("admin");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {AUDIENCE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setAudience(tab.id)}
            className={`rounded-admin-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              audience === tab.id
                ? "border-admin-accent bg-admin-accent-soft text-admin-accent"
                : "border-admin-border bg-admin-bg text-admin-muted hover:bg-admin-neutral-bg"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {audience === "admin" ? (
        <OrganizationFeatureAnnouncementsPanel
          organizationId={organizationId}
          organizationName={organizationName}
        />
      ) : (
        <OrganizationParentFeatureAnnouncementsPanel
          organizationId={organizationId}
          organizationName={organizationName}
        />
      )}
    </div>
  );
}
